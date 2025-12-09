/**
 * @file StatCard.jsx
 * @description Reusable statistics card component for dashboard
 * @pattern Presentational Component Pattern
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * StatCard Component
 * Displays a statistic with icon, value, and change percentage
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number|string} props.value - Main value to display
 * @param {number} props.change - Percentage change (positive or negative)
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.color - Tailwind color class for icon background
 * @returns {JSX.Element} Stat card component
 */
const StatCard = ({ title, value, change, icon, color }) => {
  const Icon = icon;
  
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span 
          className={`flex items-center text-sm font-medium ${
            change >= 0 ? 'text-success-600' : 'text-error-600'
          }`}
        >
          {change > 0 && '+'}{change}%
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </span>
      </div>
      <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-text-main">{value}</p>
    </div>
  );
};

export default StatCard;
