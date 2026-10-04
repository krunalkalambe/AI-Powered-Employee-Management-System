import React from 'react';

const StatCard = ({ title, value, icon: Icon, subtext, trend, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrap">
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {subtext && <p className="stat-card-subtext">{subtext}</p>}
        {trend && (
          <span className={`stat-card-trend trend-${trend.type || 'up'}`}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
