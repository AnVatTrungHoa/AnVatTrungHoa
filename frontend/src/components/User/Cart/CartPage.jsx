// frontend/src/components/User/Cart/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ConfirmModal from '../../Common/ConfirmModal/ConfirmModal';
import { ordersAPI } from '../../../services/api';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [confirmRemove, setConfirmRemove] = useState({ open: false, id: null });
    const [activeOrders, setActiveOrders] = useState([]);

    // Format tiền Việt
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // 1. Lấy dữ liệu từ LocalStorage khi mới vào trang
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
        fetchActiveOrders();
    }, []);

    const fetchActiveOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            // Lọc các đơn đang xử lý (pending, processing)
            const active = (response.data || []).filter(o => o.status === 'pending' || o.status === 'processing');
            setActiveOrders(active);
        } catch (error) {
            console.error("Failed to fetch active orders", error);
        }
    };

    // 2. Hàm cập nhật LocalStorage mỗi khi giỏ hàng thay đổi
    const updateCart = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        // Gửi sự kiện để Header cập nhật số lượng (nếu cần)
        window.dispatchEvent(new Event('storage'));
    };

    // 3. Tăng/Giảm số lượng
    const handleQuantityChange = (id, amount) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + amount;
                if (newQty > 0 && newQty <= item.stock) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        });
        updateCart(newCart);
    };

    // 4. Xóa sản phẩm
    const handleRemoveItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        updateCart(newCart);
        setConfirmRemove({ open: false, id: null });
    };

    // 5. Tính tổng tiền
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <div className="cart-page">
            <Header />

            <div className="cart-container">
                <h2 className="cart-title">Giỏ Hàng Của Bạn 🛒</h2>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" />
                        <p>Giỏ hàng đang trống trơn...</p>
                        <Link to="/" className="continue-btn">← Đi chọn món ngay</Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        {/* Danh sách sản phẩm */}
                        <div className="cart-items">
                            <div className="cart-header-row">
                                <span>Sản phẩm</span>
                                <span>Đơn giá</span>
                                <span>Số lượng</span>
                                <span>Thành tiền</span>
                                <span>Xóa</span>
                            </div>

                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <img src={item.image} alt={item.name} />
                                        <div>
                                            <h4>{item.name}</h4>
                                            <p className="item-stock">Kho: {item.stock}</p>
                                        </div>
                                    </div>
                                    <div className="item-price">{formatPrice(item.price)}</div>
                                    <div className="item-quantity">
                                        <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                        <input type="text" value={item.quantity} readOnly />
                                        <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                    </div>
                                    <div className="item-total">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                    <div className="item-remove">
                                        <button onClick={() => setConfirmRemove({ open: true, id: item.id })}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tổng tiền & Thanh toán */}
                        <div className="cart-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí ship:</span>
                                <span>Miễn phí</span>
                            </div>
                            <hr />
                            <div className="summary-total">
                                <span>Tổng cộng:</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                                TIẾN HÀNH THANH TOÁN
                            </button>
                            <Link to="/" className="continue-link">← Tiếp tục mua sắm</Link>
                        </div>
                    </div>
                )}

                {/* Phần hiển thị đơn hàng đang xử lý */}
                {activeOrders.length > 0 && (
                    <div className="active-orders-section">
                        <h3>⚡ Đơn hàng đang xử lý ({activeOrders.length})</h3>
                        <div className="active-orders-list">
                            {activeOrders.map(order => (
                                <div key={order.id} className="active-order-card">
                                    <div className="order-main">
                                        <span className="order-id">Đơn #{order.id}</span>
                                        <span className={`order-status-tag ${order.status}`}>
                                            {order.status === 'pending' ? '⏳ Chờ xác nhận' : '📦 Đang chế biến'}
                                        </span>
                                    </div>
                                    <div className="order-details">
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                        <span className="order-total">{formatPrice(order.total_amount)}</span>
                                    </div>
                                    <Link to="/my-orders" className="view-detail-link">Xem chi tiết →</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmRemove.open}
                title="Xóa khỏi giỏ hàng"
                message="Bạn có chắc chắn muốn bỏ món quà vặt này ra khỏi giỏ không? Nghĩ kỹ nha!"
                onConfirm={() => handleRemoveItem(confirmRemove.id)}
                onCancel={() => setConfirmRemove({ open: false, id: null })}
            />

            <Footer />
        </div>
    );
};

export default CartPage;