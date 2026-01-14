import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="icon">📊</span> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="icon">📦</span> Quản lý sản phẩm
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="icon">🛒</span> Quản lý đơn hàng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="icon">👥</span> Quản lý người dùng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/" className="home-link">
                            <span className="icon">🏠</span> Trang chủ
                        </NavLink>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="icon">🚪</span> Đăng xuất
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
