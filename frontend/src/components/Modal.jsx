import React, { useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container animate-scale-in">
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="modal-header">
                    <div className={`modal-icon ${type}`}>
                        <FiAlertTriangle />
                    </div>
                    <h2>{title}</h2>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`modal-btn ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
