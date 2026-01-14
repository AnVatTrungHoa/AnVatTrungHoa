import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <Header />
            
            <div className="about-banner">
                <div className="about-banner-content">
                    <h1>Câu Chuyện Của Chúng Tôi</h1>
                    <p>Mang hương vị đường phố Trung Hoa đến ngôi nhà của bạn</p>
                </div>
            </div>

            <div className="container about-container">
                <div className="about-section">
                    <div className="about-text">
                        <h2>👋 Xin chào, chúng tôi là Chinese Snack Shop!</h2>
                        <p>
                            Được thành lập vào năm 2024, xuất phát từ niềm đam mê bất tận với nền ẩm thực phong phú của Trung Hoa. 
                            Chúng tôi hiểu rằng, tìm kiếm những món ăn vặt nội địa chuẩn vị, an toàn vệ sinh thực phẩm tại Việt Nam không phải là điều dễ dàng.
                        </p>
                        <p>
                            Chính vì thế, <strong>Chinese Snack Shop</strong> ra đời với sứ mệnh trở thành cầu nối, mang những gói chân gà cay tê, 
                            những thanh que cay tuổi thơ hay những hộp lẩu tự sôi tiện lợi... đến tận tay các bạn trẻ Việt Nam.
                        </p>
                    </div>
                    <div className="about-image">
                        <img src="https://img.freepik.com/premium-photo/variety-chinese-snacks-market-stall_1179130-36693.jpg" alt="Gian hàng đồ ăn vặt" />
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🌶️</div>
                        <h3>Chuẩn Vị Nội Địa</h3>
                        <p>Nhập khẩu trực tiếp, giữ nguyên hương vị cay nồng đặc trưng.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Giao Hàng Siêu Tốc</h3>
                        <p>Đóng gói cẩn thận, giao hàng nhanh chóng trong 2-4 ngày.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>An Toàn Tuyệt Đối</h3>
                        <p>Cam kết hạn sử dụng mới nhất, bao bì nguyên vẹn.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;