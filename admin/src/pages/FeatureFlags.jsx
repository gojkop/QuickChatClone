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
  Spinner
} from '../components/ui';
import { useToast } from '../components/Toast';

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
  )
};

// API helper functions
const flagsAPI = {
  list: async () => {
    const res = await fetch('/api/flags', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch flags');
    return res.json();
  },
  
  create: async (data) => {
    const res = await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create flag');
    }
    return res.json();
  },
  
  update: async (key, data) => {
    const res = await fetch(`/api/flags/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update flag');
    }
    return res.json();
  },
  
  delete: async (key) => {
    const res = await fetch(`/api/flags/${key}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete flag');
    }
    return res.json();
  }
};

// ============================================================================
// Flag Row Component
// ============================================================================
function FlagRow({ flag, onToggle, onEdit, onDelete }) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Flag Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900">{flag.name}</h3>
            <Badge variant={flag.enabled ? 'success' : 'default'}>
              {flag.enabled ? '✓ Enabled' : '○ Disabled'}
            </Badge>
            <Badge variant={flag.min_plan === 'pro' ? 'primary' : 'info'}>
              {flag.min_plan === 'pro' ? '⭐ Pro' : '✓ Free'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">{flag.description || 'No description'}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Key: <code className="font-mono text-gray-600">{flag.key}</code></span>
            <span>Updated: {new Date(flag.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant={flag.enabled ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onToggle(flag)}
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
            onClick={() => onDelete(flag)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
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
      min_plan: 'free'
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (flag) {
      setFormData(flag);
    } else {
      setFormData({ 
        key: '', 
        name: '', 
        description: '', 
        enabled: false, 
        min_plan: 'free'
      });
    }
  }, [flag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={flag ? 'Edit Feature Flag' : 'Create Feature Flag'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            {flag ? 'Save Changes' : 'Create Flag'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Key (unique identifier)"
          placeholder="profile_video"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          required
          disabled={!!flag}
          helperText={flag ? "Key cannot be changed after creation" : "Use lowercase with underscores. Cannot be changed later."}
        />

        <Input
          label="Name"
          placeholder="Profile Video on Public Profile"
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
            placeholder="What does this feature do?"
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
              { value: '0', label: 'Disabled (safer)' }
            ]}
          />

          <Select
            label="Minimum Plan"
            value={formData.min_plan}
            onChange={(e) => setFormData({ ...formData, min_plan: e.target.value })}
            options={[
              { value: 'free', label: '✓ Free (All Users)' },
              { value: 'pro', label: '⭐ Pro Only' }
            ]}
            helperText="Who can access when enabled?"
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
  const toast = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);

  // Load flags on mount
  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    try {
      setLoading(true);
      const data = await flagsAPI.list();
      setFlags(data.flags || []);
    } catch (error) {
      toast.error('Failed to load feature flags');
      console.error('Load flags error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter flags
  const filteredFlags = flags.filter(flag => {
    const matchesSearch = 
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'enabled' ? flag.enabled :
      !flag.enabled;

    const matchesPlan =
      planFilter === 'all' ? true :
      flag.min_plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Handlers
  const handleToggle = async (flag) => {
    const action = flag.enabled ? 'disable' : 'enable';
    const loadingId = toast.info(`${action === 'enable' ? 'Enabling' : 'Disabling'} ${flag.name}...`, 0);
    
    try {
      await flagsAPI.update(flag.key, { enabled: !flag.enabled });
      await loadFlags();
      toast.dismiss(loadingId);
      toast.success(`${flag.name} is now ${action}d`);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  };

  const handleEdit = (flag) => {
    setEditingFlag(flag);
    setShowModal(true);
  };

  const handleDelete = async (flag) => {
    if (!confirm(`Are you sure you want to delete "${flag.name}"? This cannot be undone.`)) {
      return;
    }

    const loadingId = toast.info(`Deleting ${flag.name}...`, 0);
    
    try {
      await flagsAPI.delete(flag.key);
      await loadFlags();
      toast.dismiss(loadingId);
      toast.success(`${flag.name} deleted successfully`);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  };

  const handleSave = async (formData) => {
    const loadingId = toast.info(editingFlag ? 'Updating flag...' : 'Creating flag...', 0);
    
    try {
      if (editingFlag) {
        await flagsAPI.update(editingFlag.key, formData);
        toast.dismiss(loadingId);
        toast.success(`${formData.name} updated successfully`);
      } else {
        await flagsAPI.create(formData);
        toast.dismiss(loadingId);
        toast.success(`${formData.name} created successfully`);
      }
      await loadFlags();
      setEditingFlag(null);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleCreateNew = () => {
    setEditingFlag(null);
    setShowModal(true);
  };

  const stats = {
    total: flags.length,
    enabled: flags.filter(f => f.enabled).length,
    disabled: flags.filter(f => !f.enabled).length,
    pro: flags.filter(f => f.min_plan === 'pro').length
  };

  if (loading) {
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
        title="Feature Flags"
        description="Control feature rollout and plan-based access"
        action={
          <Button variant="primary" onClick={handleCreateNew}>
            <Icons.Plus />
            <span className="ml-2">New Flag</span>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Flags</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.enabled}</p>
            <p className="text-sm text-gray-500 mt-1">Enabled</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">{stats.disabled}</p>
            <p className="text-sm text-gray-500 mt-1">Disabled</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.pro}</p>
            <p className="text-sm text-gray-500 mt-1">Pro Features</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search flags by name or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'enabled', label: 'Enabled Only' },
              { value: 'disabled', label: 'Disabled Only' }
            ]}
          />
          <Select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Plans' },
              { value: 'free', label: 'Free Only' },
              { value: 'pro', label: 'Pro Only' }
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
                key={flag.key}
                flag={flag}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <EmptyState
              title="No flags found"
              description={searchQuery ? "Try adjusting your search or filters" : "Create your first feature flag"}
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

      {/* Info Box */}
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">How Feature Flags Work</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Enabled + Free:</strong> All users can access the feature</li>
          <li>• <strong>Enabled + Pro:</strong> Only Pro users can access</li>
          <li>• <strong>Disabled:</strong> Feature is hidden and blocked for everyone</li>
        </ul>
        <p className="text-xs text-gray-600 mt-3">
          Changes take effect within 5 minutes due to edge caching.
        </p>
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