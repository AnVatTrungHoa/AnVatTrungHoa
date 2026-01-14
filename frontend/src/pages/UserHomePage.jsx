import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Components
import Header from '../components/User/Header/Header';
import Hero from '../components/User/Hero/Hero';
import CategorySection from '../components/User/CategorySection/CategorySection';
import ProductGrid from '../components/User/ProductGrid/ProductGrid';
import PromoSection from '../components/User/PromoSection/PromoSection';
import Footer from '../components/User/Footer/Footer';

const UserHomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            const products = response.data || [];
            // Sắp xếp theo ID tăng dần
            const sortedProducts = products.sort((a, b) => a.id - b.id);
            setProducts(sortedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Fallback với dữ liệu mẫu nếu API chưa có
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        // 1. Lấy giỏ hàng từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Nếu có rồi thì cộng thêm số lượng
            cart[existingItemIndex].quantity += 1;
        } else {
            // Nếu chưa có thì thêm mới
            cart.push({
                id: product.id,
                name: product.name,
                price: product.sale_price || product.price,
                image: product.image_url,
                stock: product.stock,
                quantity: 1
            });
        }

        // 2. Lưu vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // 3. Thông báo cho Header cập nhật (bằng cách kích hoạt sự kiện storage)
        window.dispatchEvent(new Event('storage'));

        toast.success(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    const handleCategoryClick = (category) => {
        // Toggle: nếu click vào danh mục đang được chọn, hiển thị tất cả sản phẩm
        if (selectedCategory === category) {
            setSelectedCategory('Tất cả');
            console.log("Category deselected, showing all products");
        } else {
            setSelectedCategory(category);
            console.log("Category selected:", category);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '20px',
                color: '#DC2626'
            }}>
                <div>
                    <div style={{ marginBottom: '10px' }}>🔄 Đang tải sản phẩm...</div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #DC2626',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-home-page">
            {/* Header không cần truyền user và logout vì đã dùng useContext */}
            {/* Header tự lấy dữ liệu từ localStorage, không cần truyền count qua prop nữa */}
            <Header />

            <Hero />

            <CategorySection
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
            />

            {/* Sử dụng ProductGrid component */}
            <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
            />
            <PromoSection />

            <Footer />
        </div>
    );
};

export default UserHomePage;