import React, { useEffect, useState } from 'react';
import { productsAPI, ordersAPI, usersAPI } from '../../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        tempRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching
                const [productsRes, ordersRes, usersRes] = await Promise.all([
                    productsAPI.getAll(),
                    ordersAPI.getAll(),
                    usersAPI.getAll()
                ]);

                const products = productsRes.data || [];
                const orders = ordersRes.data || [];
                const users = usersRes.data || [];

                // Calculate Stats
                const revenue = orders
                    .filter(o => o.status === 'completed')
                    .reduce((acc, curr) => acc + Number(curr.total_amount), 0);

                // Get Recent Orders (first 5)
                const recent = orders.slice(0, 5);

                // Mock Top Products logic (randomly picking 5 for demo as we don't have sales count in mock data yet)
                // In real app, aggregate order_items
                const top = products.slice(0, 5);

                setStats({
                    revenue,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalUsers: users.length
                });
                setRecentOrders(recent);
                setTopProducts(top);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="dashboard">
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue">💰</div>
                    <div className="stat-info">
                        <h3>Tổng doanh thu</h3>
                        <p>{formatCurrency(stats.revenue)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orders">📦</div>
                    <div className="stat-info">
                        <h3>Tổng đơn hàng</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon products">🍔</div>
                    <div className="stat-info">
                        <h3>Tổng sản phẩm</h3>
                        <p>{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon users">👥</div>
                    <div className="stat-info">
                        <h3>Tổng khách hàng</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="section recent-orders">
                    <h3>Đơn hàng gần đây</h3>
                    {recentOrders.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user_name || 'Khách lẻ'}</td>
                                        <td>{formatCurrency(order.total_amount)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </div>

                <div className="section top-products">
                    <h3>Sản phẩm nổi bật</h3>
                    {topProducts.length > 0 ? (
                        <ul>
                            {topProducts.map(product => (
                                <li key={product.id} className="top-product-item">
                                    <img src={product.image_url || 'placeholder.jpg'} alt={product.name} />
                                    <div className="product-info">
                                        <h4>{product.name}</h4>
                                        <p>{formatCurrency(product.price)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <p>Chưa có sản phẩm nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
