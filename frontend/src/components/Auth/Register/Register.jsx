import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!formData.username || !formData.email || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone
            });

            if (result.success) {
                toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                setError(result.message || 'Đăng ký thất bại');
            }
        } catch (err) {
            console.error('Register error:', err);

            if (err.response) {
                if (err.response.status === 409) {
                    setError('Tên đăng nhập hoặc email đã tồn tại');
                } else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Đăng ký thất bại. Vui lòng thử lại');
                }
            } else {
                setError('Không thể kết nối đến server');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Đăng ký tài khoản</h2>
                <p className="register-subtitle">Tạo tài khoản để bắt đầu mua sắm</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập <span className="required">*</span></label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu <span className="required">*</span></label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Tối thiểu 6 ký tự"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu <span className="required">*</span></label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0123456789"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;