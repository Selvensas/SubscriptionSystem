import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = () => {
        signOut();
        navigate('/login');
    };

    return (
        <nav className="navbar glass">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">◈</span>
                    <span className="logo-text gradient-text">SubTrack</span>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </div>

                <div className="navbar-user">
                    <button
                        className="user-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="user-name">{user?.name || 'User'}</span>
                    </button>

                    {showDropdown && (
                        <div className="dropdown-menu glass animate-slide-down">
                            <div className="dropdown-header">
                                <span className="dropdown-email">{user?.email}</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleSignOut}>
                                <FiLogOut />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
