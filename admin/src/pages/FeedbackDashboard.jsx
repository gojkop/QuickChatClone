// admin/src/pages/FeedbackDashboard.jsx
// Main feedback dashboard with filters, table, and detail panel - FIXED

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Input,
  Select,
  Modal,
  SectionHeader,
  EmptyState,
  Spinner,
  StatCard
} from '../components/ui';
import { useToast } from '../components/Toast';
import { TrendLineChart, DonutChart } from '../components/charts';

// ============================================================================
// CONSTANTS
// ============================================================================

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
  duplicate: { label: 'Duplicate', color: 'default' },
  wont_fix: { label: "Won't Fix", color: 'default' },
};

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'danger' },
  high: { label: 'High', color: 'warning' },
  medium: { label: 'Medium', color: 'info' },
  low: { label: 'Low', color: 'default' },
};

const JOURNEY_STAGES = {
  awareness: { label: 'Awareness', icon: '🔍' },
  consideration: { label: 'Consideration', icon: '🤔' },
  conversion: { label: 'Conversion', icon: '💳' },
  retention: { label: 'Retention', icon: '🔄' },
};

// ============================================================================
// FEEDBACK ROW COMPONENT
// ============================================================================

function FeedbackRow({ feedback, onSelect, isSelected }) {
  const typeConfig = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other;
  const statusConfig = STATUS_CONFIG[feedback.status];
  const priorityConfig = PRIORITY_CONFIG[feedback.priority];

  return (
    <div 
      onClick={() => onSelect(feedback)}
      className={`
        p-4 border rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{typeConfig.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge variant={priorityConfig.color}>
              {priorityConfig.label}
            </Badge>
            <Badge variant={typeConfig.color}>
              {typeConfig.label}
            </Badge>
            
            {feedback.journey_stage && (
              <span className="text-xs text-gray-500">
                {JOURNEY_STAGES[feedback.journey_stage]?.icon} {JOURNEY_STAGES[feedback.journey_stage]?.label}
              </span>
            )}
          </div>

          {/* Message preview */}
          <p className="text-sm text-gray-900 line-clamp-2 mb-2">
            {feedback.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {new Date(feedback.created_at).toLocaleDateString()}
            </span>
            <span>
              {feedback.page_url.split('?')[0].substring(0, 30)}...
            </span>
            {feedback.email && (
              <span className="text-indigo-600">
                📧 {feedback.email}
              </span>
            )}
            {feedback.attachment_count > 0 && (
              <span>
                📎 {feedback.attachment_count}
              </span>
            )}
            {feedback.comment_count > 0 && (
              <span>
                💬 {feedback.comment_count}
              </span>
            )}
            {feedback.jira_ticket_key && (
              <span className="text-purple-600">
                🎫 {feedback.jira_ticket_key}
              </span>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DETAIL PANEL COMPONENT
// ============================================================================

function FeedbackDetailPanel({ feedback, onClose, onUpdate, onCreateJira }) {
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!feedback) return null;

  const typeConfig = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other;

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      // Add comment logic here
      setComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Feedback #{feedback.id.slice(0, 8)}
          </h3>
          <p className="text-xs text-gray-500">
            {new Date(feedback.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Type & Status */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{typeConfig.icon}</span>
            <div>
              <Badge variant={FEEDBACK_TYPES[feedback.type]?.color}>
                {typeConfig.label}
              </Badge>
              <Badge variant={PRIORITY_CONFIG[feedback.priority]?.color} className="ml-2">
                {PRIORITY_CONFIG[feedback.priority]?.label}
              </Badge>
              <Badge variant={STATUS_CONFIG[feedback.status]?.color} className="ml-2">
                {STATUS_CONFIG[feedback.status]?.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* User info */}
        {(feedback.email || feedback.user_id) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">User</h4>
            {feedback.email && (
              <p className="text-sm text-gray-900">
                📧 {feedback.email}
                {feedback.wants_followup && (
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Wants follow-up
                  </span>
                )}
              </p>
            )}
            {feedback.user_id && (
              <p className="text-sm text-gray-600">
                User ID: {feedback.user_id}
              </p>
            )}
            {feedback.is_authenticated && (
              <p className="text-xs text-gray-500 mt-1">
                {feedback.user_role} • Account age: {feedback.account_age_days || 0} days
              </p>
            )}
          </div>
        )}

        {/* Message */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {feedback.message}
            </p>
          </div>
        </div>

        {/* Bug-specific fields */}
        {feedback.type === 'bug' && (feedback.expected_behavior || feedback.actual_behavior) && (
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Bug Details</h4>
            {feedback.expected_behavior && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-600">Expected:</p>
                <p className="text-sm text-gray-900">{feedback.expected_behavior}</p>
              </div>
            )}
            {feedback.actual_behavior && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-600">Actual:</p>
                <p className="text-sm text-gray-900">{feedback.actual_behavior}</p>
              </div>
            )}
            {feedback.reproduction_steps && (
              <div>
                <p className="text-xs font-semibold text-gray-600">Steps:</p>
                <p className="text-sm text-gray-900">{feedback.reproduction_steps}</p>
              </div>
            )}
          </div>
        )}

        {/* Context */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Page:</span>
              <span className="text-gray-900 font-mono text-xs">{feedback.page_url}</span>
            </div>
            {feedback.device_type && (
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="text-gray-900">{feedback.device_type}</span>
              </div>
            )}
            {feedback.journey_stage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Journey:</span>
                <span className="text-gray-900">
                  {JOURNEY_STAGES[feedback.journey_stage]?.label}
                </span>
              </div>
            )}
            {feedback.rating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="text-yellow-500">{'⭐'.repeat(feedback.rating)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {feedback.attachments && feedback.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Attachments ({feedback.attachments.length})
            </h4>
            <div className="space-y-2">
              {feedback.attachments.map(att => (
                <a
                  key={att.id}
                  href={att.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm truncate flex-1">{att.file_name}</span>
                  <span className="text-xs text-gray-500">
                    {(att.file_size / 1024).toFixed(0)} KB
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Internal Comments */}
        {feedback.comments && feedback.comments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Internal Notes ({feedback.comments.length})
            </h4>
            <div className="space-y-2">
              {feedback.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-900">{comment.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.admin_name} • {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add comment */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Internal Note</h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition resize-none text-sm"
            rows="3"
            placeholder="Add a note for your team..."
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddComment}
            disabled={!comment.trim() || isSubmittingComment}
            className="mt-2"
          >
            {isSubmittingComment ? 'Adding...' : 'Add Note'}
          </Button>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            fullWidth
            onClick={() => onCreateJira(feedback)}
            disabled={!!feedback.jira_ticket_key}
          >
            {feedback.jira_ticket_key ? (
              <>🎫 Jira: {feedback.jira_ticket_key}</>
            ) : (
              <>🎫 Create Jira Ticket</>
            )}
          </Button>
          
          {feedback.email && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.location.href = `mailto:${feedback.email}`}
            >
              ✉️ Email User
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={feedback.status}
              onChange={(e) => onUpdate({ status: e.target.value })}
              options={Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                value: key,
                label: config.label
              }))}
            />
            <Select
              value={feedback.priority}
              onChange={(e) => onUpdate({ priority: e.target.value })}
              options={Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
                value: key,
                label: config.label
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function FeedbackDashboard() {
  const toast = useToast();
  
  // State
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailData, setDetailData] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    status: '',
    priority: '',
    journey_stage: '',
    search: '',
    date_from: '',
    date_to: '',
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    pending: 0,
    avgResponseTime: 0,
  });

  // Load feedback on mount and filter change
  useEffect(() => {
    loadFeedback();
  }, [filters]);

  // Load detail when feedback is selected
  useEffect(() => {
    if (selectedFeedback) {
      loadFeedbackDetail(selectedFeedback.id);
    } else {
      setDetailData(null);
    }
  }, [selectedFeedback]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  const loadFeedback = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const res = await fetch(`/api/feedback?${queryParams}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch feedback');
      
      const data = await res.json();
      setFeedback(data.feedback || []);
      
      // Calculate stats
      setStats({
        total: data.pagination?.total || 0,
        avgRating: calculateAvgRating(data.feedback),
        pending: data.feedback?.filter(f => f.status === 'new').length || 0,
        avgResponseTime: '2.3h', // TODO: Calculate from data
      });
      
    } catch (error) {
      console.error('Load feedback error:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackDetail = async (id) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch detail');
      
      const data = await res.json();
      setDetailData(data);
      
    } catch (error) {
      console.error('Load detail error:', error);
      toast.error('Failed to load feedback detail');
    }
  };

  const updateFeedback = async (id, updates) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      toast.success('Feedback updated');
      loadFeedback();
      if (selectedFeedback?.id === id) {
        loadFeedbackDetail(id);
      }
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update feedback');
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const calculateAvgRating = (items) => {
    const rated = items.filter(f => f.rating);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, f) => acc + f.rating, 0);
    return (sum / rated.length).toFixed(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      type: '',
      status: '',
      priority: '',
      journey_stage: '',
      search: '',
      date_from: '',
      date_to: '',
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && feedback.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Feedback Dashboard"
        description="User feedback, bug reports, and feature requests"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadFeedback}>
              🔄 Refresh
            </Button>
            <Button variant="secondary">
              📊 Export CSV
            </Button>
          </div>
        }
      />

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
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
          <Select
            value={filters.journey_stage}
            onChange={(e) => handleFilterChange('journey_stage', e.target.value)}
            options={[
              { value: '', label: 'All Journeys' },
              ...Object.entries(JOURNEY_STAGES).map(([key, config]) => ({
                value: key,
                label: `${config.icon} ${config.label}`
              }))
            ]}
          />
          <Button variant="secondary" onClick={clearFilters} fullWidth>
            Clear
          </Button>
        </div>
      </Card>

      {/* Feedback List */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Feedback ({feedback.length})
          </h2>
        </div>
        
        <div className="p-6 space-y-3">
          {feedback.length > 0 ? (
            feedback.map(item => (
              <FeedbackRow
                key={item.id}
                feedback={item}
                onSelect={setSelectedFeedback}
                isSelected={selectedFeedback?.id === item.id}
              />
            ))
          ) : (
            <EmptyState
              title="No feedback found"
              description="Try adjusting your filters"
            />
          )}
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedFeedback && detailData && (
        <FeedbackDetailPanel
          feedback={{ ...selectedFeedback, ...detailData.feedback, ...detailData }}
          onClose={() => setSelectedFeedback(null)}
          onUpdate={(updates) => updateFeedback(selectedFeedback.id, updates)}
          onCreateJira={(feedback) => {
            // TODO: Implement Jira creation
            toast.info('Jira integration coming soon');
          }}
        />
      )}
    </div>
  );
}