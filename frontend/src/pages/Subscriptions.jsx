import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import { Navbar, SubscriptionCard, Loader, Modal } from '../components';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import './Subscriptions.css';

const categories = ['All', 'Entertainment', 'Education', 'Productivity', 'Health', 'Finance', 'Other'];
const statuses = ['All', 'Active', 'Cancelled', 'Expired'];

const Subscriptions = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [error, setError] = useState('');

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (user?._id && !hasFetched.current) {
            hasFetched.current = true;
            fetchSubscriptions();
        }
    }, [user]);

    const fetchSubscriptions = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            const response = await subscriptionsAPI.getUserSubscriptions(user._id);
            setSubscriptions(response.data.data || []);
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await subscriptionsAPI.cancel(id);
            // Update local state immediately
            setSubscriptions(prev => prev.map(sub =>
                sub._id === id ? { ...sub, status: 'Cancelled' } : sub
            ));
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
            alert('Failed to cancel subscription. Please try again.');
        }
    };

    const handleDeleteClick = (id) => {
        setSubscriptionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!subscriptionToDelete) return;

        // Optimistic update
        const previousSubs = [...subscriptions];
        setSubscriptions(prev => prev.filter(sub => sub._id !== subscriptionToDelete));
        setIsDeleteModalOpen(false); // Close modal immediately

        try {
            await subscriptionsAPI.delete(subscriptionToDelete);
            setSubscriptionToDelete(null);
        } catch (err) {
            console.error('Failed to delete subscription:', err);
            setSubscriptions(previousSubs); // Revert on failure
            setError('Failed to delete subscription. Please try again.'); // Set error state
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryCount = (category) => {
        if (category === 'All') return subscriptions.length;
        return subscriptions.filter(s => s.category === category).length;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="subscriptions-loading">
                    <Loader />
                    <p>Loading subscriptions...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="subscriptions-page">
                <div className="subscriptions-container">
                    <header className="subscriptions-header animate-fade-in">
                        <div className="header-content">
                            <h1>My Subscriptions</h1>
                            <p>{subscriptions.length} total subscription{subscriptions.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Link to="/subscriptions/add" className="add-btn">
                            <FiPlus />
                            <span>Add New</span>
                        </Link>
                    </header>

                    <div className="subscriptions-toolbar animate-fade-in">
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search subscriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            className={`filter-toggle ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter />
                            <span>Filters</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="filters-panel glass animate-slide-down">
                            <div className="filter-group">
                                <label>Category</label>
                                <div className="filter-options">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                            <span className="chip-count">{getCategoryCount(cat)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Status</label>
                                <div className="filter-options">
                                    {statuses.map(status => (
                                        <button
                                            key={status}
                                            className={`filter-chip status-chip ${selectedStatus === status ? 'active' : ''}`}
                                            onClick={() => setSelectedStatus(status)}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredSubscriptions.length === 0 ? (
                        <div className="empty-state animate-fade-in">
                            <div className="empty-icon">🔍</div>
                            <h3>No subscriptions found</h3>
                            <p>
                                {subscriptions.length === 0
                                    ? "You haven't added any subscriptions yet"
                                    : "Try adjusting your search or filters"}
                            </p>
                            {subscriptions.length === 0 && (
                                <Link to="/subscriptions/add" className="empty-btn">
                                    <FiPlus />
                                    Add your first subscription
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="subscriptions-grid">
                            {filteredSubscriptions.map((sub, index) => (
                                <SubscriptionCard
                                    key={sub._id}
                                    subscription={sub}
                                    onCancel={handleCancel}
                                    onDelete={handleDeleteClick}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Confirm Deletion"
                    onConfirm={handleConfirmDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to delete this subscription? This action cannot be undone.</p>
                    {error && <p className="error-message">{error}</p>}
                </Modal>
            </main>
        </>
    );
};

export default Subscriptions;
