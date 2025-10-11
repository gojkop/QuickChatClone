import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Input,
  Select,
  SectionHeader
} from '../components/ui';

// Mock data
const initialAdminUsers = [
  { 
    id: 'a1', 
    name: 'Bogdan Tancic', 
    email: 'b.tancic@gmail.com', 
    role: 'super_admin', 
    disabled: false, 
    token_version: 0,
    last_login: '2025-10-11 14:23'
  },
  { 
    id: 'a2', 
    name: 'Support User', 
    email: 'support@mindpick.me', 
    role: 'support_admin', 
    disabled: false, 
    token_version: 0,
    last_login: '2025-10-10 09:15'
  }
];

const webhooks = [
  { id: 'w1', name: 'Stripe Webhook', status: 'healthy', lastEvent: 'charge.succeeded (5m)' },
  { id: 'w2', name: 'Xano Events', status: 'healthy', lastEvent: 'question.created (1m)' }
];

const envVars = [
  { key: 'DATABASE_URL', status: 'present' },
  { key: 'XANO_BASE_URL', status: 'present' },
  { key: 'ADMIN_JWT_SECRET', status: 'present' },
  { key: 'CORS_ALLOW_ORIGIN', status: 'optional' }
];

// ============================================================================
// Admin User Row Component
// ============================================================================
function AdminUserRow({ user, onAction }) {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-indigo-700">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
              <Badge variant={user.role === 'super_admin' ? 'primary' : 'info'}>
                {user.role.replace('_', ' ')}
              </Badge>
              {user.disabled && <Badge variant="danger">Disabled</Badge>}
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Last login: {user.last_login} • Token v{user.token_version}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAction('edit', user)}
          >
            Edit
          </Button>
          <Button 
            variant={user.disabled ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onAction('toggle_disabled', user)}
          >
            {user.disabled ? 'Enable' : 'Disable'}
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => onAction('revoke_sessions', user)}
          >
            Revoke Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function Settings() {
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [security, setSecurity] = useState({
    enforce2FA: true,
    ipAllowlistEnabled: false,
    rateLimitSensitiveOps: true
  });
  const [alerts, setAlerts] = useState({
    slaComplianceThreshold: 90,
    paymentFailureThreshold: 5,
    moderationQueueThreshold: 20,
    notifyEmails: 'admin@mindpick.com,tech@mindpick.com'
  });
  const [featureDefaults, setFeatureDefaults] = useState({
    defaultRolloutPercent: 0,
    allowTargetedUsers: true
  });

  // Handlers
  const handleAdminAction = (action, user) => {
    switch (action) {
      case 'toggle_disabled':
        setAdminUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, disabled: !u.disabled } : u
        ));
        break;
      case 'revoke_sessions':
        setAdminUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, token_version: u.token_version + 1 } : u
        ));
        break;
      case 'edit':
        console.log('Edit user:', user);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Settings"
        description="Configure admin access, security, and system preferences"
      />

      {/* Admin Users (RBAC) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage admin access and permissions</p>
          </div>
          <Button variant="primary" size="sm">
            Invite Admin
          </Button>
        </div>

        <div className="space-y-3">
          {adminUsers.map(user => (
            <AdminUserRow
              key={user.id}
              user={user}
              onAction={handleAdminAction}
            />
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enforce 2FA (Admins)
            </label>
            <Select
              value={security.enforce2FA ? '1' : '0'}
              onChange={(e) => setSecurity({ ...security, enforce2FA: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Enabled' },
                { value: '0', label: 'Disabled' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Allowlist (Super Admin)
            </label>
            <Select
              value={security.ipAllowlistEnabled ? '1' : '0'}
              onChange={(e) => setSecurity({ ...security, ipAllowlistEnabled: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Enabled' },
                { value: '0', label: 'Disabled' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit Sensitive Ops
            </label>
            <Select
              value={security.rateLimitSensitiveOps ? '1' : '0'}
              onChange={(e) => setSecurity({ ...security, rateLimitSensitiveOps: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Enabled' },
                { value: '0', label: 'Disabled' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* SLA & Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">SLA & Alerts</h3>
          <Button variant="primary" size="sm">
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="SLA Compliance Threshold (%)"
            type="number"
            min="0"
            max="100"
            value={alerts.slaComplianceThreshold}
            onChange={(e) => setAlerts({ ...alerts, slaComplianceThreshold: parseInt(e.target.value || '0', 10) })}
          />

          <Input
            label="Payment Failure Threshold (%)"
            type="number"
            min="0"
            max="100"
            value={alerts.paymentFailureThreshold}
            onChange={(e) => setAlerts({ ...alerts, paymentFailureThreshold: parseInt(e.target.value || '0', 10) })}
          />

          <Input
            label="Moderation Queue Threshold"
            type="number"
            min="0"
            value={alerts.moderationQueueThreshold}
            onChange={(e) => setAlerts({ ...alerts, moderationQueueThreshold: parseInt(e.target.value || '0', 10) })}
          />

          <Input
            label="Notify Emails"
            value={alerts.notifyEmails}
            onChange={(e) => setAlerts({ ...alerts, notifyEmails: e.target.value })}
            helperText="Comma-separated"
          />
        </div>
      </Card>

      {/* API & Webhooks */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">API & Webhooks</h3>
          <Button variant="ghost" size="sm">
            Rotate Secrets
          </Button>
        </div>

        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={webhook.status === 'healthy' ? 'success' : 'danger'}>
                  {webhook.status}
                </Badge>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{webhook.name}</p>
                  <p className="text-xs text-gray-500">{webhook.lastEvent}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  View Logs
                </Button>
                <Button variant="secondary" size="sm">
                  Ping
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Environment Variables */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Environment</h3>
          <Button variant="ghost" size="sm">
            Check Status
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {envVars.map(env => (
            <div key={env.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono text-gray-900">{env.key}</code>
              <Badge variant={env.status === 'present' ? 'success' : 'default'}>
                {env.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Feature Flag Defaults */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Feature Flag Defaults</h3>
          <Button variant="primary" size="sm">
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Default Rollout %"
            type="number"
            min="0"
            max="100"
            value={featureDefaults.defaultRolloutPercent}
            onChange={(e) => setFeatureDefaults({ ...featureDefaults, defaultRolloutPercent: parseInt(e.target.value || '0', 10) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allow Per-User Targeting
            </label>
            <Select
              value={featureDefaults.allowTargetedUsers ? '1' : '0'}
              onChange={(e) => setFeatureDefaults({ ...featureDefaults, allowTargetedUsers: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Enabled' },
                { value: '0', label: 'Disabled' }
              ]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}