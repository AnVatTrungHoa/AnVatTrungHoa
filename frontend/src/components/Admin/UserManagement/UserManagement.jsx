import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../../../services/api';
import ConfirmModal from '../../Common/ConfirmModal/ConfirmModal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        role: 'customer'
    });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user) => {
        setCurrentUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            phone: user.phone || '',
            role: user.role
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentUser(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await usersAPI.update(currentUser.id, formData);
            toast.success('Cập nhật người dùng thành công!');
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error("Error updating user", error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        }
    };

    const handleDelete = async (id) => {
        setConfirmDelete({ open: false, id: null });
        try {
            await usersAPI.delete(id);
            toast.success('Xóa người dùng thành công!');
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user", error);
            toast.error(error.response?.data?.message || 'Không thể xóa người dùng.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="user-management">
            <div className="header-actions">
                <h2>Quản Lý Người Dùng</h2>
                <input
                    type="text"
                    placeholder="Tìm theo username hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Họ tên</th>
                            <th>SĐT</th>
                            <th>Role</th>
                            <th>Ngày tham gia</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.full_name}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn edit" onClick={() => handleOpenModal(user)}>Sửa</button>
                                    <button className="action-btn delete" onClick={() => setConfirmDelete({ open: true, id: user.id })}>Xóa</button>
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
                        <h3>Sửa Thông Tin Người Dùng</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Họ tên</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="customer">customer</option>
                                        <option value="admin">admin</option>
                                    </select>
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
                message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
                onConfirm={() => handleDelete(confirmDelete.id)}
                onCancel={() => setConfirmDelete({ open: false, id: null })}
            />
        </div>
    );
};

export default UserManagement;
