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

// Mock data
const initialTransactions = [
  { 
    id: 'pi_3Jk81', 
    expert: 'Sarah Chen', 
    asker: 'john@acme.com', 
    amount: 12500, 
    status: 'completed', 
    created_at: 'Today 10:21',
    question_id: 'q_1234'
  },
  { 
    id: 'pi_9Ds20', 
    expert: 'Amit Gupta', 
    asker: 'maria@globex.com', 
    amount: 7500, 
    status: 'refunded', 
    created_at: 'Today 09:54',
    question_id: 'q_1235'
  },
  { 
    id: 'pi_0Ke11', 
    expert: 'Elena Rossi', 
    asker: 'ops@initech.com', 
    amount: 10000, 
    status: 'pending', 
    created_at: 'Yesterday 18:12',
    question_id: 'q_1236'
  },
  { 
    id: 'pi_7Qa50', 
    expert: 'Amit Gupta', 
    asker: 'sam@contoso.com', 
    amount: 8500, 
    status: 'disputed', 
    created_at: 'Yesterday 16:40',
    question_id: 'q_1237'
  }
];

// ============================================================================
// Transaction Row Component
// ============================================================================
function TransactionRow({ transaction, onAction }) {
  const statusConfig = {
    completed: { variant: 'success', label: 'Completed' },
    pending: { variant: 'warning', label: 'Pending' },
    refunded: { variant: 'danger', label: 'Refunded' },
    disputed: { variant: 'danger', label: 'Disputed' }
  };

  const config = statusConfig[transaction.status];

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left: Transaction Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <code className="text-sm font-mono text-gray-900 font-semibold">
              {transaction.id}
            </code>
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Expert: </span>
              <span className="text-gray-900 font-medium">{transaction.expert}</span>
            </div>
            <div>
              <span className="text-gray-500">Asker: </span>
              <span className="text-gray-900">{transaction.asker}</span>
            </div>
            <div>
              <span className="text-gray-500">Time: </span>
              <span className="text-gray-900">{transaction.created_at}</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              €{(transaction.amount / 100).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Question {transaction.question_id}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAction('view', transaction)}
            >
              View
            </Button>
            {transaction.status === 'completed' && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => onAction('refund', transaction)}
              >
                Refund
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Refund Confirmation Modal
// ============================================================================
function RefundModal({ isOpen, onClose, transaction, onConfirm }) {
  const [reason, setReason] = useState('');

  if (!transaction) return null;

  const handleConfirm = () => {
    onConfirm(transaction, reason);
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Refund"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Issue Refund
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action cannot be undone. The full amount will be refunded to the asker.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-gray-900">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-bold text-gray-900">€{(transaction.amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Expert:</span>
            <span className="text-gray-900">{transaction.expert}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Asker:</span>
            <span className="text-gray-900">{transaction.asker}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Refund <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Explain why this transaction is being refunded..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('7d');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingTransaction, setRefundingTransaction] = useState(null);

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.asker.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true : tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleAction = (action, transaction) => {
    if (action === 'refund') {
      setRefundingTransaction(transaction);
      setShowRefundModal(true);
    } else if (action === 'view') {
      console.log('View transaction:', transaction);
    }
  };

  const handleRefundConfirm = (transaction, reason) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transaction.id ? { ...tx, status: 'refunded', refund_reason: reason } : tx
    ));
    console.log('Refund issued for', transaction.id, 'Reason:', reason);
  };

  // Calculate stats
  const stats = {
    total: transactions.length,
    totalAmount: transactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0),
    completed: transactions.filter(tx => tx.status === 'completed').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    refunded: transactions.filter(tx => tx.status === 'refunded').length,
    disputed: transactions.filter(tx => tx.status === 'disputed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Transactions"
        description="View and manage payment transactions"
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
            <p className="text-3xl font-bold text-gray-900">
              €{(stats.totalAmount / 100).toFixed(0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Volume</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.refunded + stats.disputed}</p>
            <p className="text-sm text-gray-500 mt-1">Refunded/Disputed</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by ID, expert, or asker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'disputed', label: 'Disputed' }
            ]}
          />
          <Select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: 'all', label: 'All time' }
            ]}
          />
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map(tx => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No transactions found"
            description={searchQuery ? "Try adjusting your search or filters" : "No transactions match the current filters"}
          />
        </Card>
      )}

      {/* Stripe Events Info */}
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Stripe Events</h3>
        <p className="text-sm text-gray-600">
          Click "View" on any transaction to see the full Stripe event timeline including payment_intent.created, charge.succeeded, and payout.paid events.
        </p>
      </Card>

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setRefundingTransaction(null);
        }}
        transaction={refundingTransaction}
        onConfirm={handleRefundConfirm}
      />
    </div>
  );
}