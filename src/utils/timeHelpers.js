// src/utils/timeHelpers.js
import { Zap, Sun, Sunset, Sunrise, Calendar, Siren, AlertTriangle, Pin, Check } from 'lucide-react';

/**
 * Estimate how long a question will take to answer
 */
export function estimateAnswerDuration(question) {
  let baseMinutes = 20;
  
  if (question.recording_segments?.length > 0) {
    baseMinutes += 10;
  }
  
  if (question.attachments?.length > 0) {
    baseMinutes += 5 * Math.min(question.attachments.length, 3);
  }
  
  if (question.text?.length > 500) {
    baseMinutes += 10;
  }
  
  const priceUsd = (question.price_cents || 0) / 100;
  if (priceUsd > 100) baseMinutes += 10;
  if (priceUsd > 200) baseMinutes += 15;
  
  baseMinutes = Math.round(baseMinutes / 5) * 5;
  return Math.min(Math.max(baseMinutes, 15), 90);
}

/**
 * Generate smart time slot suggestions
 */
export function generateTimeSlots(question) {
  const now = new Date();
  const slots = [];
  
  // Get SLA deadline
  const slaDeadline = question.sla_hours 
    ? new Date(question.created_at * 1000 + question.sla_hours * 3600000)
    : null;
  
  // TODAY - If before 3pm
  if (now.getHours() < 15) {
    // In 1 hour
    const inOneHour = new Date(now);
    inOneHour.setHours(now.getHours() + 1, 0, 0, 0);
    if (!slaDeadline || inOneHour < slaDeadline) {
      slots.push({
        date: inOneHour,
        label: 'In 1 hour',
        sublabel: formatTime(inOneHour),
        priority: 100,
        icon: Zap,
        iconColor: 'text-yellow-500'
      });
    }
    
    // Today 2pm
    if (now.getHours() < 14) {
      const afternoon = new Date(now);
      afternoon.setHours(14, 0, 0, 0);
      if (!slaDeadline || afternoon < slaDeadline) {
        slots.push({
          date: afternoon,
          label: 'This afternoon',
          sublabel: '2:00 PM',
          priority: 90,
          icon: Sun,
          iconColor: 'text-orange-500'
        });
      }
    }
    
    // Today 4pm
    if (now.getHours() < 16) {
      const endOfDay = new Date(now);
      endOfDay.setHours(16, 0, 0, 0);
      if (!slaDeadline || endOfDay < slaDeadline) {
        slots.push({
          date: endOfDay,
          label: 'Before end of day',
          sublabel: '4:00 PM',
          priority: 80,
          icon: Sunset,
          iconColor: 'text-pink-500'
        });
      }
    }
  }
  
  // TOMORROW
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  if (!slaDeadline || tomorrow < slaDeadline) {
    slots.push({
      date: tomorrow,
      label: 'Tomorrow morning',
      sublabel: formatDateWithTime(tomorrow),
      priority: 75,
      icon: Sunrise,
      iconColor: 'text-amber-500'
    });
  }
  
  // Day after tomorrow
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(9, 0, 0, 0);
  
  if (!slaDeadline || dayAfter < slaDeadline) {
    slots.push({
      date: dayAfter,
      label: formatWeekday(dayAfter),
      sublabel: formatDateWithTime(dayAfter),
      priority: 60,
      icon: Calendar,
      iconColor: 'text-blue-500'
    });
  }
  
  return slots.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

/**
 * Get urgency level based on SLA
 */
export function getUrgencyLevel(question) {
  if (!question.sla_hours) return null;
  
  const now = new Date();
  const deadline = new Date(question.created_at * 1000 + question.sla_hours * 3600000);
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
  
  if (hoursRemaining < 2) {
    return { 
      level: 'critical', 
      label: 'URGENT', 
      icon: Siren,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700'
    };
  }
  
  if (hoursRemaining < 6) {
    return { 
      level: 'high', 
      label: 'High Priority', 
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700'
    };
  }
  
  if (hoursRemaining < 24) {
    return { 
      level: 'medium', 
      label: 'Due Soon', 
      icon: Pin,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700'
    };
  }
  
  return { 
    level: 'low', 
    label: 'On Track', 
    icon: Check,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700'
  };
}

/**
 * Format time (e.g., "2:00 PM")
 */
export function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format date with time
 */
export function formatDateWithTime(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) + ' at ' + formatTime(date);
}

/**
 * Format weekday
 */
export function formatWeekday(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long'
  });
}