import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    {/* Column 1: About */}
                    <div className="footer__col">
                        <h3 className="footer__column-title">Về chúng tôi</h3>
                        <p className="footer__text">
                            Đồ Ăn Vặt Trung Quốc - Chuyên cung cấp các loại bánh kẹo, snack, đồ uống nội địa Trung chính hãng. Hương vị chuẩn, giá cả hợp lý.
                        </p>
                        <div className="footer__socials">
                            <div className="footer__social-icon">FB</div>
                            <div className="footer__social-icon">IG</div>
                            <div className="footer__social-icon">TT</div>
                        </div>
                    </div>

                    {/* Column 2: Policy */}
                    <div className="footer__col">
                        <h3 className="footer__column-title">Chính sách</h3>
                        <div className="footer__links">
                            <a href="#" className="footer__link">Chính sách đổi trả</a>
                            <a href="#" className="footer__link">Chính sách bảo mật</a>
                            <a href="#" className="footer__link">Điều khoản dịch vụ</a>
                            <a href="#" className="footer__link">Vận chuyển & Giao nhận</a>
                        </div>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="footer__col">
                        <h3 className="footer__column-title">Liên hệ</h3>
                        <div className="footer__text">📍 123 Đường ABC, Quận XYZ, TP.HCM</div>
                        <div className="footer__text">📧 contact@anvattrungquoc.vn</div>
                        <div className="footer__text">📞 0909 123 456</div>
                    </div>
                </div>

                <div className="footer__copyright">
                    © 2024 Đồ Ăn Vặt Trung Quốc. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
