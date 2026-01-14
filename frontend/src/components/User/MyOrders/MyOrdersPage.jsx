import React, { useState, useEffect } from 'react';
import { ordersAPI, IMAGE_BASE_URL } from '../../../services/api';
import { toast } from 'react-toastify';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        note: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const fetchMyOrders = async () => {
        setLoading(true);
        try {
            const response = await ordersAPI.getMyOrders();
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const handleEditClick = (order) => {
        setEditingOrder(order);

        // Parse combined shipping_address string back to components
        // Format: "FullName - Address (Ghi chú: Note)"
        let fullName = '';
        let address = '';
        let note = '';

        const addressParts = order.shipping_address.split(' - ');
        if (addressParts.length >= 2) {
            fullName = addressParts[0];
            const remaining = addressParts.slice(1).join(' - ');

            if (remaining.includes(' (Ghi chú: ')) {
                const noteParts = remaining.split(' (Ghi chú: ');
                address = noteParts[0];
                note = noteParts[1].replace(')', '');
            } else {
                address = remaining;
            }
        } else {
            // Fallback
            address = order.shipping_address;
        }

        setEditFormData({
            full_name: fullName,
            phone: order.phone,
            address: address,
            note: note
        });
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await ordersAPI.updateInfo({
                order_id: editingOrder.id,
                ...editFormData
            });
            if (response.data.success) {
                toast.success('Cập nhật thông tin đơn hàng thành công!');
                setIsEditing(false);
                fetchMyOrders(); // Tải lại danh sách
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': { text: 'Chờ xác nhận', class: 'status-pending' },
            'processing': { text: 'Đang xử lý', class: 'status-processing' },
            'completed': { text: 'Đã hoàn thành', class: 'status-completed' },
            'cancelled': { text: 'Đã hủy', class: 'status-cancelled' }
        };
        return statusMap[status] || { text: status, class: '' };
    };

    return (
        <div className="my-orders-page">
            <Header />
            <div className="container orders-container">
                <div className="orders-header">
                    <h2>Đơn hàng của tôi</h2>
                    <p>Theo dõi và quản lý lịch sử mua hàng của bạn</p>
                </div>

                {loading ? (
                    <div className="loading-orders">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-orders">
                        <span className="empty-icon">🛒</span>
                        <p>Bạn chưa có đơn hàng nào.</p>
                        <button className="go-shopping-btn" onClick={() => window.location.href = '/'}>
                            Mua sắm ngay
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-item-card">
                                <div className="order-item-header">
                                    <div className="order-info">
                                        <span className="order-id">Mã đơn: #{order.id}</span>
                                        <span className="order-date">Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className={`order-status ${getStatusText(order.status).class}`}>
                                        {getStatusText(order.status).text}
                                    </div>
                                </div>

                                <div className="order-products">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="product-mini-item">
                                            <img
                                                src={item.image_url.includes('http') ? item.image_url : `${IMAGE_BASE_URL}${item.image_url}`}
                                                alt={item.product_name}
                                            />
                                            <div className="product-mini-info">
                                                <h4>{item.product_name}</h4>
                                                <span>x{item.quantity}</span>
                                            </div>
                                            <div className="product-mini-price">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-item-footer">
                                    <div className="shipping-info">
                                        <span>📍 {order.shipping_address}</span>
                                        <br />
                                        <span>📞 {order.phone}</span>
                                    </div>
                                    <div className="order-actions">
                                        <div className="order-total-block">
                                            <span className="total-label">Thành tiền:</span>
                                            <span className="total-value">{formatPrice(order.total_amount)}</span>
                                        </div>
                                        {order.status === 'pending' && (
                                            <button
                                                className="edit-order-btn"
                                                onClick={() => handleEditClick(order)}
                                            >
                                                Sửa thông tin
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Sửa đơn hàng */}
            {isEditing && (
                <div className="edit-order-modal">
                    <div className="modal-content">
                        <h3>Sửa thông tin nhận hàng</h3>
                        <form onSubmit={handleUpdateOrder}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={editFormData.full_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={editFormData.note}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Hủy</button>
                                <button type="submit" className="save-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default MyOrdersPage;
