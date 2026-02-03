import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import { Navbar, SubscriptionCard, Loader, Modal } from '../components';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import './Subscriptions.css';

const categories = ['All', 'Entertainment', 'Education', 'Productivity', 'Health', 'Finance', 'Other'];
const statuses = ['All', 'Active', 'Cancelled', 'Expired'];

const Home = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [subscriptions, setSubscriptions] = useState([]);
    const [upcomingRenewals, setUpcomingRenewals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [error, setError] = useState('');

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
    const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (user?._id && !hasFetched.current) {
            hasFetched.current = true;
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam === 'upcoming') {
            setShowUpcomingOnly(true);
        } else {
            setShowUpcomingOnly(false);
        }
    }, [searchParams]);

    const fetchData = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            const [subsResponse, renewalsResponse] = await Promise.all([
                subscriptionsAPI.getUserSubscriptions(user._id),
                subscriptionsAPI.getUpcomingRenewals(user._id),
            ]);
            setSubscriptions(subsResponse.data.data || []);
            setUpcomingRenewals(renewalsResponse.data.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await subscriptionsAPI.cancel(id);
            setSubscriptions(prev => prev.map(sub =>
                sub._id === id ? { ...sub, status: 'Cancelled' } : sub
            ));
            setUpcomingRenewals(prev => prev.filter(sub => sub._id !== id));
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

        const previousSubs = [...subscriptions];
        const previousRenewals = [...upcomingRenewals];

        // Optimistic UI update
        setSubscriptions(prev => prev.filter(sub => sub._id !== subscriptionToDelete));
        setUpcomingRenewals(prev => prev.filter(sub => sub._id !== subscriptionToDelete));
        setIsDeleteModalOpen(false);
        setSubscriptionToDelete(null);

        try {
            await subscriptionsAPI.delete(subscriptionToDelete); // Changed to subscriptionsAPI.delete
        } catch (err) {
            console.error('Failed to delete subscription:', err);
            setError('Failed to delete subscription. Please try again.'); // Set error state
            // Revert UI on error
            setSubscriptions(previousSubs);
            setUpcomingRenewals(previousRenewals);
        }
    };

    // Filter Logic
    const currentList = showUpcomingOnly ? upcomingRenewals : subscriptions;

    const filteredSubscriptions = currentList.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryCount = (category) => {
        if (category === 'All') return currentList.length;
        return currentList.filter(s => s.category === category).length;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="subscriptions-loading">
                    <Loader />
                    <p>Loading your subscriptions...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="subscriptions-page home-page">
                <div className="subscriptions-container">
                    {/* Header Section */}
                    <header className="subscriptions-header animate-fade-in">
                        <div className="header-content">
                            <h1>{showUpcomingOnly ? 'Upcoming Renewals' : 'My Subscriptions'}</h1>
                            <p>
                                {showUpcomingOnly
                                    ? `You have ${upcomingRenewals.length} subscription(s) renewing soon`
                                    : 'Manage your active subscriptions'
                                }
                            </p>
                        </div>
                        <Link to="/subscriptions/add" className="add-btn">
                            <FiPlus />
                            <span>Add New</span>
                        </Link>
                    </header>

                    {/* Search and Filters - Now at Top */}
                    <div className="subscriptions-toolbar animate-fade-in">
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Quick Toggle for Upcoming */}
                        <button
                            className={`filter-toggle ${showUpcomingOnly ? 'active' : ''}`}
                            onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                            style={{ marginRight: '8px' }}
                        >
                            ⚡ Upcoming
                        </button>

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

                    {/* Main List */}
                    {filteredSubscriptions.length === 0 ? (
                        <div className="empty-state animate-fade-in">
                            <div className="empty-icon">🔍</div>
                            <h3>No subscriptions found</h3>
                            <p>Try adjusting your search or filters</p>
                            {!showUpcomingOnly && subscriptions.length === 0 && (
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

export default Home;
