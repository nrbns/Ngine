// Status calculation and display utilities

import { ResolutionStatus } from '../types';

export function getStatusColor(status: ResolutionStatus): string {
  const colors = {
    aligned: '#10b981',    // Green
    drifting: '#f59e0b',   // Amber
    broken: '#ef4444',     // Red
    recovering: '#3b82f6', // Blue
  };
  return colors[status] || colors.aligned;
}

export function getStatusEmoji(status: ResolutionStatus): string {
  const emojis = {
    aligned: '🟢',
    drifting: '🟡',
    broken: '🔴',
    recovering: '🔵',
  };
  return emojis[status] || '🟢';
}

export function getStatusLabel(status: ResolutionStatus): string {
  const labels = {
    aligned: 'Aligned',
    drifting: 'Drifting',
    broken: 'Broken',
    recovering: 'Recovering',
  };
  return labels[status] || 'Unknown';
}

export function getStatusDescription(status: ResolutionStatus): string {
  const descriptions = {
    aligned: 'You\'re on track! Keep going.',
    drifting: 'You\'re starting to drift. Let\'s get back on track.',
    broken: 'Your resolution needs attention. Recovery mode available.',
    recovering: 'You\'re in recovery mode. Focus on small wins.',
  };
  return descriptions[status] || '';
}

