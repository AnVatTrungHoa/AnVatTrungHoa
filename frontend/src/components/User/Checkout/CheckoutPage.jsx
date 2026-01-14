// frontend/src/components/User/Checkout/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../../../services/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './CheckoutPage.css';
import staticQrImage from '../../../assets/images/qr.jpg';
const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        note: '',
        paymentMethod: 'cod' // Mặc định là thanh toán khi nhận hàng
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format tiền
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // Lấy giỏ hàng khi vào trang
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (storedCart.length === 0) {
            toast.warn("Giỏ hàng đang trống! Vui lòng chọn món trước.");
            navigate('/');
        }
        setCart(storedCart);
    }, [navigate]);

    // Tính tổng tiền
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra thông tin
        if (!formData.fullName || !formData.phone || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. Chuẩn bị dữ liệu gửi API
            const orderData = {
                phone: formData.phone,
                shipping_address: `${formData.fullName} - ${formData.address}${formData.note ? ' (Ghi chú: ' + formData.note + ')' : ''}`,
                total: totalPrice,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // 3. Gửi API tạo đơn hàng
            const response = await ordersAPI.create(orderData);

            if (response.data.success) {
                // 4. Xử lý thành công
                toast.success("🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.");

                // 5. Xóa giỏ hàng và về trang chủ
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage')); // Cập nhật số lượng trên Header về 0
                navigate('/my-orders'); // Chuyển về trang đơn hàng của tôi để khách xem
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-page">
            <Header />

            <div className="container checkout-container">
                <h2 className="checkout-title">Thanh Toán & Đặt Hàng</h2>

                <div className="checkout-content">
                    {/* CỘT TRÁI: FORM THÔNG TIN */}
                    <div className="checkout-form-section">
                        <h3>📋 Thông tin giao hàng</h3>
                        <form onSubmit={handlePlaceOrder} className="checkout-form">
                            <div className="form-group">
                                <label>Họ và tên người nhận (*)</label>
                                <input
                                    type="text" name="fullName"
                                    value={formData.fullName} onChange={handleInputChange}
                                    placeholder="Ví dụ: Nguyễn Văn A" required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại (*)</label>
                                <input
                                    type="tel" name="phone"
                                    value={formData.phone} onChange={handleInputChange}
                                    placeholder="Ví dụ: 0912345678" required
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ nhận hàng (*)</label>
                                <input
                                    type="text" name="address"
                                    value={formData.address} onChange={handleInputChange}
                                    placeholder="Số nhà, đường, phường/xã..." required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú đơn hàng (Tùy chọn)</label>
                                <textarea
                                    name="note" rows="3"
                                    value={formData.note} onChange={handleInputChange}
                                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                                ></textarea>
                            </div>

                            <div className="payment-method">
                                <label className="payment-label">Phương thức thanh toán</label>
                                <div className="payment-options">
                                    {/* Lựa chọn 1: COD */}
                                    <label className={`option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio" name="paymentMethod" value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                        />
                                        <span>💵 Thanh toán khi nhận hàng (COD)</span>
                                    </label>

                                    {/* Lựa chọn 2: Chuyển khoản */}
                                    <label className={`option ${formData.paymentMethod === 'banking' ? 'selected' : ''}`}>
                                        <input
                                            type="radio" name="paymentMethod" value="banking"
                                            checked={formData.paymentMethod === 'banking'}
                                            onChange={handleInputChange}
                                        />
                                        <span>🏦 Chuyển khoản ngân hàng</span>
                                    </label>

                                    {/* --- PHẦN MỚI: HIỆN MÃ QR NẾU CHỌN BANKING --- */}
                                    {formData.paymentMethod === 'banking' && (
                                        <div className="banking-info">
                                            <p className="banking-note">Quét mã QR để thanh toán nhanh:</p>

                                            {/* Ảnh QR tự động tạo theo số tiền (Dùng API VietQR) */}
                                            {/* Thay: MB = Ngân hàng, 000... = Số tài khoản của bạn */}
                                            <div className="qr-code-box">
                                                <img
                                                    src={staticQrImage} // Dùng biến hình ảnh đã import
                                                    alt="Mã QR Chuyển khoản mặc định"
                                                    className="qr-img-code"// Thêm style nếu cần để ảnh không bị vỡ
                                                />
                                            </div>

                                            <div className="bank-details-text">
                                                <p>Ngân hàng: <b>MB Bank (Quân Đội)</b></p>
                                                <p>Số tài khoản: <b>0000019879927</b></p>
                                                <p>Chủ tài khoản: <b>NGUYEN VIET THANH</b></p>
                                                <p>Nội dung: <b>{`THANHTOAN DONHANG ${formData.phone || '...'}`}</b></p>
                                                <small style={{ color: 'red' }}>* Vui lòng ghi đúng nội dung chuyển khoản</small>
                                            </div>
                                        </div>
                                    )}
                                    {/* ----------------------------------------------- */}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="checkout-summary-section">
                        <div className="order-summary-box">
                            <h3>🛒 Đơn hàng của bạn ({cart.length} món)</h3>
                            <div className="summary-items">
                                {cart.map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <div className="sum-info">
                                            <span className="sum-name"><b>{item.quantity}x</b> {item.name}</span>
                                        </div>
                                        <span className="sum-price">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <hr />
                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span className="free-ship">Miễn phí</span>
                            </div>
                            <hr />
                            <div className="summary-total">
                                <span>Tổng cộng:</span>
                                <span className="total-price">{formatPrice(totalPrice)}</span>
                            </div>

                            <button
                                type="submit"
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
                            </button>

                            <Link to="/cart" className="back-to-cart">← Quay lại giỏ hàng</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CheckoutPage;