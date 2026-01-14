import React, { useMemo, useState, useEffect, useRef } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, onAddToCart, selectedCategory, searchQuery }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    const gridRef = useRef(null);

    // Filter products theo category và search
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // Reset về trang 1 khi danh mục hoặc tìm kiếm thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    // Tính toán sản phẩm cho trang hiện tại
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Cuộn lên đầu grid khi đổi trang
        if (gridRef.current) {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className="product-grid-section" ref={gridRef}>
            <div className="container">
                {/* Products Grid */}
                {paginatedProducts.length > 0 ? (
                    <>
                        <div className="product-grid__items">
                            {paginatedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn prev"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    &laquo; Trước
                                </button>

                                <div className="page-numbers">
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="pagination-btn next"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-products">
                        <p>🔍 Không tìm thấy sản phẩm nào khớp với lựa chọn của bạn.</p>
                        {searchQuery && <p className="sub-text">Từ khóa: "{searchQuery}"</p>}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductGrid;