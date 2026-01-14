import React, { useState, useEffect } from 'react';
import './PromoSection.css';

const PromoSection = () => {
    // Simple countdown simulation
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 45,
        seconds: 12
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else {
                    seconds = 59;
                    if (minutes > 0) {
                        minutes--;
                    } else {
                        minutes = 59;
                        if (hours > 0) {
                            hours--;
                        }
                    }
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (val) => val.toString().padStart(2, '0');

    return (
        <section className="promo-section">
            <div className="promo-section__content">
                <div className="promo-section__icon">🔥</div>
                <h2 className="promo-section__title">FLASH SALE - GIẢM ĐẾN 50%</h2>
                <p className="promo-section__subtitle">Chỉ trong ngày hôm nay. Đừng bỏ lỡ!</p>
                <div className="promo-section__timer">
                    {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </div>
            </div>
        </section>
    );
};

export default PromoSection;
