import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Input,
  Select,
  SectionHeader,
  EmptyState 
} from '../components/ui';

// Mock data
const initialExperts = [
  { 
    id: 1, 
    name: 'Sarah Chen', 
    email: 'sarah@example.com', 
    stripe_connected: true, 
    price_cents: 12500, 
    sla_hours: 24, 
    accepting_questions: true,
    total_questions: 87,
    avg_response_hours: 18,
    rating: 4.8,
    specialty: 'Product Management'
  },
  { 
    id: 2, 
    name: 'Amit Gupta', 
    email: 'amit@example.com', 
    stripe_connected: false, 
    price_cents: 7500, 
    sla_hours: 48, 
    accepting_questions: false,
    total_questions: 42,
    avg_response_hours: 35,
    rating: 4.5,
    specialty: 'Engineering'
  },
  { 
    id: 3, 
    name: 'Elena Rossi', 
    email: 'elena@example.com', 
    stripe_connected: true, 
    price_cents: 10000, 
    sla_hours: 24, 
    accepting_questions: true,
    total_questions: 134,
    avg_response_hours: 16,
    rating: 4.9,
    specialty: 'Design'
  }
];

// ============================================================================
// Expert Card Component
// ============================================================================
function ExpertCard({ expert, onAction }) {
  return (
    <Card hover>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-700">
              {expert.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
              <p className="text-sm text-gray-500">{expert.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={expert.accepting_questions ? 'success' : 'default'}>
                {expert.accepting_questions ? 'Available' : 'Away'}
              </Badge>
              <Badge variant={expert.stripe_connected ? 'success' : 'danger'}>
                {expert.stripe_connected ? 'Connected' : 'No Stripe'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">Specialty</p>
              <p className="text-sm font-semibold text-gray-900">{expert.specialty}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-sm font-semibold text-gray-900">€{(expert.price_cents / 100).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">SLA</p>
              <p className="text-sm font-semibold text-gray-900">{expert.sla_hours}h</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rating</p>
              <p className="text-sm font-semibold text-gray-900">⭐ {expert.rating}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{expert.total_questions}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{expert.avg_response_hours}h</p>
              <p className="text-xs text-gray-500">Avg Response</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">
                {expert.sla_hours > expert.avg_response_hours ? '✓' : '⚠️'}
              </p>
              <p className="text-xs text-gray-500">SLA Health</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onAction('view', expert)}
            >
              View Details
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onAction('toggle_availability', expert)}
            >
              {expert.accepting_questions ? 'Set Away' : 'Set Available'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAction('message', expert)}
            >
              Send Message
            </Button>
            {!expert.stripe_connected && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onAction('connect_stripe', expert)}
              >
                Connect Stripe
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function Experts() {
  const [experts, setExperts] = useState(initialExperts);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [stripeFilter, setStripeFilter] = useState('all');

  // Filter experts
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = 
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAvailability = 
      availabilityFilter === 'all' ? true :
      availabilityFilter === 'available' ? expert.accepting_questions :
      !expert.accepting_questions;

    const matchesStripe = 
      stripeFilter === 'all' ? true :
      stripeFilter === 'connected' ? expert.stripe_connected :
      !expert.stripe_connected;

    return matchesSearch && matchesAvailability && matchesStripe;
  });

  // Handlers
  const handleAction = (action, expert) => {
    switch (action) {
      case 'toggle_availability':
        setExperts(prev => prev.map(e => 
          e.id === expert.id ? { ...e, accepting_questions: !e.accepting_questions } : e
        ));
        break;
      case 'view':
        console.log('View expert:', expert);
        break;
      case 'message':
        console.log('Message expert:', expert);
        break;
      case 'connect_stripe':
        console.log('Connect Stripe for:', expert);
        break;
      default:
        break;
    }
  };

  const stats = {
    total: experts.length,
    available: experts.filter(e => e.accepting_questions).length,
    connected: experts.filter(e => e.stripe_connected).length,
    avgRating: (experts.reduce((sum, e) => sum + e.rating, 0) / experts.length).toFixed(1)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Experts"
        description="Manage expert profiles and availability"
        action={
          <Button variant="secondary">
            Export CSV
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Experts</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
            <p className="text-sm text-gray-500 mt-1">Available Now</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.connected}</p>
            <p className="text-sm text-gray-500 mt-1">Stripe Connected</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">⭐ {stats.avgRating}</p>
            <p className="text-sm text-gray-500 mt-1">Avg Rating</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, email, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:col-span-1"
          />
          <Select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Availability' },
              { value: 'available', label: 'Available Only' },
              { value: 'away', label: 'Away Only' }
            ]}
          />
          <Select
            value={stripeFilter}
            onChange={(e) => setStripeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Stripe Status' },
              { value: 'connected', label: 'Connected Only' },
              { value: 'disconnected', label: 'Not Connected' }
            ]}
          />
        </div>
      </Card>

      {/* Experts List */}
      {filteredExperts.length > 0 ? (
        <div className="space-y-4">
          {filteredExperts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No experts found"
            description={searchQuery ? "Try adjusting your search or filters" : "No experts match the current filters"}
          />
        </Card>
      )}
    </div>
  );
}