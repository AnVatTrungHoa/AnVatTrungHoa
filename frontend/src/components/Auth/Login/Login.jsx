import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error khi user nhập
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!formData.username || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);

        try {
            const result = await login(formData);

            if (result.success) {
                // Check role và redirect
                if (result.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error('Login error:', err);

            // Xử lý lỗi từ API
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Sai tên đăng nhập hoặc mật khẩu');
                } else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Đăng nhập thất bại. Vui lòng thử lại');
                }
            } else {
                setError('Không thể kết nối đến server');
            }
            
            // Clear password field sau khi lỗi để bảo mật
            setFormData(prev => ({
                ...prev,
                password: ''
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Đăng nhập</h2>
                <p className="login-subtitle">Đăng nhập để tiếp tục mua sắm</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
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
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                </div>

                <div className="test-accounts">
                    <p className="test-title">Tài khoản test:</p>
                    <p>Admin: username=<strong>admin</strong>, password=<strong>admin123</strong></p>
                    <p>Customer: username=<strong>customer1</strong>, password=<strong>123456</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;