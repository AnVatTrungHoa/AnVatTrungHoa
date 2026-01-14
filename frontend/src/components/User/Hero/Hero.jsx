import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero__content">
                <h1 className="hero__title">Khám phá hương vị Trung Hoa chính gốc</h1>
                <p className="hero__subtitle">Hàng trăm món ăn vặt từ Trung Quốc với giá tốt nhất, giao hàng tận nơi.</p>
                <button className="hero__button">Mua sắm ngay</button>
            </div>
        </section>
    );
};

export default Hero;
