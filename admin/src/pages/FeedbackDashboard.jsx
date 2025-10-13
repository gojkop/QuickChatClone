import React, { useState, useEffect } from 'react';

// Mock UI Components
const Card = ({ children, padding = 'default' }) => (
  <div className={`bg-white rounded-lg shadow ${padding === 'none' ? '' : 'p-6'}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', fullWidth, disabled, onClick }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
  />
);

const Select = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none ${className}`}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div>{icon}</div>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Spinner = ({ size = 'md' }) => (
  <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 ${size === 'lg' ? 'w-12 h-12' : 'w-6 h-6'}`} />
);

// Constants
const FEEDBACK_TYPES = {
  bug: { label: 'Bug', color: 'danger', icon: '🐛' },
  feature: { label: 'Feature', color: 'success', icon: '💡' },
  feedback: { label: 'Feedback', color: 'info', icon: '😊' },
  question: { label: 'Question', color: 'warning', icon: '❓' },
  other: { label: 'Other', color: 'default', icon: '📝' },
};

const STATUS_CONFIG = {
  new: { label: 'New', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  resolved: { label: 'Resolved', color: 'success' },
  archived: { label: 'Archived', color: 'default' },
};

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'danger' },
  high: { label: 'High', color: 'warning' },
  medium: { label: 'Medium', color: 'info' },
  low: { label: 'Low', color: 'default' },
};

// ============================================================================
// DESKTOP ONE-LINER VIEW
// ============================================================================
function FeedbackRowDesktop({ feedback, onSelect, isSelected }) {
  const typeConfig = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other;
  const statusConfig = STATUS_CONFIG[feedback.status];
  const priorityConfig = PRIORITY_CONFIG[feedback.priority];

  return (
    <div
      onClick={() => onSelect(feedback)}
      className={`
        relative grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-100 
        cursor-pointer transition-all hover:bg-gray-50
        ${isSelected ? 'bg-indigo-50 border-indigo-200' : ''}
      `}
    >
      {/* Column 1: Type Icon (1 col) */}
      <div className="col-span-1 flex items-center justify-center">
        <span className="text-xl" title={typeConfig.label}>
          {typeConfig.icon}
        </span>
      </div>

      {/* Column 2: Status & Priority (2 cols) */}
      <div className="col-span-2 flex flex-col gap-1">
        <span className={`
          px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide inline-block text-center
          ${statusConfig.color === 'warning' ? 'bg-amber-100 text-amber-700' : ''}
          ${statusConfig.color === 'info' ? 'bg-blue-100 text-blue-700' : ''}
          ${statusConfig.color === 'success' ? 'bg-green-100 text-green-700' : ''}
          ${statusConfig.color === 'default' ? 'bg-gray-100 text-gray-700' : ''}
        `}>
          {statusConfig.label}
        </span>
        <span className={`
          px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide inline-block text-center
          ${priorityConfig.color === 'danger' ? 'bg-red-100 text-red-700' : ''}
          ${priorityConfig.color === 'warning' ? 'bg-orange-100 text-orange-700' : ''}
          ${priorityConfig.color === 'info' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${priorityConfig.color === 'default' ? 'bg-gray-100 text-gray-700' : ''}
        `}>
          {priorityConfig.label}
        </span>
      </div>

      {/* Column 3: Message (5 cols) */}
      <div className="col-span-5">
        <p className="text-sm text-gray-900 truncate font-medium">
          {feedback.message}
        </p>
        {feedback.email && (
          <p className="text-xs text-indigo-600 truncate mt-0.5">
            📧 {feedback.email}
          </p>
        )}
      </div>

      {/* Column 4: Metadata (3 cols) */}
      <div className="col-span-3 flex items-center gap-3 text-xs text-gray-500">
        {feedback.rating && (
          <span title={`Rating: ${feedback.rating}/5`}>
            {'⭐'.repeat(feedback.rating)}
          </span>
        )}
        
        {feedback.attachment_count > 0 && (
          <span title={`${feedback.attachment_count} attachments`}>
            📎 {feedback.attachment_count}
          </span>
        )}

        {feedback.comment_count > 0 && (
          <span title={`${feedback.comment_count} comments`}>
            💬 {feedback.comment_count}
          </span>
        )}

        {feedback.jira_ticket_key && (
          <span className="text-purple-600 font-mono text-[10px]" title="Jira ticket">
            {feedback.jira_ticket_key}
          </span>
        )}
      </div>

      {/* Column 5: Date (1 col) */}
      <div className="col-span-1 text-right">
        <span className="text-[11px] text-gray-500 whitespace-nowrap">
          {new Date(feedback.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
      )}
    </div>
  );
}

// ============================================================================
// MOBILE CARD VIEW
// ============================================================================
function FeedbackCardMobile({ feedback, onSelect, isSelected }) {
  const typeConfig = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other;
  const statusConfig = STATUS_CONFIG[feedback.status];
  const priorityConfig = PRIORITY_CONFIG[feedback.priority];

  return (
    <div 
      onClick={() => onSelect(feedback)}
      className={`
        relative p-4 border-b border-gray-100 cursor-pointer transition-all
        hover:bg-gray-50
        ${isSelected ? 'bg-indigo-50 border-indigo-200' : ''}
      `}
    >
      <div className="space-y-3">
        {/* Row 1: Type, Status, Priority */}
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" title={typeConfig.label}>
            {typeConfig.icon}
          </span>
          
          <div className="flex flex-wrap gap-2 flex-1">
            <span className={`
              px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide
              ${statusConfig.color === 'warning' ? 'bg-amber-100 text-amber-700' : ''}
              ${statusConfig.color === 'info' ? 'bg-blue-100 text-blue-700' : ''}
              ${statusConfig.color === 'success' ? 'bg-green-100 text-green-700' : ''}
              ${statusConfig.color === 'default' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              {statusConfig.label}
            </span>
            
            <span className={`
              px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide
              ${priorityConfig.color === 'danger' ? 'bg-red-100 text-red-700' : ''}
              ${priorityConfig.color === 'warning' ? 'bg-orange-100 text-orange-700' : ''}
              ${priorityConfig.color === 'info' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${priorityConfig.color === 'default' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              {priorityConfig.label}
            </span>
          </div>
        </div>

        {/* Row 2: Message */}
        <div>
          <p className="text-sm text-gray-900 line-clamp-2 font-medium">
            {feedback.message}
          </p>
        </div>

        {/* Row 3: Email if present */}
        {feedback.email && (
          <div className="text-xs text-indigo-600">
            📧 {feedback.email}
          </div>
        )}

        {/* Row 4: Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {feedback.rating && (
              <span title={`Rating: ${feedback.rating}/5`}>
                {'⭐'.repeat(feedback.rating)}
              </span>
            )}
            
            {feedback.attachment_count > 0 && (
              <span title={`${feedback.attachment_count} attachments`}>
                📎 {feedback.attachment_count}
              </span>
            )}

            {feedback.comment_count > 0 && (
              <span title={`${feedback.comment_count} comments`}>
                💬 {feedback.comment_count}
              </span>
            )}

            {feedback.jira_ticket_key && (
              <span className="text-purple-600 font-mono text-[10px]" title="Jira ticket">
                {feedback.jira_ticket_key}
              </span>
            )}
          </div>

          <span className="text-[11px]">
            {new Date(feedback.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
      )}
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
export default function FeedbackDashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    status: '',
    priority: '',
    search: '',
  });

  // Mock feedback data
  const [feedback] = useState([
    {
      id: '1',
      type: 'bug',
      message: 'Login button not responding after clicking multiple times. Need to refresh the page to make it work.',
      status: 'new',
      priority: 'high',
      email: 'user@example.com',
      rating: 2,
      attachment_count: 2,
      comment_count: 1,
      jira_ticket_key: 'MIND-123',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'feature',
      message: 'Would love to see a dark mode option for the dashboard. My eyes hurt after long sessions.',
      status: 'in_progress',
      priority: 'medium',
      email: 'designer@example.com',
      rating: 4,
      attachment_count: 0,
      comment_count: 3,
      jira_ticket_key: null,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'feedback',
      message: 'The new UI is amazing! Love the clean design and smooth animations.',
      status: 'resolved',
      priority: 'low',
      email: null,
      rating: 5,
      attachment_count: 1,
      comment_count: 0,
      jira_ticket_key: null,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '4',
      type: 'question',
      message: 'How do I export my data as CSV? Cannot find the option anywhere in the settings.',
      status: 'new',
      priority: 'medium',
      email: 'analyst@example.com',
      rating: 3,
      attachment_count: 0,
      comment_count: 0,
      jira_ticket_key: null,
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: '5',
      type: 'bug',
      message: 'Payment page crashes on mobile Safari when I try to submit card details.',
      status: 'new',
      priority: 'critical',
      email: 'mobile.user@example.com',
      rating: 1,
      attachment_count: 3,
      comment_count: 5,
      jira_ticket_key: 'MIND-124',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const stats = {
    total: feedback.length,
    avgRating: 3.8,
    pending: 3,
    avgResponseTime: '2.3h'
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      type: '',
      status: '',
      priority: '',
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Dashboard</h1>
            <p className="text-gray-600">User feedback, bug reports, and feature requests</p>
          </div>
          <Button variant="secondary" size="sm">
            🔄 Refresh
          </Button>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Feedback"
            value={stats.total}
            icon={<span className="text-2xl">📝</span>}
          />
          <StatCard
            label="Avg Rating"
            value={`${stats.avgRating}★`}
            icon={<span className="text-2xl">⭐</span>}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<span className="text-2xl">⏳</span>}
          />
          <StatCard
            label="Avg Response"
            value={stats.avgResponseTime}
            icon={<span className="text-2xl">⚡</span>}
          />
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...Object.entries(FEEDBACK_TYPES).map(([key, config]) => ({
                    value: key,
                    label: `${config.icon} ${config.label}`
                  }))
                ]}
              />
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label
                  }))
                ]}
              />
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                options={[
                  { value: '', label: 'All Priority' },
                  ...Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label
                  }))
                ]}
              />
              <div className="sm:col-span-2 lg:col-span-2">
                <Button variant="secondary" onClick={clearFilters} fullWidth>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback List - Platform Aware */}
        <Card padding="none">
          {/* Desktop: Table Header */}
          {!isMobile && (
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-2">Status/Priority</div>
              <div className="col-span-5">Message</div>
              <div className="col-span-3">Details</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
          )}

          {/* Feedback Items */}
          <div>
            {feedback.length > 0 ? (
              feedback.map(item => (
                isMobile ? (
                  <FeedbackCardMobile
                    key={item.id}
                    feedback={item}
                    onSelect={setSelectedFeedback}
                    isSelected={selectedFeedback?.id === item.id}
                  />
                ) : (
                  <FeedbackRowDesktop
                    key={item.id}
                    feedback={item}
                    onSelect={setSelectedFeedback}
                    isSelected={selectedFeedback?.id === item.id}
                  />
                )
              ))
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No feedback found"
                  description="Try adjusting your filters or wait for new feedback to arrive"
                />
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {feedback.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">1</span> to{' '}
                  <span className="font-semibold">{feedback.length}</span> of{' '}
                  <span className="font-semibold">{stats.total}</span> results
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled>
                    ← Prev
                  </Button>
                  <span className="text-sm text-gray-600">Page 1</span>
                  <Button variant="secondary" size="sm" disabled>
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Platform Indicator */}
        <div className="text-center text-sm text-gray-500">
          Currently viewing: <span className="font-semibold">{isMobile ? 'Mobile' : 'Desktop'}</span> layout
          <br />
          <span className="text-xs">Resize your window to see the responsive design in action</span>
        </div>
      </div>
    </div>
  );
}