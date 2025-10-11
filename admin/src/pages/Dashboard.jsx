import React, { useState } from 'react';
import { 
  Card, 
  StatCard, 
  Badge, 
  Button, 
  SectionHeader,
  EmptyState,
  Select 
} from '../components/ui';
import {
  TrendLineChart,
  AreaChartComponent,
  BarChartComponent,
  DonutChart,
  Sparkline
} from '../components/charts';

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
  )
};

// Mock data for charts
const gtvTrendData = [
  { date: 'Oct 1', gtv: 8400, questions: 34 },
  { date: 'Oct 2', gtv: 9200, questions: 38 },
  { date: 'Oct 3', gtv: 7800, questions: 31 },
  { date: 'Oct 4', gtv: 10500, questions: 42 },
  { date: 'Oct 5', gtv: 11200, questions: 45 },
  { date: 'Oct 6', gtv: 9800, questions: 39 },
  { date: 'Oct 7', gtv: 12480, questions: 48 }
];

const expertPerformanceData = [
  { name: 'Sarah Chen', questions: 87, revenue: 10875 },
  { name: 'Elena Rossi', questions: 134, revenue: 13400 },
  { name: 'Amit Gupta', questions: 42, revenue: 3150 },
  { name: 'Tom Wilson', questions: 65, revenue: 8125 },
  { name: 'Lisa Park', questions: 91, revenue: 11375 }
];

const questionStatusData = [
  { name: 'Completed', value: 295 },
  { name: 'Pending', value: 37 },
  { name: 'Missed SLA', value: 8 },
  { name: 'Refunded', value: 5 }
];

const categoryBreakdownData = [
  { name: 'Product', value: 142 },
  { name: 'Engineering', value: 98 },
  { name: 'Design', value: 87 },
  { name: 'Marketing', value: 65 },
  { name: 'Other', value: 53 }
];

const sparklineData = [
  { value: 24 }, { value: 28 }, { value: 22 }, { value: 31 },
  { value: 35 }, { value: 29 }, { value: 37 }, { value: 42 }
];

// KPI data with sparklines
const kpis = [
  { 
    label: 'Active Experts', 
    value: '128', 
    change: '+12%', 
    trend: 'up', 
    icon: <Icons.Users />,
    sparkline: sparklineData
  },
  { 
    label: 'Total Askers', 
    value: '2,145', 
    change: '+8%', 
    trend: 'up', 
    icon: <Icons.Users />,
    sparkline: sparklineData.map(d => ({ value: d.value * 2 }))
  },
  { 
    label: 'GTV This Month', 
    value: '€12,480', 
    change: '+21%', 
    trend: 'up', 
    icon: <Icons.TrendingUp />,
    sparkline: gtvTrendData.map(d => ({ value: d.gtv / 100 }))
  },
  { 
    label: 'Pending Questions', 
    value: '37', 
    change: '-5%', 
    trend: 'down', 
    icon: <Icons.Clock />,
    sparkline: sparklineData.map(d => ({ value: 50 - d.value }))
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

// ============================================================================
// Activity Item Component
// ============================================================================
function ActivityItem({ item }) {
  const statusConfig = {
    success: { dot: 'bg-green-500' },
    warning: { dot: 'bg-amber-500' },
    danger: { dot: 'bg-red-500' },
    info: { dot: 'bg-blue-500' }
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
// Enhanced Stat Card with Sparkline
// ============================================================================
function EnhancedStatCard({ stat }) {
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center flex-shrink-0">
          {stat.icon}
        </div>
      </div>
      {stat.sparkline && (
        <div className="mt-2 -mx-2">
          <Sparkline 
            data={stat.sparkline} 
            dataKey="value"
            color={stat.trend === 'up' ? '#10B981' : '#EF4444'}
          />
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================
export default function Dashboard() {
  const [dateRange, setDateRange] = useState('7d');

  const currencyFormatter = (value) => `€${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Dashboard"
          description="Platform performance and key metrics"
        />
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          options={[
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' }
          ]}
        />
      </div>

      {/* KPI Stats Grid with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <EnhancedStatCard key={i} stat={stat} />
        ))}
      </div>

      {/* Charts Row 1: GTV Trend & Question Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GTV Trend */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">GTV & Questions Trend</h3>
          <TrendLineChart
            data={gtvTrendData}
            dataKeys={['gtv', 'questions']}
            height={300}
            formatter={(value, name) => 
              name === 'gtv' ? `€${value.toLocaleString()}` : value
            }
          />
        </Card>

        {/* Question Status Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Question Status</h3>
          <DonutChart
            data={questionStatusData}
            height={300}
            centerText="345"
          />
        </Card>
      </div>

      {/* Charts Row 2: Expert Performance & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expert Performance */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Experts by Revenue</h3>
          <BarChartComponent
            data={expertPerformanceData}
            dataKeys={['revenue']}
            height={300}
            formatter={currencyFormatter}
          />
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-3">
            {categoryBreakdownData.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{cat.name}</span>
                  <span className="font-semibold text-gray-900">{cat.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                    style={{ width: `${(cat.value / 445) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
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
              {recentActivity.map((item, i) => (
                <ActivityItem key={i} item={item} />
              ))}
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
    </div>
  );
}