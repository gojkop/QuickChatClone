import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Input,
  SectionHeader,
  Spinner,
  Modal
} from '../components/ui';
import { useToast } from '../components/Toast';

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// ADMIN ROW COMPONENT
// ============================================================================
function AdminRow({ admin, onRemove, isCurrentUser }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-indigo-700">
            {admin.name?.split(' ').map(n => n[0]).join('') || '?'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {admin.name}
            </p>
            {isCurrentUser && (
              <Badge variant="info">You</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          {admin.xano_user_id && (
            <p className="text-xs text-gray-400 font-mono">
              Xano: {admin.xano_user_id.substring(0, 20)}...
            </p>
          )}
          {admin.last_activity && (
            <p className="text-xs text-gray-400">
              Last active: {new Date(admin.last_activity).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {!isCurrentUser && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onRemove(admin)}
        >
          Remove
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// HEALTH CHECK COMPONENT
// ============================================================================
function HealthCheck({ label, status, message, responseTime }) {
  const colors = {
    healthy: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const icons = {
    healthy: '✓',
    warning: '⚠',
    error: '✗',
    unknown: '?'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[status] || colors.unknown}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icons[status]}</span>
        <div className="font-semibold">{label}</div>
      </div>
      <div className="text-sm">{message}</div>
      {responseTime && (
        <div className="text-xs mt-1 opacity-75">{responseTime}ms</div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN SETTINGS PAGE
// ============================================================================
export default function Settings() {
  const toast = useToast();
  
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [health, setHealth] = useState(null);
  const [notificationConfig, setNotificationConfig] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminXanoId, setNewAdminXanoId] = useState('');
  
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  // Load current user
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load data
  useEffect(() => {
    if (currentUser) {
      loadAdmins();
      loadHealth();
      loadNotificationConfig();
    }
  }, [currentUser]);

  // Auto-save notification config (debounced)
  const saveNotificationConfig = useCallback(
    debounce(async (config) => {
      setSaving(true);
      try {
        const res = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(config)
        });
        
        if (!res.ok) {
          throw new Error('Failed to save');
        }
      } catch (error) {
        toast.error('Failed to save notification settings');
        console.error('Save error:', error);
      } finally {
        setSaving(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (notificationConfig && !loading) {
      saveNotificationConfig(notificationConfig);
    }
  }, [notificationConfig]);

  // ========================================================================
  // API CALLS
  // ========================================================================
  
  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  async function loadAdmins() {
    try {
      const res = await fetch('/api/team', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch admins');
      
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Load admins error:', error);
      toast.error('Failed to load admin team');
    } finally {
      setLoading(false);
    }
  }

  async function loadHealth() {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch health');
      
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Load health error:', error);
      toast.error('Failed to load system health');
      // Set error state so it doesn't spin forever
      setHealth({
        timestamp: new Date().toISOString(),
        database: { status: 'error', message: 'Failed to load' },
        xano: { status: 'error', message: 'Failed to load' },
        environment: { status: 'error', message: 'Failed to load' }
      });
    } finally {
      setHealthLoading(false);
    }
  }

  async function loadNotificationConfig() {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch config');
      
      const data = await res.json();
      setNotificationConfig(data.config);
    } catch (error) {
      console.error('Load notification config error:', error);
      toast.error('Failed to load notification config');
    }
  }

  // ========================================================================
  // HANDLERS
  // ========================================================================

  async function handleAddAdmin() {
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      toast.warning('Please enter both email and name');
      return;
    }

    const loadingId = toast.info('Adding admin...', 0);
    
    try {
      const payload = {
        email: newAdminEmail,
        name: newAdminName
      };
      
      // Only include xano_user_id if it's provided
      if (newAdminXanoId.trim()) {
        payload.xano_user_id = newAdminXanoId;
      }
      
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add admin');
      }

      toast.dismiss(loadingId);
      toast.success('Admin added successfully');
      
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminXanoId('');
      loadAdmins();
      
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  }

  async function handleRemoveAdmin(admin) {
    const loadingId = toast.info('Removing admin...', 0);
    
    try {
      const res = await fetch(`/api/team?id=${admin.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove admin');
      }

      toast.dismiss(loadingId);
      toast.success('Admin removed successfully');
      
      loadAdmins();
      setShowRemoveModal(false);
      setAdminToRemove(null);
      
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  }

  async function handleRevokeAllSessions() {
    const loadingId = toast.info('Revoking sessions...', 0);
    
    try {
      const res = await fetch('/api/team/revoke-sessions', {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to revoke sessions');
      }

      toast.dismiss(loadingId);
      toast.success('All sessions revoked - admins must re-login');
      
      setShowRevokeModal(false);
      
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  }

  async function handleTestNotification() {
    const loadingId = toast.info('Sending test notification...', 0);
    
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send test');
      }

      const data = await res.json();
      
      toast.dismiss(loadingId);
      toast.success(data.message || 'Test notification sent');
      
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(error.message);
    }
  }

  // ========================================================================
  // RENDER
  // ========================================================================

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
        title="Settings"
        description="Configure admin access, system health, and notifications"
      />

      {/* 1. ADMIN TEAM */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Team</h2>
        
        <div className="space-y-3 mb-4">
          {admins.map(admin => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isCurrentUser={currentUser?.admin_id === admin.id}
              onRemove={(admin) => {
                setAdminToRemove(admin);
                setShowRemoveModal(true);
              }}
            />
          ))}
        </div>

        {/* Add Admin Form */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Add New Admin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Input
              placeholder="Full name"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
            />
          </div>
          <Input
            placeholder="Xano User ID (optional - auto-generated if empty)"
            value={newAdminXanoId}
            onChange={(e) => setNewAdminXanoId(e.target.value)}
            helperText="Leave empty to auto-generate a temporary ID"
          />
          <Button 
            variant="primary" 
            onClick={handleAddAdmin}
            disabled={!newAdminEmail.trim() || !newAdminName.trim()}
          >
            Add Admin
          </Button>
        </div>

        {/* Nuclear Option */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="danger" 
            onClick={() => setShowRevokeModal(true)}
          >
            🔒 Force Everyone to Re-Login
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Revokes all admin sessions. Use this if you suspect a security issue.
          </p>
        </div>
      </Card>

      {/* 2. SYSTEM HEALTH */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">System Health</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadHealth}
            disabled={healthLoading}
          >
            {healthLoading ? <Spinner size="sm" className="mr-2" /> : '🔄'}
            Check Now
          </Button>
        </div>

        {health ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <HealthCheck
                label="Database"
                status={health.database.status}
                message={health.database.message}
                responseTime={health.database.response_time_ms}
              />
              <HealthCheck
                label="Xano API"
                status={health.xano.status}
                message={health.xano.message}
                responseTime={health.xano.response_time_ms}
              />
              <HealthCheck
                label="Environment"
                status={health.environment.status}
                message={health.environment.message}
              />
            </div>
            <p className="text-xs text-gray-500">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <Spinner size="md" />
          </div>
        )}
      </Card>

      {/* 3. NOTIFICATIONS */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alert Notifications</h2>

        {notificationConfig && (
          <div className="space-y-4">
            {/* Alert Emails */}
            <Input
              label="Alert Emails"
              placeholder="admin@mindpick.me, tech@mindpick.me"
              value={Array.isArray(notificationConfig.alert_emails) 
                ? notificationConfig.alert_emails.join(', ')
                : notificationConfig.alert_emails}
              onChange={(e) => setNotificationConfig({
                ...notificationConfig,
                alert_emails: e.target.value
              })}
              helperText="Comma-separated email addresses"
            />

            {/* SLA Threshold - Number Input */}
            <Input
              label="SLA Compliance Alert Threshold"
              type="number"
              min="0"
              max="100"
              value={notificationConfig.sla_threshold}
              onChange={(e) => setNotificationConfig({
                ...notificationConfig,
                sla_threshold: parseInt(e.target.value) || 0
              })}
              helperText="Alert when SLA compliance drops below this percentage"
            />

            {/* Moderation Threshold - Number Input */}
            <Input
              label="Moderation Queue Alert Threshold"
              type="number"
              min="0"
              value={notificationConfig.moderation_threshold}
              onChange={(e) => setNotificationConfig({
                ...notificationConfig,
                moderation_threshold: parseInt(e.target.value) || 0
              })}
              helperText="Alert when moderation queue exceeds this number of items"
            />

            {/* Test Button */}
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={handleTestNotification}
              >
                📧 Send Test Notification
              </Button>
              {saving && <span className="text-xs text-gray-500">Saving...</span>}
            </div>
          </div>
        )}
      </Card>

      {/* 4. SECURITY (Coming Soon) */}
      <Card className="opacity-60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Security</h2>
          <Badge variant="default">Coming Soon</Badge>
        </div>

        <div className="space-y-4 text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              🔐
            </div>
            <div>
              <div className="font-semibold">Two-Factor Authentication</div>
              <div className="text-sm">Require 2FA for all admin logins</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              🌐
            </div>
            <div>
              <div className="font-semibold">IP Allowlist</div>
              <div className="text-sm">Restrict admin access by IP address</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              ⏱️
            </div>
            <div>
              <div className="font-semibold">Session Management</div>
              <div className="text-sm">Configure session timeout and policies</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          These features will be available in a future update
        </div>
      </Card>

      {/* MODALS */}
      
      {/* Revoke Sessions Confirmation */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke All Sessions?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeAllSessions}>
              Yes, Revoke All Sessions
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            This will force <strong>all admins</strong> (including you) to log in again.
          </p>
          <p className="text-sm text-gray-700">
            Use this if you suspect a security breach or compromised credentials.
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-semibold">
              ⚠️ You will be logged out immediately
            </p>
          </div>
        </div>
      </Modal>

      {/* Remove Admin Confirmation */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setAdminToRemove(null);
        }}
        title="Remove Admin?"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowRemoveModal(false);
                setAdminToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleRemoveAdmin(adminToRemove)}
            >
              Yes, Remove Admin
            </Button>
          </>
        }
      >
        {adminToRemove && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to remove <strong>{adminToRemove.name}</strong>?
            </p>
            <p className="text-sm text-gray-700">
              They will immediately lose access to the admin console.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}