import { FiTrash2, FiXCircle, FiCalendar, FiCreditCard, FiRepeat } from 'react-icons/fi';
import './SubscriptionCard.css';

const categoryIcons = {
    Entertainment: '🎬',
    Education: '📚',
    Productivity: '⚡',
    Health: '💪',
    Finance: '💰',
    Other: '📦',
};

const SubscriptionCard = ({ subscription, onCancel, onDelete, index = 0 }) => {
    const {
        _id,
        name,
        price,
        currency,
        frequency,
        category,
        status,
        startDate,
        renewalDate,
        paymentMethod,
    } = subscription;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount, curr) => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            AUD: 'A$',
            CAD: 'C$',
            QAR: 'QR',
            JPY: '¥',
        };
        return `${symbols[curr] || curr}${amount.toFixed(2)}`;
    };

    const getDaysUntilRenewal = () => {
        if (!renewalDate) return null;
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntil = getDaysUntilRenewal();

    return (
        <div
            className={`subscription-card animate-slide-up stagger-${Math.min(index + 1, 5)}`}
            data-category={category.toLowerCase()}
        >
            <div className="card-header">
                <div className="card-icon">{categoryIcons[category] || '📦'}</div>
                <div className="card-title-section">
                    <h3 className="card-title">{name}</h3>
                    <span className="card-category">{category}</span>
                </div>
                <span className={`status-badge status-${status.toLowerCase()}`}>
                    {status}
                </span>
            </div>

            <div className="card-price">
                <span className="price-amount">{formatCurrency(price, currency)}</span>
                <span className="price-frequency">/{frequency.toLowerCase()}</span>
            </div>

            <div className="card-details">
                <div className="detail-item">
                    <FiCalendar />
                    <span>Started {formatDate(startDate)}</span>
                </div>
                {renewalDate && (
                    <div className="detail-item">
                        <FiRepeat />
                        <span>
                            Renews {formatDate(renewalDate)}
                            {daysUntil !== null && daysUntil > 0 && status === 'Active' && (
                                <span className={`days-badge ${daysUntil <= 7 ? 'urgent' : ''}`}>
                                    {daysUntil} days
                                </span>
                            )}
                        </span>
                    </div>
                )}
                <div className="detail-item">
                    <FiCreditCard />
                    <span>{paymentMethod}</span>
                </div>
            </div>

            <div className="card-actions">
                {status === 'Active' && (
                    <button
                        className="action-btn cancel-btn"
                        onClick={() => onCancel(_id)}
                        title="Cancel subscription"
                    >
                        <FiXCircle />
                        <span>Cancel</span>
                    </button>
                )}
                <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(_id)}
                    title="Delete subscription"
                >
                    <FiTrash2 />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
};

export default SubscriptionCard;
