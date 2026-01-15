import axios from 'axios';

export const API_URL = '/api';
export const IMAGE_BASE_URL = '/uploads/products/';

// Hàm xử lý URL ảnh để tránh lỗi Mixed Content (HTTP trên HTTPS)
// Chuyển đổi các URL tuyệt đối http://localhost thành đường dẫn tương đối để chạy qua Proxy
export const getSafeImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200x200';

    // Nếu là URL tuyệt đối
    if (url.startsWith('http')) {
        // Chỉ xử lý nếu là link localhost (từ DB cũ) hoặc link nport (từ frontend hiện tại)
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('nport.link')) {
            const parts = url.split('/');
            const fileName = parts[parts.length - 1];
            return `${IMAGE_BASE_URL}${fileName}`;
        }
        // Các URL bên ngoài khác (VD: Shopee, ảnh từ trang khác) thì giữ nguyên để load trực tiếp
        return url;
    }

    // Nếu là đường dẫn tương đối
    // Trường hợp đã có sẵn prefix uploads/products/
    if (url.includes('uploads/products/')) {
        return url.startsWith('/') ? url : `/${url}`;
    }

    // Trường hợp chỉ là tên file
    return `${IMAGE_BASE_URL}${url}`;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Tự động thêm token vào headers
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi 401 (Unauthorized) - auto logout
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            // Chỉ redirect nếu không phải đang ở trang login/register (tránh redirect khi đăng nhập thất bại)
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/auth/register.php', userData),
    login: (credentials) => api.post('/auth/login.php', credentials),
    verify: () => api.get('/auth/verify.php'),
    logout: () => api.post('/auth/logout.php')
};

export const productsAPI = {
    getAll: () => api.get('/products/get_all.php'),
    create: (product) => api.post('/products/create.php', product),
    update: (id, product) => api.put('/products/update.php', { id, ...product }),
    delete: (id) => api.delete('/products/delete.php', { data: { id } })
};

// API cho upload ảnh (sử dụng FormData)
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        return axios.post(`${API_URL}/upload/image.php`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export const ordersAPI = {
    getAll: () => api.get('/orders/get_all.php'),
    getMyOrders: () => api.get('/orders/my_orders.php'),
    create: (orderData) => api.post('/orders/create.php', orderData),
    updateStatus: (id, status) => api.put('/orders/update_status.php', { id, status }),
    updateInfo: (orderData) => api.put('/orders/update_info.php', orderData),
    cancelMyOrder: (id) => api.post('/orders/cancel_my_order.php', { id })
};

export const usersAPI = {
    getAll: () => api.get('/users/get_all.php'),
    update: (id, userData) => api.put('/users/update.php', { id, ...userData }),
    updateProfile: (userData) => api.put('/users/update_profile.php', userData),
    delete: (id) => api.delete('/users/delete.php', { data: { id } })
};

export default api;