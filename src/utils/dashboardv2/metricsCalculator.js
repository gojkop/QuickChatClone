// src/utils/dashboardv2/metricsCalculator.js
/**
 * Format currency safely
 * Handles cents (integer) and converts to dollars
 */
export function formatCurrency(cents) {
  // Handle null, undefined, NaN
  if (cents === null || cents === undefined || isNaN(cents)) {
    return '$0';
  }

  // Handle negative values
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);

  // Convert cents to dollars
  const dollars = absCents / 100;

  // Format with commas and 2 decimals
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format duration safely
 * Handles hours and converts to human-readable format
 */
export function formatDuration(hours) {
  // Handle null, undefined, NaN, zero
  if (hours === null || hours === undefined || isNaN(hours) || hours === 0) {
    return '0h';
  }

  // Less than 1 hour - show minutes
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }

  // Less than 24 hours - show hours
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  // 24 hours or more - show days
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}d`;
  }
  
  return `${days}d ${remainingHours.toFixed(0)}h`;
}

/**
 * Format number safely with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-US');
}

/**
 * Format percentage safely
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change safely
 */
export function calculatePercentageChange(current, previous) {
  // Handle invalid inputs
  if (
    current === null || current === undefined || isNaN(current) ||
    previous === null || previous === undefined || isNaN(previous)
  ) {
    return 0;
  }

  // Avoid division by zero
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}