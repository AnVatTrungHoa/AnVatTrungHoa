import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ordersAPI } from '../../../services/api';
import ConfirmModal from '../../Common/ConfirmModal/ConfirmModal';
import './OrderManagement.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [confirmStatus, setConfirmStatus] = useState({ open: false, id: null, status: '' });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data || []);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setConfirmStatus({ open: false, id: null, status: '' });
        try {
            await ordersAPI.updateStatus(id, newStatus);
            toast.success(`Đã cập nhật đơn hàng #${id} sang ${newStatus}`);
            fetchOrders(); // Refresh
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái.');
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="order-management">
            <div className="header-actions">
                <h2>Quản Lý Đơn Hàng</h2>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ngày đặt</th>
                            <th>Khách hàng</th>
                            <th>SĐT</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div>{order.user_name || 'Khách lẻ'}</div>
                                    <div className="sub-text">{order.shipping_address}</div>
                                </td>
                                <td>{order.phone}</td>
                                <td className="amount">{formatCurrency(order.total_amount)}</td>
                                <td>
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => setConfirmStatus({ open: true, id: order.id, status: e.target.value })}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmStatus.open}
                title="Thay đổi trạng thái"
                message={`Bạn muốn chuyển đơn hàng #${confirmStatus.id} sang trạng thái "${confirmStatus.status}"?`}
                onConfirm={() => handleStatusChange(confirmStatus.id, confirmStatus.status)}
                onCancel={() => setConfirmStatus({ open: false, id: null, status: '' })}
            />
        </div>
    );
};

export default OrderManagement;
