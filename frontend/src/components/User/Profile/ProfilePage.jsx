import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { usersAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext); // Giả sử AuthContext có setUser để cập nhật state cục bộ
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                full_name: user.full_name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await usersAPI.updateProfile({
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email
            });

            if (response.data.success) {
                toast.success('Cập nhật thông tin thành công!');
                // Cập nhật lại context và localStorage
                const updatedUser = {
                    ...user,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    email: formData.email
                };
                if (setUser) setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="loading-container">Đang tải...</div>;

    return (
        <div className="profile-page">
            <Header />
            <div className="container profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <h2>Tài khoản của tôi</h2>
                        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                    </div>

                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input type="text" value={formData.username} disabled className="input-disabled" />
                            <small>Tên đăng nhập không thể thay đổi</small>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                                required
                            />
                            <small>Sử dụng email để nhận thông báo và hỗ trợ</small>
                        </div>

                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </div>

                        <button type="submit" className="save-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
