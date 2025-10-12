import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Select,
  SectionHeader,
  EmptyState 
} from '../components/ui';

// Inline SVG Icons
const Icons = {
  Shield: () => (
    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

// Mock data
const initialQueue = [
  { 
    id: 'q_329', 
    content_type: 'question', 
    content_preview: 'How do I hack into someone\'s account? I need to access my ex\'s messages...',
    flagged_reason: 'inappropriate', 
    auto_detection_confidence: 0.92,
    status: 'pending',
    created_at: '2025-10-11 14:32',
    reporter: 'Auto-detection'
  },
  { 
    id: 'a_812', 
    content_type: 'answer', 
    content_preview: 'The easiest way is to just steal their phone and copy the data...',
    flagged_reason: 'quality', 
    auto_detection_confidence: 0.58,
    status: 'pending',
    created_at: '2025-10-11 12:15',
    reporter: 'User report'
  },
  { 
    id: 'p_991', 
    content_type: 'profile', 
    content_preview: 'Expert in adult entertainment services, massage therapy...',
    flagged_reason: 'inappropriate', 
    auto_detection_confidence: 0.78,
    status: 'escalated',
    created_at: '2025-10-10 18:45',
    reporter: 'Auto-detection'
  }
];

// ============================================================================
// Queue Item Component
// ============================================================================
function QueueItem({ item, onSelect, isSelected }) {
  const confidenceColor = 
    item.auto_detection_confidence > 0.8 ? 'text-red-600' :
    item.auto_detection_confidence > 0.6 ? 'text-amber-600' :
    'text-gray-600';

  const typeIcons = {
    question: '❓',
    answer: '💬',
    profile: '👤'
  };

  return (
    <div 
      onClick={() => onSelect(item)}
      className={`
        p-4 border rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeIcons[item.content_type]}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={
              item.status === 'pending' ? 'warning' :
              item.status === 'escalated' ? 'danger' :
              item.status === 'approved' ? 'success' :
              'default'
            }>
              {item.status}
            </Badge>
            <span className="text-xs text-gray-500">{item.content_type}</span>
            <span className={`text-xs font-semibold ${confidenceColor}`}>
              {Math.round(item.auto_detection_confidence * 100)}% confidence
            </span>
          </div>

          <p className="text-sm text-gray-900 line-clamp-2 mb-2">
            {item.content_preview}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>ID: {item.id}</span>
            <span>{item.flagged_reason}</span>
            <span>{item.created_at}</span>
          </div>
        </div>

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
// Detail Panel Component
// ============================================================================
function DetailPanel({ item, onAction }) {
  if (!item) {
    return (
      <Card className="lg:sticky lg:top-6">
        <EmptyState
          title="Select an item"
          description="Choose an item from the queue to review"
        />
      </Card>
    );
  }

  const [notes, setNotes] = useState('');

  return (
    <Card className="lg:sticky lg:top-6" padding="none">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID:</span>
              <span className="font-mono text-gray-900">{item.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span className="text-gray-900 capitalize">{item.content_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reason:</span>
              <Badge variant="warning">{item.flagged_reason}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Confidence:</span>
              <span className="font-semibold text-gray-900">
                {Math.round(item.auto_detection_confidence * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reporter:</span>
              <span className="text-gray-900">{item.reporter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span className="text-gray-900">{item.created_at}</span>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Content</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {item.content_preview}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Full content would be loaded from database in production
          </p>
        </div>

        {/* Notes */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reviewer Notes</h4>
          <textarea
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="Add notes about this review..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Actions</h4>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => onAction('approve', item, notes)}
            >
              <Icons.Check />
              <span className="ml-2">Approve Content</span>
            </Button>
            <Button 
              variant="danger" 
              fullWidth
              onClick={() => onAction('reject', item, notes)}
            >
              <Icons.X />
              <span className="ml-2">Reject & Remove</span>
            </Button>
            <Button 
              variant="secondary" 
              fullWidth
              onClick={() => onAction('escalate', item, notes)}
            >
              <Icons.AlertTriangle />
              <span className="ml-2">Escalate to Senior</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function Moderation() {
  const [queue, setQueue] = useState(initialQueue);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);

  // Filter queue
  const filteredQueue = queue.filter(item => 
    filter === 'all' ? true : item.status === filter
  );

  // Handle actions
  const handleAction = (action, item, notes) => {
    const newStatus = 
      action === 'approve' ? 'approved' :
      action === 'reject' ? 'rejected' :
      'escalated';

    setQueue(prev => prev.map(q => 
      q.id === item.id ? { ...q, status: newStatus, reviewer_notes: notes } : q
    ));

    // Auto-select next item
    const currentIndex = filteredQueue.findIndex(q => q.id === item.id);
    if (currentIndex < filteredQueue.length - 1) {
      setSelected(filteredQueue[currentIndex + 1]);
    } else {
      setSelected(null);
    }
  };

  const stats = {
    total: queue.length,
    pending: queue.filter(q => q.status === 'pending').length,
    escalated: queue.filter(q => q.status === 'escalated').length,
    processed: queue.filter(q => ['approved', 'rejected'].includes(q.status)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Moderation Queue"
        description="Review flagged content and take action"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Items</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Review</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.escalated}</p>
            <p className="text-sm text-gray-500 mt-1">Escalated</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.processed}</p>
            <p className="text-sm text-gray-500 mt-1">Processed</p>
          </div>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending Review' },
                  { value: 'escalated', label: 'Escalated' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'all', label: 'All Items' }
                ]}
              />
              <Button variant="ghost" size="sm">
                Refresh
              </Button>
            </div>
          </Card>

          {filteredQueue.length > 0 ? (
            <div className="space-y-3">
              {filteredQueue.map(item => (
                <QueueItem
                  key={item.id}
                  item={item}
                  onSelect={setSelected}
                  isSelected={selected?.id === item.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                title="Queue is empty"
                description="No items match the current filter"
              />
            </Card>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          <DetailPanel item={selected} onAction={handleAction} />
        </div>
      </div>
    </div>
  );
}