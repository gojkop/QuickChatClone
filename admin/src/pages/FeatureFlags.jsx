// Example: admin/src/pages/FeatureFlags.jsx with Toast Integration
import React, { useState } from 'react';
import { useToast } from '../components/Toast';
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

// ... (keep all your existing Icons and mock data)

export default function FeatureFlags() {
  const toast = useToast(); // Add this hook
  const [flags, setFlags] = useState(initialFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);

  // Filter flags (keep existing)
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

  // Enhanced handlers with toast notifications
  const handleToggle = (id) => {
    const flag = flags.find(f => f.id === id);
    const newState = !flag.enabled;
    
    setFlags(prev => prev.map(f => 
      f.id === id ? { 
        ...f, 
        enabled: newState, 
        updated_at: new Date().toISOString().split('T')[0] 
      } : f
    ));

    // Show toast
    if (newState) {
      toast.success(`"${flag.name}" enabled successfully`);
    } else {
      toast.info(`"${flag.name}" disabled`);
    }
  };

  const handleEdit = (flag) => {
    setEditingFlag(flag);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const flag = flags.find(f => f.id === id);
    
    if (confirm(`Are you sure you want to delete "${flag.name}"?`)) {
      setFlags(prev => prev.filter(f => f.id !== id));
      toast.success(`"${flag.name}" deleted`, 3000);
    }
  };

  const handleSave = (formData) => {
    if (editingFlag) {
      // Update existing
      setFlags(prev => prev.map(f => 
        f.id === editingFlag.id ? { 
          ...f, 
          ...formData, 
          updated_at: new Date().toISOString().split('T')[0] 
        } : f
      ));
      toast.success(`"${formData.name}" updated successfully`);
    } else {
      // Create new
      setFlags(prev => [...prev, {
        ...formData,
        id: Date.now(),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      }]);
      toast.success(`"${formData.name}" created successfully`, 4000);
    }
    setEditingFlag(null);
  };

  const handleCreateNew = () => {
    setEditingFlag(null);
    setShowModal(true);
  };

  // Example: Bulk operations with toast
  const handleEnableAll = () => {
    const count = flags.filter(f => !f.enabled).length;
    if (count === 0) {
      toast.warning('All flags are already enabled');
      return;
    }
    
    setFlags(prev => prev.map(f => ({ ...f, enabled: true })));
    toast.success(`${count} flag${count > 1 ? 's' : ''} enabled`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Feature Flags"
        description="Control feature rollout and experimentation"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleEnableAll} size="sm">
              Enable All
            </Button>
            <Button variant="primary" onClick={handleCreateNew}>
              <span className="mr-2">+</span>
              New Flag
            </Button>
          </div>
        }
      />

      {/* ... rest of your component JSX ... */}

      {/* Modal with toast on close */}
      <FlagModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFlag(null);
          // Optional: toast.info('Changes discarded');
        }}
        flag={editingFlag}
        onSave={handleSave}
      />
    </div>
  );
}

// ... (keep all your other components like FlagRow, FlagModal, etc.)