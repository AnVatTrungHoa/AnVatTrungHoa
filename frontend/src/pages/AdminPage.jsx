import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar/Sidebar';
import './AdminPage.css';

const AdminPage = () => {
    return (
        <div className="admin-page">
            <Sidebar />
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminPage;
