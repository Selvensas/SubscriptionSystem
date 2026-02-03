
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import '../pages/Auth.css'; // Reuse auth positioning styles for center alignment

const NotFound = () => {
    return (
        <div className="auth-page">
            <div className="auth-container animate-scale-in" style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: '4rem',
                    color: 'var(--accent-primary)',
                    marginBottom: 'var(--spacing-md)',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <FiAlertTriangle />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: 'var(--spacing-sm)',
                    color: 'var(--text-primary)'
                }}>
                    Page Not Found
                </h1>

                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <Link to="/" className="auth-btn">
                    <FiHome />
                    <span>Go to Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
