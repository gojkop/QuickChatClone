import React from 'react';

export default function InsightCard({ severity, title, issue, recommendations }) {
  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      subTextColor: 'text-green-800'
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      subTextColor: 'text-red-800'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      subTextColor: 'text-yellow-800'
    }
  };

  const color = colors[severity] || colors.medium;

  return (
    <div className={`${color.bg} border ${color.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${color.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          {severity === 'success' ? (
            <svg className={`w-5 h-5 ${color.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${color.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${color.textColor} mb-1`}>{title}</h4>
          {issue && <p className={`text-sm ${color.subTextColor} mb-3`}>{issue}</p>}
          {recommendations && recommendations.length > 0 && (
            <ul className={`text-sm ${color.subTextColor} space-y-1`}>
              {recommendations.map((rec, idx) => (
                <li key={idx}>• {rec}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}