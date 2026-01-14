import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-page">
            <Header />

            <div className="container contact-container">
                <h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>

                <div className="contact-wrapper">
                    {/* Thông tin liên hệ */}
                    <div className="contact-info">
                        <div className="info-box">
                            <h3>📍 Địa chỉ cửa hàng</h3>
                            <p>Số 123, Đường Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh</p>
                        </div>
                        <div className="info-box">
                            <h3>☎️ Hotline hỗ trợ</h3>
                            <p>0912.345.678 (8:00 - 22:00)</p>
                        </div>
                        <div className="info-box">
                            <h3>📧 Email</h3>
                            <p>hotro@chinesesnack.vn</p>
                        </div>

                        {/* Map giả lập (Ảnh hoặc iframe) */}
                        <div className="map-box">
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4246101150493!2d106.6976269!3d10.776104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM0LjAiTiAxMDbCsDQxJzUyLjkiRQ!5e0!3m2!1svi!2s!4v1635000000000!5m2!1svi!2s"
                                width="100%" height="250" style={{ border: 0 }} allowFullScreen="" loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    {/* Form gửi tin nhắn */}
                    <div className="contact-form-box">
                        <h3>Gửi thắc mắc cho chúng tôi</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required placeholder="Nhập tên của bạn"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required placeholder="Nhập email của bạn"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea
                                    rows="5"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required placeholder="Bạn cần hỗ trợ gì?"
                                ></textarea>
                            </div>
                            <button type="submit" className="submit-btn">GỬI TIN NHẮN</button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;