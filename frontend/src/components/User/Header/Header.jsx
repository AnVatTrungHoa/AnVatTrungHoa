import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmModal from '../../Common/ConfirmModal/ConfirmModal';
import './Header.css';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // State để hiển thị số lượng trong giỏ hàng
    // State để hiển thị số lượng trong giỏ hàng
    const [totalQty, setTotalQty] = useState(0);
    // State quản lý dropdown menu
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    // State quản lý Modal xác nhận đăng xuất
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Hàm đếm tổng số lượng món ăn từ LocalStorage
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        setTotalQty(count);
    };

    useEffect(() => {
        // 1. Cập nhật ngay khi Header vừa hiện ra
        updateCartCount();

        // 2. Lắng nghe sự kiện 'storage' (khi tab khác thay đổi giỏ hàng)
        window.addEventListener('storage', updateCartCount);

        // 3. Lắng nghe click bên ngoài để đóng dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
        setIsDropdownOpen(false); // Đóng dropdown khi mở modal
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Cập nhật URL parameter 'q'
        if (value.trim()) {
            navigate(`/?q=${encodeURIComponent(value)}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="container header__content">
                {/* 1. LOGO: Bấm vào là về Trang chủ */}
                <div className="header__logo">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img src="/logo.png" alt="Đồ Ăn Vặt Trung Quốc" className="logo-img" />
                    </Link>
                </div>

                {/* 2. MENU ĐIỀU HƯỚNG */}
                <nav className="header__nav">
                    <Link to="/" className="header__link">Trang chủ</Link>
                    <Link to="/products" className="header__link">Sản phẩm</Link>
                    <Link to="/about" className="header__link">Về chúng tôi</Link>
                    <Link to="/contact" className="header__link">Liên hệ</Link>
                </nav>

                {/* 3. CÁC NÚT CHỨC NĂNG BÊN PHẢI */}
                <div className="header__actions">
                    {/* Ô tìm kiếm */}
                    <div className="header__search">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            className="header__search-input"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Giỏ hàng (Có Link sang /cart) */}
                    <Link to="/cart" className="header__cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <span style={{ fontSize: '24px' }}>🛒</span>
                            {totalQty > 0 && (
                                <span className="header__cart-badge">{totalQty}</span>
                            )}
                        </div>
                    </Link>

                    {/* Khu vực Tài khoản */}
                    <div className="header__auth">
                        {user ? (
                            // Đã đăng nhập - Sử dụng Dropdown
                            <div className="user-dropdown" ref={dropdownRef}>
                                <button
                                    className={`dropdown-toggle ${isDropdownOpen ? 'active' : ''}`}
                                    onClick={handleToggleDropdown}
                                >
                                    <span className="user-avatar">👤</span>
                                    <span className="user-name-text">
                                        {user.full_name || user.username}
                                    </span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <p className="welcome-text">Xin chào,</p>
                                            <p className="full-name">{user.full_name || user.username}</p>
                                        </div>
                                        <div className="dropdown-divider"></div>

                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="item-icon">👤</span> Tài khoản của tôi
                                        </Link>

                                        <Link to="/my-orders" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="item-icon">📦</span> Đơn hàng của tôi
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="dropdown-item admin-menu-item" onClick={() => setIsDropdownOpen(false)}>
                                                <span className="item-icon">⚙️</span> Trang quản trị
                                            </Link>
                                        )}

                                        <div className="dropdown-divider"></div>

                                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                                            <span className="item-icon">🚪</span> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Chưa đăng nhập
                            <div className="auth-buttons">
                                <Link to="/login" className="auth-btn login">Đăng nhập</Link>
                                <Link to="/register" className="auth-btn register">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal xác nhận đăng xuất */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />
        </header>
    );
};

export default Header;