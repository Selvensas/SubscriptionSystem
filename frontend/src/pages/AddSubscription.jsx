import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import { Navbar, Loader } from '../components';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import './AddSubscription.css';

const categories = ['Entertainment', 'Education', 'Productivity', 'Health', 'Finance', 'Other'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'QAR', 'JPY'];
const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay', 'Other'];

const AddSubscription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        currency: 'USD',
        frequency: 'Monthly',
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        startDate: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await subscriptionsAPI.create({
                ...formData,
                price: parseFloat(formData.price),
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="add-subscription-page">
                <div className="add-subscription-container">
                    <Link to="/" className="back-link animate-fade-in">
                        <FiArrowLeft />
                        <span>Back to Home</span>
                    </Link>

                    <div className="form-card glass animate-scale-in">
                        <div className="form-header">
                            <h1>Add New Subscription</h1>
                            <p>Track a new recurring subscription</p>
                        </div>

                        {error && (
                            <div className="form-error">
                                <FiAlertCircle />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="subscription-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label htmlFor="name">Subscription Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Netflix, Spotify, Gym Membership"
                                        required
                                        minLength={2}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="currency">Currency *</label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">Price *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="frequency">Billing Frequency *</label>
                                    <select
                                        id="frequency"
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                        required
                                    >
                                        {frequencies.map(freq => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="paymentMethod">Payment Method *</label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        required
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date *</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link to="/" className="cancel-btn">
                                    Cancel
                                </Link>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? (
                                        <Loader scale={0.4} fullScreen={false} />
                                    ) : (
                                        <>
                                            <FiSave />
                                            <span>Save Subscription</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AddSubscription;
