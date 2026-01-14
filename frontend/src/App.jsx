import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHomePage from './pages/UserHomePage';
import AdminPage from './pages/AdminPage';

// Admin Components
import Dashboard from './components/Admin/Dashboard/Dashboard';
import ProductManagement from './components/Admin/ProductManagement/ProductManagement';
import OrderManagement from './components/Admin/OrderManagement/OrderManagement';
import UserManagement from './components/Admin/UserManagement/UserManagement';

import ProductDetail from './components/User/ProductDetail/ProductDetail';
import CartPage from './components/User/Cart/CartPage';

import About from './components/User/About/About';
import Contact from './components/User/Contact/Contact';

import CheckoutPage from './components/User/Checkout/CheckoutPage';
import ProfilePage from './components/User/Profile/ProfilePage';
import MyOrdersPage from './components/User/MyOrders/MyOrdersPage';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Route */}
          <Route path="/" element={
            <UserHomePage />
          } />

          {/* Admin Routes (Nested) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Customer Profile & Orders */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
