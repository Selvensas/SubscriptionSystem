import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import { Navbar, StatsCard, Loader } from '../components';
import { FiTrendingUp, FiCalendar, FiDollarSign, FiPackage, FiPieChart, FiActivity } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [upcomingRenewals, setUpcomingRenewals] = useState([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (user?._id && !hasFetched.current) {
            hasFetched.current = true;
            fetchData();
        }
    }, [user]);

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

    // Analytics Calculations
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');

    // Total Monthly Spending
    const totalMonthly = activeSubscriptions.reduce((acc, sub) => {
        let monthly = sub.price;
        if (sub.frequency === 'Yearly') monthly = sub.price / 12;
        if (sub.frequency === 'Weekly') monthly = sub.price * 4;
        if (sub.frequency === 'Daily') monthly = sub.price * 30;
        return acc + monthly;
    }, 0);

    // Total Yearly Spending
    const totalYearly = totalMonthly * 12;

    // Spending by Category
    const categorySpend = activeSubscriptions.reduce((acc, sub) => {
        let monthly = sub.price;
        if (sub.frequency === 'Yearly') monthly = sub.price / 12;
        if (sub.frequency === 'Weekly') monthly = sub.price * 4;
        if (sub.frequency === 'Daily') monthly = sub.price * 30;

        acc[sub.category] = (acc[sub.category] || 0) + monthly;
        return acc;
    }, {});

    const sortedCategories = Object.entries(categorySpend)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

    const mostExpensive = activeSubscriptions.sort((a, b) => {
        // Normalize to monthly for comparison
        const getMonthly = (s) => {
            if (s.frequency === 'Yearly') return s.price / 12;
            if (s.frequency === 'Weekly') return s.price * 4;
            if (s.frequency === 'Daily') return s.price * 30;
            return s.price;
        };
        return getMonthly(b) - getMonthly(a);
    })[0];

    // Spend Distribution (Weekly vs Monthly vs Yearly)
    const frequencySpend = activeSubscriptions.reduce((acc, sub) => {
        let monthly = sub.price;
        if (sub.frequency === 'Yearly') monthly = sub.price / 12;
        if (sub.frequency === 'Weekly') monthly = sub.price * 4;
        if (sub.frequency === 'Daily') monthly = sub.price * 30;

        const key = sub.frequency; // Use exact frequency
        acc[key] = (acc[key] || 0) + monthly;
        return acc;
    }, { Weekly: 0, Monthly: 0, Yearly: 0, Daily: 0 });

    const totalSpend = Object.values(frequencySpend).reduce((a, b) => a + b, 0);

    // Filter out zero values for active frequencies
    const activeFrequencies = Object.entries(frequencySpend)
        .filter(([, value]) => value > 0)
        .sort(([, a], [, b]) => b - a);

    const maxCategorySpend = sortedCategories.length > 0 ? sortedCategories[0].value : 0;


    if (loading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-loading">
                    <Loader />
                    <p>Loading analytics...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="dashboard">
                <div className="dashboard-container">
                    <header className="dashboard-header animate-fade-in">
                        <div className="header-content">
                            <h1>Analytics Dashboard</h1>
                            <p>Overview of your spending habits and financial stats</p>
                        </div>
                    </header>

                    {/* Key Metrics */}
                    <section className="stats-section">
                        <StatsCard
                            title="Monthly Budget"
                            value={`$${totalMonthly.toFixed(2)}`}
                            icon={<FiDollarSign />}
                            color="primary"
                        />
                        <StatsCard
                            title="Est. Annual Cost"
                            value={`$${totalYearly.toFixed(2)}`}
                            subtitle="Based on current subs"
                            icon={<FiTrendingUp />}
                            color="success"
                        />
                        <StatsCard
                            title="Renewals (30d)"
                            value={upcomingRenewals.length}
                            subtitle={upcomingRenewals.length > 0 ? "Renewing soon" : "No upcoming bills"}
                            icon={<FiCalendar />}
                            color="warning"
                        />
                        <StatsCard
                            title="Avg. Cost/Sub"
                            value={`$${(activeSubscriptions.length ? totalMonthly / activeSubscriptions.length : 0).toFixed(2)}`}
                            icon={<FiActivity />}
                            color="error"
                        />
                    </section>

                    {/* Detailed Analysis Grid */}
                    <div className="analytics-grid animate-slide-up">

                        {/* Spending by Category Chart */}
                        <div className="analytics-card glass">
                            <div className="card-header">
                                <h3><FiPieChart style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Spending by Category</h3>
                            </div>
                            <div className="chart-container">
                                {sortedCategories.length > 0 ? (
                                    sortedCategories.slice(0, 5).map((cat, index) => (
                                        <div key={cat.name} className="chart-bar-row">
                                            <div className="bar-info">
                                                <span className="bar-label">{cat.name}</span>
                                                <span className="bar-value">${cat.value.toFixed(2)}/mo</span>
                                            </div>
                                            <div className="bar-bg">
                                                <div
                                                    className="bar-fill"
                                                    style={{
                                                        width: `${(cat.value / maxCategorySpend) * 100}%`,
                                                        animationDelay: `${index * 0.1}s`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No active subscriptions to analyze.</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Frequency Chart */}
                        <div className="analytics-card glass">
                            <div className="card-header">
                                <h3><FiActivity style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Cost by Frequency</h3>
                            </div>
                            <div className="chart-container" style={{ justifyContent: 'center', height: '100%' }}>
                                {totalSpend > 0 ? (
                                    <div className="distribution-chart">
                                        {activeFrequencies.map(([type, val]) => {
                                            const percent = (val / totalSpend) * 100;
                                            return (
                                                <div key={type} className="dist-row">
                                                    <div className="dist-label">
                                                        <span>{type} Payments</span>
                                                        <span>{percent.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="bar-bg">
                                                        <div
                                                            className="bar-fill"
                                                            style={{
                                                                width: `${percent}%`,
                                                                backgroundColor: type === 'Yearly' ? 'var(--accent-secondary)' :
                                                                    type === 'Monthly' ? 'var(--accent-primary)' :
                                                                        'var(--warning)'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <p className="dist-value">${val.toFixed(2)}/mo equivalent</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="no-data">Add subscriptions to see distribution.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Expense Card */}
                        <div className="analytics-card glass">
                            <div className="card-header">
                                <h3>🏆 Most Expensive</h3>
                            </div>
                            {mostExpensive ? (
                                <div className="highlight-stat">
                                    <div className="highlight-icon">{mostExpensive.name.charAt(0)}</div>
                                    <div className="highlight-details">
                                        <h4>{mostExpensive.name}</h4>
                                        <div className="price-tag">${mostExpensive.price} <span className="freq">/{mostExpensive.frequency}</span></div>
                                        <p className="category-badge">{mostExpensive.category}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="no-data">No data available.</p>
                            )}
                        </div>

                        {/* Status Overview */}
                        <div className="analytics-card glass">
                            <div className="card-header">
                                <h3><FiPackage style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Status Overview</h3>
                            </div>
                            <div className="simple-stats-row">
                                {['Active', 'Cancelled', 'Expired'].map(status => {
                                    const count = subscriptions.filter(s => s.status === status).length;
                                    return (
                                        <div key={status} className="stat-pill">
                                            <span className="stat-label">{status}</span>
                                            <span className={`stat-count status-${status.toLowerCase()}`}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Category Distribution Donut Chart (New) */}
                        <div className="analytics-card glass full-width">
                            <div className="card-header">
                                <h3><FiPieChart style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Category Distribution</h3>
                            </div>
                            <div className="donut-chart-container">
                                {sortedCategories.length > 0 ? (
                                    <div className="donut-chart" style={{
                                        background: `conic-gradient(
                                            ${sortedCategories.reduce((acc, cat, idx) => {
                                            const prevPercent = idx === 0 ? 0 : acc.prev;
                                            const currentPercent = prevPercent + ((cat.value / totalMonthly) * 100);
                                            // Generate slightly distinctive colors or cycle vars
                                            const color = idx % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)';
                                            // We need distinct colors for a donut, let's use HSL based on index
                                            const dynamicColor = `hsl(${210 + (idx * 40)}, 85%, 60%)`;

                                            acc.stops.push(`${dynamicColor} 0 ${currentPercent}%`);
                                            acc.prev = currentPercent;
                                            return acc;
                                        }, { stops: [], prev: 0 }).stops.join(', ')}
                                        )`
                                    }}>
                                        <div className="donut-hole">
                                            <span>${totalMonthly.toFixed(0)}</span>
                                            <small>/mo</small>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="no-data">No data for chart.</p>
                                )}
                                <div className="donut-legend">
                                    {sortedCategories.slice(0, 6).map((cat, idx) => (
                                        <div key={cat.name} className="legend-item">
                                            <span className="legend-dot" style={{ backgroundColor: `hsl(${210 + (idx * 40)}, 85%, 60%)` }}></span>
                                            <span>{cat.name} ({Math.round(cat.value / totalMonthly * 100)}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;
