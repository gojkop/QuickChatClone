import React from 'react';
import { 
  Card, 
  StatCard, 
  Badge, 
  Button, 
  SectionHeader,
  EmptyState 
} from '../components/ui';

// Inline SVG Icons
const Icons = {
  Users: () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  )
};

// Mock data
const kpis = [
  { 
    label: 'Active Experts', 
    value: '128', 
    change: '+12%', 
    trend: 'up', 
    icon: <Icons.Users />
  },
  { 
    label: 'Total Askers', 
    value: '2,145', 
    change: '+8%', 
    trend: 'up', 
    icon: <Icons.Users />
  },
  { 
    label: 'GTV This Month', 
    value: '€12,480', 
    change: '+21%', 
    trend: 'up', 
    icon: <Icons.TrendingUp />
  },
  { 
    label: 'Pending Questions', 
    value: '37', 
    change: '-5%', 
    trend: 'down', 
    icon: <Icons.Clock />
  }
];

const recentActivity = [
  { 
    type: 'payment', 
    user: 'Sarah Chen', 
    action: 'completed answer', 
    amount: '€125', 
    time: '5m ago', 
    status: 'success' 
  },
  { 
    type: 'flag', 
    user: 'Auto-mod', 
    action: 'flagged content', 
    amount: null, 
    time: '12m ago', 
    status: 'warning' 
  },
  { 
    type: 'expert', 
    user: 'Amit Gupta', 
    action: 'joined platform', 
    amount: null, 
    time: '1h ago', 
    status: 'info' 
  },
  { 
    type: 'payment', 
    user: 'Elena Rossi', 
    action: 'refund issued', 
    amount: '€75', 
    time: '2h ago', 
    status: 'danger' 
  }
];

const atRiskExperts = [
  { 
    id: 101, 
    name: 'Sarah Chen', 
    pending: 3, 
    avgHours: 28, 
    health: 'warning' 
  },
  { 
    id: 204, 
    name: 'Amit Gupta', 
    pending: 5, 
    avgHours: 35, 
    health: 'danger' 
  }
];

const funnelSteps = [
  { step: 'Link Visits', value: '5,420', rate: 100 },
  { step: 'Question Started', value: '375', rate: 6.9 },
  { step: 'Payment Complete', value: '312', rate: 83.2 },
  { step: 'Answer Delivered', value: '295', rate: 94.6 }
];

// ============================================================================
// Activity Item Component
// ============================================================================
function ActivityItem({ item }) {
  const statusConfig = {
    success: { dot: 'bg-green-500', bg: 'bg-green-50' },
    warning: { dot: 'bg-amber-500', bg: 'bg-amber-50' },
    danger: { dot: 'bg-red-500', bg: 'bg-red-50' },
    info: { dot: 'bg-blue-500', bg: 'bg-blue-50' }
  };
  
  const config = statusConfig[item.status] || statusConfig.info;
  
  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.user}</p>
        <p className="text-xs text-gray-500">{item.action}</p>
      </div>
      {item.amount && (
        <span className="text-sm font-semibold text-gray-900">{item.amount}</span>
      )}
      <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
    </div>
  );
}

// ============================================================================
// Expert Health Row Component
// ============================================================================
function ExpertHealthRow({ expert }) {
  const healthConfig = {
    warning: { 
      badge: 'warning', 
      label: 'Warning',
      action: 'Send reminder' 
    },
    danger: { 
      badge: 'danger', 
      label: 'Critical',
      action: 'Urgent action' 
    }
  };
  
  const config = healthConfig[expert.health];
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-indigo-700">
            {expert.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{expert.name}</p>
          <p className="text-xs text-gray-500">
            {expert.pending} pending • {expert.avgHours}h avg response
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-13 sm:ml-0">
        <Badge variant={config.badge}>
          {config.label}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => console.log('Remind', expert.id)}
        >
          {config.action}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Funnel Step Component
// ============================================================================
function FunnelStep({ step, isLast }) {
  return (
    <div className="relative">
      <div className="text-center mb-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${step.rate}%` }}
          />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
          {step.value}
        </p>
        <p className="text-xs text-gray-500 mb-1">{step.step}</p>
        <p className="text-xs font-semibold text-indigo-600">{step.rate}%</p>
      </div>
      
      {!isLast && (
        <div className="hidden lg:block absolute top-8 -right-4 text-gray-300">
          <Icons.ArrowUpRight />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Real-time updates from your platform
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <ActivityItem key={i} item={item} />
                ))
              ) : (
                <EmptyState 
                  title="No recent activity"
                  description="Activity will appear here as users interact with your platform"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Quick Actions & System Health */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => console.log('Create flag')}
              >
                Create Feature Flag
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => console.log('Review queue')}
              >
                Review Moderation Queue
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => console.log('Export')}
              >
                Export Transactions
              </Button>
            </div>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Icons.CheckCircle />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">System Health</h3>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">API Response</span>
                <span className="font-semibold text-green-600">45ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Active Sessions</span>
                <span className="font-semibold text-gray-900">243</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Experts Needing Attention */}
      <Card padding="none">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Experts Needing Attention</h2>
              <p className="text-sm text-gray-500 mt-1">Approaching SLA limits or missed deadlines</p>
            </div>
            <Button variant="ghost" size="sm">
              View all experts
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-3">
          {atRiskExperts.length > 0 ? (
            atRiskExperts.map((expert, i) => (
              <ExpertHealthRow key={i} expert={expert} />
            ))
          ) : (
            <EmptyState 
              title="All experts healthy"
              description="No experts currently need attention"
            />
          )}
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Conversion Funnel</h2>
            <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
          </div>
          <Button variant="ghost" size="sm">
            Export report
          </Button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
          {funnelSteps.map((step, i) => (
            <FunnelStep 
              key={i} 
              step={step} 
              isLast={i === funnelSteps.length - 1} 
            />
          ))}
        </div>
      </Card>
    </div>
  );
}