import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-container">
                <div className="confirm-modal-header">
                    <h3>{title || 'Xác nhận'}</h3>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-footer">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        Hủy
                    </button>
                    <button className="confirm-btn-ok" onClick={onConfirm}>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
