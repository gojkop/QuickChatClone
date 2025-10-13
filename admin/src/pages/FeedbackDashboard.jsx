// admin/src/pages/FeedbackDashboard.jsx - PLATFORM-AWARE VERSION
// Desktop: Compact one-liner rows
// Mobile: Full card layout
// All functionality preserved: API calls, Jira, updates, delete, etc.

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
// MOBILE CARD VIEW (Original)
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
      {/* Mobile & Tablet: Card Layout */}
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

            {feedback.journey_stage && (
              <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium">
                {JOURNEY_STAGES[feedback.journey_stage]?.icon} {JOURNEY_STAGES[feedback.journey_stage]?.label}
              </span>
            )}
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
            
            {feedback.device_type === 'mobile' && <span title="Mobile">📱</span>}
            {feedback.device_type === 'desktop' && <span title="Desktop">💻</span>}
            {feedback.device_type === 'tablet' && <span title="Tablet">📱</span>}
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
// DETAIL PANEL (Original - No Changes)
// ============================================================================
function FeedbackDetailPanel({ feedback, onClose, onUpdate, onCreateJira, onReload, onDelete }) {
  const toast = useToast();
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!feedback) return null;

  const typeConfig = FEEDBACK_TYPES[feedback.type] || FEEDBACK_TYPES.other;

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/feedback/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          feedback_id: feedback.id,
          comment: comment.trim(),
          is_internal: true
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to add comment' }));
        throw new Error(error.error || 'Failed to add comment');
      }

      setComment('');
      toast.success('Note added successfully');
      
      if (onReload) {
        onReload();
      }
      
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error(error.message || 'Failed to add note');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:right-0 sm:left-auto h-full w-full sm:w-[500px] bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
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
      <div className="p-4 sm:p-6 space-y-6">
        {/* Type & Status */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-3xl">{typeConfig.icon}</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant={FEEDBACK_TYPES[feedback.type]?.color}>
                {typeConfig.label}
              </Badge>
              <Badge variant={PRIORITY_CONFIG[feedback.priority]?.color}>
                {PRIORITY_CONFIG[feedback.priority]?.label}
              </Badge>
              <Badge variant={STATUS_CONFIG[feedback.status]?.color}>
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
              <p className="text-sm text-gray-900 break-words">
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
          </div>
        )}

        {/* Message */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
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
          </div>
        )}

        {/* Context */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600 flex-shrink-0">Page:</span>
              <span className="text-gray-900 font-mono text-xs break-all text-right">
                {feedback.page_url}
              </span>
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
                  <span className="text-xs text-gray-500 flex-shrink-0">
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
                  <p className="text-sm text-gray-900 break-words">{comment.comment}</p>
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

          {/* Delete Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="danger"
              fullWidth
              onClick={() => onDelete(feedback)}
            >
              🗑️ Delete Feedback
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will permanently archive this feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD (Platform-Aware with All Original Functionality)
// ============================================================================
export default function FeedbackDashboard() {
  const toast = useToast();
  
  // Platform detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailData, setDetailData] = useState(null);
  
  // Auth ready state - prevents race condition
  const [authReady, setAuthReady] = useState(false);
  
  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    status: '',
    priority: '',
    journey_stage: '',
    search: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    pending: 0,
    avgResponseTime: 0,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wait for auth before marking ready
  useEffect(() => {
    // Small delay to ensure auth is fully established
    const timer = setTimeout(() => {
      setAuthReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Load feedback only when auth is ready and filters change
  useEffect(() => {
    if (authReady) {
      loadFeedback();
    }
  }, [authReady, filters.page, filters.limit, filters.type, filters.status, filters.priority, filters.journey_stage, filters.search]);

  useEffect(() => {
    if (selectedFeedback) {
      loadFeedbackDetail(selectedFeedback.id);
    } else {
      setDetailData(null);
    }
  }, [selectedFeedback]);

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
      
      setStats({
        total: data.pagination?.total || 0,
        avgRating: calculateAvgRating(data.feedback),
        pending: data.feedback?.filter(f => f.status === 'new').length || 0,
        avgResponseTime: '2.3h',
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

  // Delete handlers
  const deleteFeedback = async (id) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Feedback deleted successfully');
      
      setSelectedFeedback(null);
      setDetailData(null);
      loadFeedback();
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (feedbackToDelete) {
      deleteFeedback(feedbackToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setFeedbackToDelete(null);
  };

  const createJiraTicket = async (feedback) => {
    if (feedback.jira_ticket_key) {
      window.open(feedback.jira_ticket_url, '_blank');
      return;
    }

    const loadingId = toast.info('Creating Jira ticket...', 0);
    
    try {
      const res = await fetch(`/api/feedback/jira?id=${feedback.id}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to create ticket' }));
        throw new Error(error.error || 'Failed to create Jira ticket');
      }

      const data = await res.json();
      
      toast.dismiss(loadingId);
      toast.success(`Jira ticket ${data.jira_ticket.key} created!`);
      
      loadFeedback();
      loadFeedbackDetail(feedback.id);
      
    } catch (error) {
      console.error('Jira error:', error);
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  };

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
      limit: 10,
      type: '',
      status: '',
      priority: '',
      journey_stage: '',
      search: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  if (loading && feedback.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <SectionHeader
        title="Feedback Dashboard"
        description="User feedback, bug reports, and feature requests"
        action={
          <Button variant="secondary" onClick={loadFeedback} size="sm">
            🔄 Refresh
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          {/* Filter Controls */}
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

          {/* Items per page selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={filters.limit.toString()}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' },
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-600">items</span>
            </div>
            
            <div className="text-sm text-gray-600">
              Sorted by: <span className="font-semibold">Most Recent</span>
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

        {/* List Body */}
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
              {/* Info */}
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing <span className="font-semibold">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(filters.page * filters.limit, stats.total)}
                </span> of{' '}
                <span className="font-semibold">{stats.total}</span> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                >
                  ← Prev
                </Button>
                
                {/* Page numbers - hide on very small screens */}
                <div className="hidden sm:flex items-center gap-1">
                  {(() => {
                    const totalPages = Math.ceil(stats.total / filters.limit);
                    const currentPage = filters.page;
                    const pageNumbers = [];
                    
                    if (currentPage > 2) {
                      pageNumbers.push(
                        <button
                          key={1}
                          onClick={() => handleFilterChange('page', 1)}
                          className="px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          1
                        </button>
                      );
                      if (currentPage > 3) {
                        pageNumbers.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                      }
                    }
                    
                    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
                      pageNumbers.push(
                        <button
                          key={i}
                          onClick={() => handleFilterChange('page', i)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            i === currentPage
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (currentPage < totalPages - 1) {
                      if (currentPage < totalPages - 2) {
                        pageNumbers.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                      }
                      pageNumbers.push(
                        <button
                          key={totalPages}
                          onClick={() => handleFilterChange('page', totalPages)}
                          className="px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pageNumbers;
                  })()}
                </div>

                {/* Mobile: Show current page */}
                <span className="sm:hidden text-sm text-gray-600">
                  Page {filters.page}
                </span>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  disabled={feedback.length < filters.limit}
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Panel */}
      {selectedFeedback && detailData && (
        <FeedbackDetailPanel
          feedback={{ ...selectedFeedback, ...detailData.feedback, ...detailData }}
          onClose={() => setSelectedFeedback(null)}
          onUpdate={(updates) => updateFeedback(selectedFeedback.id, updates)}
          onCreateJira={createJiraTicket}
          onReload={() => loadFeedbackDetail(selectedFeedback.id)}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && feedbackToDelete && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={handleDeleteCancel}
          title="Delete Feedback?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-sm text-red-700">
                This will permanently archive the feedback item:
              </p>
              <p className="text-sm text-gray-900 mt-2 p-2 bg-white rounded border border-red-200 break-words">
                "{feedbackToDelete.message}"
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}