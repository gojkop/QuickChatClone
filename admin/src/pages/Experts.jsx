import { useState } from 'react';

// Mock UI components
const Card = ({ children, padding = 'default', hover = false, className = '' }) => {
  const paddings = { none: '', sm: 'p-4', default: 'p-6', lg: 'p-8' };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddings[padding]} ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}>
      {children}
    </div>
  );
};

const Button = ({ variant = 'primary', size = 'md', fullWidth = false, disabled = false, children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-md disabled:opacity-50',
    secondary: 'border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      disabled={disabled}
      className={`font-medium rounded-lg transition-all duration-200 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Input = ({ label, error, helperText, fullWidth = true, className = '', ...props }) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-300' : 'border-gray-200'} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

const Select = ({ label, error, options = [], fullWidth = true, className = '', ...props }) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        className={`px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-300' : 'border-gray-200'} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ title, description, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div className="sm:flex-shrink-0">{action}</div>}
    </div>
  );
};

const EmptyState = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};

// Mock expert data
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
  },
  { 
    id: 4, 
    name: 'Tom Wilson', 
    email: 'tom@example.com', 
    stripe_connected: true, 
    price_cents: 9500, 
    sla_hours: 36, 
    accepting_questions: true,
    total_questions: 65,
    avg_response_hours: 28,
    rating: 4.7,
    specialty: 'Marketing'
  }
];

// Compact Expert Row Component
function CompactExpertRow({ expert, onAction, isSelected }) {
  return (
    <div 
      onClick={() => onAction('view', expert)}
      className={`
        group relative flex items-center gap-3 px-4 py-3 
        border-b border-gray-100 cursor-pointer transition-all
        hover:bg-gray-50
        ${isSelected ? 'bg-indigo-50 border-indigo-200' : ''}
      `}
    >
      {/* Avatar & Basic Info */}
      <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-indigo-700">
            {expert.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {expert.name}
            </p>
            <Badge variant={expert.accepting_questions ? 'success' : 'default'}>
              {expert.accepting_questions ? 'Available' : 'Away'}
            </Badge>
            <Badge variant={expert.stripe_connected ? 'success' : 'danger'}>
              {expert.stripe_connected ? '✓ Stripe' : '✗ Stripe'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 truncate">{expert.specialty}</p>
        </div>
      </div>

      {/* Key Metrics (Desktop only) */}
      <div className="hidden lg:flex items-center gap-6 flex-shrink-0 text-sm">
        <div className="text-center">
          <p className="font-semibold text-gray-900">€{(expert.price_cents / 100).toFixed(0)}</p>
          <p className="text-xs text-gray-500">Price</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{expert.total_questions}</p>
          <p className="text-xs text-gray-500">Questions</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{expert.avg_response_hours}h</p>
          <p className="text-xs text-gray-500">Avg Time</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">⭐ {expert.rating}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
        <div className="text-center">
          <p className={`font-semibold ${expert.sla_hours > expert.avg_response_hours ? 'text-green-600' : 'text-red-600'}`}>
            {expert.sla_hours > expert.avg_response_hours ? '✓ OK' : '⚠ Risk'}
          </p>
          <p className="text-xs text-gray-500">SLA</p>
        </div>
      </div>

      {/* Actions Menu (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onAction('toggle_availability', expert); }}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {expert.accepting_questions ? 'Set Away' : 'Set Available'}
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onAction('message', expert); }}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Message
        </button>

        {!expert.stripe_connected && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAction('connect_stripe', expert); }}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Connect Stripe
          </button>
        )}
      </div>

      {/* Mobile Actions Indicator */}
      <div className="lg:hidden flex-shrink-0">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
      )}
    </div>
  );
}

// Main Component
export default function ExpertsCompact() {
  const [experts, setExperts] = useState(initialExperts);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [stripeFilter, setStripeFilter] = useState('all');
  const [selectedExpert, setSelectedExpert] = useState(null);

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
        setSelectedExpert(expert);
        break;
      case 'message':
        console.log('Message expert:', expert);
        alert(`Message ${expert.name}`);
        break;
      case 'connect_stripe':
        console.log('Connect Stripe for:', expert);
        alert(`Connect Stripe for ${expert.name}`);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setStripeFilter('all');
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
          <Button variant="secondary" onClick={clearFilters} fullWidth>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Compact Experts Table */}
      <Card padding="none">
        {/* Table Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="flex-shrink-0 w-64">Expert</div>
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <div className="w-12 text-center">Price</div>
            <div className="w-16 text-center">Questions</div>
            <div className="w-16 text-center">Avg Time</div>
            <div className="w-16 text-center">Rating</div>
            <div className="w-12 text-center">SLA</div>
          </div>
          <div className="hidden lg:block ml-auto text-right w-64">Actions</div>
        </div>
        
        {/* Table Body */}
        <div>
          {filteredExperts.length > 0 ? (
            filteredExperts.map(expert => (
              <CompactExpertRow
                key={expert.id}
                expert={expert}
                onAction={handleAction}
                isSelected={selectedExpert?.id === expert.id}
              />
            ))
          ) : (
            <div className="p-8">
              <EmptyState
                title="No experts found"
                description="Try adjusting your search or filters"
              />
            </div>
          )}
        </div>

        {/* Table Footer */}
        {filteredExperts.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredExperts.length} of {experts.length} experts</span>
          </div>
        )}
      </Card>

      {/* Detail View Hint */}
      {selectedExpert && (
        <Card className="bg-indigo-50 border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-700">
                  {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">
                {selectedExpert.name}
              </h3>
              <p className="text-sm text-indigo-700">
                Click on an expert to view full details (detail panel coming soon)
              </p>
            </div>
            <button 
              onClick={() => setSelectedExpert(null)}
              className="flex-shrink-0 p-1 hover:bg-indigo-100 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}