// frontend/src/components/User/ProductCard/ProductCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <--- QUAN TRỌNG: Phải có dòng này mới chuyển trang được
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
    const navigate = useNavigate();
    // Format tiền Việt
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const hasDiscount = product.sale_price && product.sale_price < product.price;

    const handleBuyNow = () => {
        // Lưu sản phẩm này vào giỏ hàng (chỉ item này hoặc thêm vào giỏ hiện tại)
        // Cách nhanh: Thêm vào giỏ và nhảy sang trang checkout luôn
        onAddToCart(product);
        navigate('/checkout');
    };

    return (
        <div className="product-card">
            {/* Badge giảm giá/mới */}
            {product.badge && (
                <span className={`product-card__badge product-card__badge--${product.badge.toLowerCase()}`}>
                    {product.badge}
                </span>
            )}

            {/* --- BẮT ĐẦU SỬA TỪ ĐÂY --- */}
            {/* Bọc ảnh bằng thẻ Link để bấm vào là chuyển sang trang chi tiết */}
            <Link to={`/product/${product.id}`} className="product-card__link">
                <div className="product-card__image-wrapper">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/200x200'}
                        alt={product.name}
                        className="product-card__image"
                    />
                </div>
            </Link>
            {/* --- KẾT THÚC SỬA --- */}

            <div className="product-card__content">
                {/* Bọc tên sản phẩm bằng Link luôn */}
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="product-card__name" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                {/* Phần giá tiền */}
                <div className="product-card__price">
                    {hasDiscount ? (
                        <>
                            <span className="product-card__original-price">
                                {formatPrice(product.price)}
                            </span>
                            <span className="product-card__sale-price">
                                {formatPrice(product.sale_price)}
                            </span>
                        </>
                    ) : (
                        <span className="product-card__current-price">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>

                {/* Phần hiển thị tình trạng hàng */}
                {product.stock !== undefined && (
                    <div className="product-card__stock">
                        {product.stock > 0 ? (
                            <span className="in-stock" style={{ color: 'green', fontSize: '12px' }}>✓ Còn hàng ({product.stock})</span>
                        ) : (
                            <span className="out-of-stock" style={{ color: 'red', fontSize: '12px' }}>✗ Hết hàng</span>
                        )}
                    </div>
                )}

                <div className="product-card__actions">
                    <button
                        className="product-card__button add-to-cart-btn"
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? '🔒 Hết' : '🛒 Thêm giỏ'}
                    </button>

                    <button
                        className="product-card__button buy-now-btn"
                        onClick={handleBuyNow}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Hết hàng' : '⚡ Mua ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;