// Danh mục sản phẩm chung cho toàn bộ ứng dụng
// Đồng bộ với dữ liệu trong database
export const PRODUCT_CATEGORIES = [
    'Thịt',
    'Ký ức',
    'Đậu nành',
    'Hải sản',
    'Rau củ',
    'Mì'
];

// Danh mục hiển thị trên giao diện user (bao gồm "Tất cả")
export const USER_CATEGORIES = [
    'Tất cả',
    ...PRODUCT_CATEGORIES
];
