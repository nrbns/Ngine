// Status calculation and display utilities
import { Status } from '../logic/statusEngine';

export function getStatusColor(status: Status | string): string {
  const colors: Record<string, string> = {
    aligned: '#10b981',    // Green
    drifting: '#f59e0b',   // Amber
    broken: '#ef4444',     // Red
    recovering: '#3b82f6', // Blue
  };
  return colors[status] || colors.aligned;
}

export function getStatusEmoji(status: Status | string): string {
  const emojis: Record<string, string> = {
    aligned: '🟢',
    drifting: '🟡',
    broken: '🔴',
    recovering: '🔵',
  };
  return emojis[status] || '🟢';
}

export function getStatusLabel(status: Status | string): string {
  const labels: Record<string, string> = {
    aligned: 'Aligned',
    drifting: 'Drifting',
    broken: 'Broken',
    recovering: 'Recovering',
  };
  return labels[status] || 'Unknown';
}

export function getStatusDescription(status: Status | string): string {
  const descriptions: Record<string, string> = {
    aligned: 'You\'re on track! Keep going.',
    drifting: 'You\'re starting to drift. Let\'s get back on track.',
    broken: 'Your resolution needs attention. Recovery mode available.',
    recovering: 'You\'re in recovery mode. Focus on small wins.',
  };
  return descriptions[status] || '';
}

