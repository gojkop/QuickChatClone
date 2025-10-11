// admin/src/components/ui/index.js
// Reusable UI components aligned with mindPick brand guidelines

import React from 'react';

// ============================================================================
// Button Component
// ============================================================================
export function Button({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  children, 
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-md disabled:opacity-50',
    secondary: 'border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      disabled={disabled}
      className={`
        font-medium rounded-lg transition-all duration-200
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Badge Component (Status Pills)
// ============================================================================
export function Badge({ 
  variant = 'default', 
  children,
  className = '' 
}) {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}

// ============================================================================
// Card Component
// ============================================================================
export function Card({ 
  children, 
  className = '',
  padding = 'default',
  hover = false 
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100
      ${paddings[padding]}
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// ============================================================================
// Input Component
// ============================================================================
export function Input({ 
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props 
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          px-4 py-2.5 bg-white border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-300' : 'border-gray-200'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// ============================================================================
// Select Component
// ============================================================================
export function Select({ 
  label,
  error,
  options = [],
  fullWidth = true,
  className = '',
  ...props 
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          px-4 py-2.5 bg-white border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-300' : 'border-gray-200'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================
export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-indigo-600" />
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}

// ============================================================================
// Loading Spinner
// ============================================================================
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg 
        className="animate-spin text-indigo-600" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// Section Header
// ============================================================================
export function SectionHeader({ 
  title, 
  description,
  action,
  className = '' 
}) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================================================
// Stat Card (Dashboard KPIs)
// ============================================================================
export function StatCard({ 
  label, 
  value, 
  change,
  trend = 'neutral',
  icon: Icon 
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  return (
    <Card padding="default" hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-semibold ${trendColors[trend]}`}>
                {change}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Modal Component
// ============================================================================
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer 
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component (Mobile Responsive)
// ============================================================================
export function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i}
                className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr 
              key={i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
            >
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-4 text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Export all components
// ============================================================================
export default {
  Button,
  Badge,
  Card,
  Input,
  Select,
  EmptyState,
  Spinner,
  SectionHeader,
  StatCard,
  Modal,
  Table
};