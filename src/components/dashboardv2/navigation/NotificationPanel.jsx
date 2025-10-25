import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, MessageSquare, TrendingUp, X } from 'lucide-react';

function NotificationPanel({ isOpen, onClose, notifications = [] }) {
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'question':
        return <MessageSquare size={18} className="text-blue-600" />;
      case 'payment':
        return <DollarSign size={18} className="text-green-600" />;
      case 'expiring':
        return <Clock size={18} className="text-orange-600" />;
      case 'achievement':
        return <TrendingUp size={18} className="text-purple-600" />;
      default:
        return <MessageSquare size={18} className="text-gray-600" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'question':
        return 'bg-blue-50 border-blue-100';
      case 'payment':
        return 'bg-green-50 border-green-100';
      case 'expiring':
        return 'bg-orange-50 border-orange-100';
      case 'achievement':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.action) {
      navigate(notification.action);
      onClose();
    }
  };

  // Mock notifications if empty
  const displayNotifications = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'question',
      title: 'New question received',
      message: 'You have a new premium question waiting for your answer.',
      time: '5 minutes ago',
      action: '/dashboard/inbox',
      unread: true
    },
    {
      id: 2,
      type: 'expiring',
      title: 'Question expiring soon',
      message: '3 questions will expire in less than 12 hours.',
      time: '2 hours ago',
      action: '/dashboard/inbox',
      unread: true
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      message: 'You received $25 for answering a question.',
      time: '1 day ago',
      action: '/dashboard/payments',
      unread: false
    }
  ];

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fadeInDown"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {displayNotifications.filter(n => n.unread).length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {displayNotifications.filter(n => n.unread).length} unread
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close notifications"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          displayNotifications.map((notification, index) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors
                hover:bg-gray-50
                ${notification.unread ? 'bg-blue-50/30' : 'bg-white'}
                ${index === displayNotifications.length - 1 ? 'border-b-0' : ''}
              `}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  ${getNotificationStyle(notification.type)}
                  border
                `}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {notification.title}
                    </h4>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {displayNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              navigate('/dashboard/notifications');
              onClose();
            }}
            className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;