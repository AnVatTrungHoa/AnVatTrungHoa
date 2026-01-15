import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI, IMAGE_BASE_URL, getSafeImageUrl } from '../../../services/api';
import { PRODUCT_CATEGORIES } from '../../../constants/categories';
import ConfirmModal from '../../Common/ConfirmModal/ConfirmModal';
import './ProductManagement.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // null = create mode
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sale_price: '',
        category: '',
        stock: '',
        image_url: '',
        badge: ''
    });
    const [imageFileName, setImageFileName] = useState(''); // Chỉ lưu tên file
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    useEffect(() => {
        fetchProducts();
    }, []);

    // Hàm tạo URL đầy đủ để lưu vào database
    const getFullImageUrl = (fileName) => {
        if (!fileName) return '';
        // Nếu đã có sẵn path thì thôi, không thì thêm IMAGE_BASE_URL
        if (fileName.startsWith('http') || fileName.startsWith('/')) return fileName;
        return IMAGE_BASE_URL + fileName;
    };

    // Hàm tách tên file từ URL đầy đủ
    const extractFileName = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    // Hàm tạo URL an toàn để hiển thị
    const getSafeUrl = (fileNameOrUrl) => {
        return getSafeImageUrl(fileNameOrUrl);
    };

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            const products = response.data || [];
            // Sắp xếp theo ID tăng dần
            const sortedProducts = products.sort((a, b) => a.id - b.id);
            setProducts(sortedProducts);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            const fileName = extractFileName(product.image_url || '');
            setImageFileName(fileName);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                sale_price: product.sale_price || '',
                category: product.category || '',
                stock: product.stock || 0,
                image_url: product.image_url || '', // Giữ nguyên để lưu vào DB
                badge: product.badge || ''
            });
        } else {
            setCurrentProduct(null);
            setImageFileName('');
            setFormData({
                name: '',
                description: '',
                price: '',
                sale_price: '',
                category: '',
                stock: '',
                image_url: '',
                badge: ''
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageFileNameChange = (e) => {
        const fileName = e.target.value;
        setImageFileName(fileName);
        // Tự động cập nhật image_url với URL đầy đủ
        if (fileName) {
            setFormData(prev => ({ ...prev, image_url: getFullImageUrl(fileName) }));
        } else {
            setFormData(prev => ({ ...prev, image_url: '' }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Đảm bảo image_url được ghép đúng từ tên file
            const submitData = { ...formData };
            if (imageFileName && !submitData.image_url.includes(IMAGE_BASE_URL)) {
                submitData.image_url = getFullImageUrl(imageFileName);
            }

            if (currentProduct) {
                // Update
                await productsAPI.update(currentProduct.id, submitData);
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                // Create
                await productsAPI.create(submitData);
                toast.success('Thêm sản phẩm thành công!');
            }
            fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving product", error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete({ open: false, id: null });
        try {
            await productsAPI.delete(id);
            toast.success('Xóa sản phẩm thành công!');
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product", error);
            toast.error('Không thể xóa sản phẩm.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="product-management">
            <div className="header-actions">
                <h2>Quản Lý Sản Phẩm</h2>
                <button className="add-btn" onClick={() => handleOpenModal()}>+ Thêm sản phẩm</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Danh mục</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>#{product.id}</td>
                                <td>
                                    {product.image_url && <img src={getSafeUrl(product.image_url)} alt={product.name} className="thumb" />}
                                </td>
                                <td>{product.name}</td>
                                <td>{formatCurrency(product.price)}</td>
                                <td>{product.stock}</td>
                                <td>{product.category}</td>
                                <td>
                                    <button className="action-btn edit" onClick={() => handleOpenModal(product)}>Sửa</button>
                                    <button className="action-btn delete" onClick={() => setConfirmDelete({ open: true, id: product.id })}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tên sản phẩm</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select name="category" value={formData.category} onChange={handleChange}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {PRODUCT_CATEGORIES.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Giá (VNĐ)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Giá KM (VNĐ)</label>
                                    <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Tồn kho</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Badge (VD: HOT)</label>
                                    <input type="text" name="badge" value={formData.badge} onChange={handleChange} />
                                </div>
                                <div className="form-group full">
                                    <label>Tên file ảnh</label>
                                    <div className="image-upload-section">
                                        <div className="image-preview-container">
                                            {formData.image_url && (
                                                <div className="image-preview">
                                                    <img src={getSafeUrl(formData.image_url)} alt="Preview" onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }} />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => {
                                                            setImageFileName('');
                                                            setFormData(prev => ({ ...prev, image_url: '' }));
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="image-url-input">
                                            <input
                                                type="text"
                                                value={imageFileName}
                                                onChange={handleImageFileNameChange}
                                                placeholder="Nhập tên file ảnh (VD: chan_vit.jpg)"
                                            />
                                            <small style={{ display: 'block', marginTop: '5px', color: '#6b7280' }}>
                                                Đường dẫn đầy đủ: {formData.image_url || '(chưa có)'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group full">
                                    <label>Mô tả</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Hủy</button>
                                <button type="submit" className="save-btn">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                title="Xác nhận xóa"
                message="Bạn có chắc sản phẩm này đã 'biến mất' khỏi kệ hàng? Không thể khôi phục sau khi xóa đâu nhé!"
                onConfirm={() => handleDelete(confirmDelete.id)}
                onCancel={() => setConfirmDelete({ open: false, id: null })}
            />
        </div>
    );
};

export default ProductManagement;
