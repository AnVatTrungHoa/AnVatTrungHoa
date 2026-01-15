import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_URL, getSafeImageUrl } from '../../../services/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer'; // Import Footer (nếu có)
import './ProductDetail.css'; // Import file CSS làm đẹp

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    // Format tiền Việt
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    useEffect(() => {
        window.scrollTo(0, 0); // Cuộn lên đầu trang khi vào
        fetch(`${API_URL}/products/chitiet.php?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [id]);

    const handleQuantityChange = (amount) => {
        const newQuantity = quantity + amount;
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 100)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        // 1. Lấy giỏ hàng cũ từ LocalStorage
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

        // 2. Kiểm tra xem món này đã có trong giỏ chưa
        const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Nếu có rồi thì cộng thêm số lượng
            currentCart[existingItemIndex].quantity += quantity;
        } else {
            // Nếu chưa có thì thêm mới (Lưu các thông tin cần thiết)
            currentCart.push({
                id: product.id,
                name: product.name,
                price: product.sale_price || product.price, // Ưu tiên giá sale
                image: getSafeImageUrl(product.image_url),
                stock: product.stock,
                quantity: quantity
            });
        }

        // 3. Lưu ngược lại vào LocalStorage
        localStorage.setItem('cart', JSON.stringify(currentCart));

        // 4. Thông báo và dispatch sự kiện để Header cập nhật ngay lập tức (nếu Header có lắng nghe)
        toast.success(`✅ Đã thêm ${quantity} sản phẩm vào giỏ!`);
        window.dispatchEvent(new Event('storage')); // Mẹo để các tab khác cập nhật
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/checkout');
    };

    if (loading) return <div className="pd-loading">⏳ Đang tải món ngon...</div>;
    if (!product || !product.name) return <div className="pd-error">❌ Không tìm thấy sản phẩm này!</div>;

    return (
        <div className="product-detail-page">
            {/* 1. Header (Truyền tạm cartCount=0 vì chưa có Context toàn cục) */}
            <Header cartCount={0} />

            <div className="pd-container">
                {/* Breadcrumb (Đường dẫn) */}
                <div className="pd-breadcrumb">
                    <Link to="/">Trang chủ</Link> / <span>{product.name}</span>
                </div>

                <div className="pd-content-wrapper">
                    {/* CỘT TRÁI: ẢNH */}
                    <div className="pd-image-section">
                        <div className="pd-image-frame">
                            <img src={getSafeImageUrl(product.image_url)} alt={product.name} />
                        </div>
                    </div>

                    {/* CỘT PHẢI: THÔNG TIN */}
                    <div className="pd-info-section">
                        <h1 className="pd-title">{product.name}</h1>

                        <div className="pd-price-box">
                            {product.sale_price < product.price ? (
                                <>
                                    <span className="pd-price-new">{formatPrice(product.sale_price)}</span>
                                    <span className="pd-price-old">{formatPrice(product.price)}</span>
                                    <span className="pd-discount-tag">Giảm {Math.round((1 - product.sale_price / product.price) * 100)}%</span>
                                </>
                            ) : (
                                <span className="pd-price-new">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <div className="pd-status">
                            Tình trạng:
                            {product.stock > 0
                                ? <span className="pd-stock-ok"> Còn hàng ({product.stock})</span>
                                : <span className="pd-stock-out"> Hết hàng</span>
                            }
                        </div>

                        <p className="pd-desc">{product.description || "Món này ngon tuyệt cú mèo nhưng shop chưa kịp viết mô tả..."}</p>

                        {/* Bộ chọn số lượng */}
                        <div className="pd-actions">
                            <div className="pd-quantity-selector">
                                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                                <input type="text" value={quantity} readOnly />
                                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>+</button>
                            </div>

                            <button className="pd-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                                {product.stock === 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
                            </button>

                            <button className="pd-buy-now-btn" onClick={handleBuyNow} disabled={product.stock === 0}>
                                {product.stock === 0 ? 'HẾT HÀNG' : 'MUA NGAY'}
                            </button>
                        </div>

                        <div className="pd-policy">
                            <ul>
                                <li>🚚 Giao hàng toàn quốc</li>
                                <li>🛡️ Đổi trả trong 24h nếu hư hỏng</li>
                                <li>✅ Cam kết hàng chính hãng nội địa</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ProductDetail;