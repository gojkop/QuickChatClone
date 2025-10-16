import React from 'react';

export default function InsightCard({ severity, title, issue, recommendations, onAction }) {
  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      subTextColor: 'text-green-800',
      buttonBg: 'bg-green-600',
      buttonHover: 'hover:bg-green-700',
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      subTextColor: 'text-red-800',
      buttonBg: 'bg-red-600',
      buttonHover: 'hover:bg-red-700',
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      subTextColor: 'text-yellow-800',
      buttonBg: 'bg-yellow-600',
      buttonHover: 'hover:bg-yellow-700',
    }
  };

  const color = colors[severity] || colors.medium;

  // Determine CTA based on severity
  const getCTA = () => {
    if (severity === 'success') {
      return {
        text: 'Share Your Success',
        action: () => onAction && onAction('share-kit'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        ),
      };
    }
    
    if (severity === 'high') {
      return {
        text: 'View Campaigns',
        action: () => onAction && onAction('campaigns'),
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      };
    }
    
    return null;
  };

  const cta = getCTA();

  return (
    <div className={`${color.bg} border ${color.border} rounded-lg p-4 shadow-elev-1`}>
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
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${color.textColor} mb-1`}>{title}</h4>
          {issue && <p className={`text-sm ${color.subTextColor} mb-3`}>{issue}</p>}
          
          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <ul className={`text-sm ${color.subTextColor} space-y-1.5 mb-3`}>
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action Button */}
          {cta && (
            <button
              onClick={cta.action}
              className={`${color.buttonBg} ${color.buttonHover} text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-base`}
            >
              {cta.icon}
              {cta.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}