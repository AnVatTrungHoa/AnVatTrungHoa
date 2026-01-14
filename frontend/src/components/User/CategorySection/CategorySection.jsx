import React from 'react';
import { PRODUCT_CATEGORIES } from '../../../constants/categories';
import './CategorySection.css';

// Mapping emoji cho từng danh mục
const categoryEmojis = {
    'Thịt': '🍖',
    'Ký ức': '⭐',
    'Đậu nành': '🥜',
    'Hải sản': '🦐',
    'Rau củ': '🥬',
    'Mì': '🍜'
};

const categories = PRODUCT_CATEGORIES.map((name, index) => ({
    id: index + 1,
    name: name,
    emoji: categoryEmojis[name] || '📦'
}));

const CategorySection = ({ onCategoryClick, selectedCategory }) => {
    return (
        <section className="category-section">
            <div className="container">
                <h2 className="category-section__title">Danh mục sản phẩm</h2>
                <div className="category-grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`category-card ${selectedCategory === cat.name ? 'active' : ''}`}
                            onClick={() => onCategoryClick(cat.name)}
                        >
                            <span className="category-card__emoji">{cat.emoji}</span>
                            <h3 className="category-card__name">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
