import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Input,
  Select,
  Modal,
  SectionHeader,
  EmptyState 
} from '../components/ui';

// Inline SVG Icons
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Flag: () => (
    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  )
};

// Mock data - FIXED: Define this BEFORE using it
const initialFlags = [
  { 
    id: 1,
    key: 'coach_tier2', 
    name: 'AI Coach Tier 2', 
    description: 'Enable Tier 2 analysis and clarifications', 
    enabled: true, 
    rollout_percentage: 100,
    created_at: '2025-01-15',
    updated_at: '2025-02-10'
  },
  { 
    id: 2,
    key: 'copilot_beta', 
    name: 'Expert Copilot (Beta)', 
    description: 'Show Copilot panel to selected experts', 
    enabled: false, 
    rollout_percentage: 10,
    created_at: '2025-02-01',
    updated_at: '2025-02-05'
  },
  { 
    id: 3,
    key: 'deep_dive_question', 
    name: 'Deep Dive Question Type', 
    description: 'Offer long-form, higher-priced question type', 
    enabled: false, 
    rollout_percentage: 0,
    created_at: '2025-02-20',
    updated_at: '2025-02-20'
  }
];

const auditLog = [
  { time: '10:12', action: 'Enabled copilot_beta', user: 'Admin', details: 'rollout 10% → 25%' },
  { time: '09:44', action: 'Created deep_dive_question', user: 'Admin', details: null },
  { time: 'Yesterday', action: 'Disabled coach_tier2', user: 'Support Admin', details: null }
];

// ============================================================================
// Flag Row Component
// ============================================================================
function FlagRow({ flag, onToggle, onEdit, onDelete }) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Flag Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-bold text-gray-900">{flag.name}</h3>
            <Badge variant={flag.enabled ? 'success' : 'default'}>
              {flag.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">{flag.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Key: <code className="font-mono text-gray-600">{flag.key}</code></span>
            <span>Rollout: <strong className="text-gray-600">{flag.rollout_percentage}%</strong></span>
            <span>Updated: {flag.updated_at}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant={flag.enabled ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onToggle(flag.id)}
          >
            {flag.enabled ? 'Disable' : 'Enable'}
          </Button>
          <button 
            onClick={() => onEdit(flag)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button 
            onClick={() => onDelete(flag.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Rollout Progress Bar */}
      {flag.enabled && flag.rollout_percentage < 100 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Rollout Progress</span>
            <span className="font-semibold text-indigo-600">{flag.rollout_percentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${flag.rollout_percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Create/Edit Modal
// ============================================================================
function FlagModal({ isOpen, onClose, flag, onSave }) {
  const [formData, setFormData] = useState(
    flag || { 
      key: '', 
      name: '', 
      description: '', 
      enabled: false, 
      rollout_percentage: 0 
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={flag ? 'Edit Feature Flag' : 'Create Feature Flag'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {flag ? 'Save Changes' : 'Create Flag'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Key (unique identifier)"
          placeholder="deep_dive_question"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          required
          helperText="Use lowercase with underscores. Cannot be changed after creation."
        />

        <Input
          label="Name"
          placeholder="Deep Dive Question Type"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="What does this flag control?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.enabled ? '1' : '0'}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.value === '1' })}
            options={[
              { value: '1', label: 'Enabled' },
              { value: '0', label: 'Disabled' }
            ]}
          />

          <Input
            label="Rollout %"
            type="number"
            min="0"
            max="100"
            value={formData.rollout_percentage}
            onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value || '0', 10) })}
          />
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function FeatureFlags() {
  const [flags, setFlags] = useState(initialFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);

  // Filter flags
  const filteredFlags = flags.filter(flag => {
    const matchesSearch = 
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'enabled' ? flag.enabled :
      !flag.enabled;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleToggle = (id) => {
    setFlags(prev => prev.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled, updated_at: new Date().toISOString().split('T')[0] } : f
    ));
  };

  const handleEdit = (flag) => {
    setEditingFlag(flag);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this flag?')) {
      setFlags(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editingFlag) {
      // Update existing
      setFlags(prev => prev.map(f => 
        f.id === editingFlag.id ? { ...f, ...formData, updated_at: new Date().toISOString().split('T')[0] } : f
      ));
    } else {
      // Create new
      setFlags(prev => [...prev, {
        ...formData,
        id: Date.now(),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      }]);
    }
    setEditingFlag(null);
  };

  const handleCreateNew = () => {
    setEditingFlag(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Feature Flags"
        description="Control feature rollout and experimentation"
        action={
          <Button variant="primary" onClick={handleCreateNew}>
            <Icons.Plus />
            <span className="ml-2">New Flag</span>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{flags.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Flags</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{flags.filter(f => f.enabled).length}</p>
            <p className="text-sm text-gray-500 mt-1">Enabled</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">{flags.filter(f => !f.enabled).length}</p>
            <p className="text-sm text-gray-500 mt-1">Disabled</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search flags by name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Flags' },
              { value: 'enabled', label: 'Enabled Only' },
              { value: 'disabled', label: 'Disabled Only' }
            ]}
          />
        </div>
      </Card>

      {/* Flags List */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Flags ({filteredFlags.length})
          </h2>
        </div>
        
        <div className="p-6 space-y-3">
          {filteredFlags.length > 0 ? (
            filteredFlags.map(flag => (
              <FlagRow
                key={flag.id}
                flag={flag}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <EmptyState
              title="No flags found"
              description={searchQuery ? "Try adjusting your search" : "Create your first feature flag"}
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={handleCreateNew}>
                    <Icons.Plus />
                    <span className="ml-2">Create Flag</span>
                  </Button>
                )
              }
            />
          )}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-2">
          {auditLog.map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm text-gray-900">{entry.action}</p>
                <p className="text-xs text-gray-500">by {entry.user}</p>
              </div>
              {entry.details && (
                <span className="text-xs text-gray-500">{entry.details}</span>
              )}
              <span className="text-xs text-gray-400 ml-4">{entry.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal */}
      <FlagModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFlag(null);
        }}
        flag={editingFlag}
        onSave={handleSave}
      />
    </div>
  );
}