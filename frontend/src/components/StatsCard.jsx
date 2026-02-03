import './StatsCard.css';

const StatsCard = ({ title, value, subtitle, icon, trend, color = 'primary' }) => {
    return (
        <div className={`stats-card stats-${color}`}>
            <div className="stats-icon">{icon}</div>
            <div className="stats-content">
                <span className="stats-title">{title}</span>
                <span className="stats-value">{value}</span>
                {subtitle && <span className="stats-subtitle">{subtitle}</span>}
                {trend !== undefined && (
                    <span className={`stats-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
