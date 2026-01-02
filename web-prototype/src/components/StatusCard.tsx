import { Resolution } from '../types';
import { calculateStatus, getStatusColor, getStatusLabel, getCurrentWeekDates, getTodayDate } from '../utils';

interface StatusCardProps {
  resolution: Resolution;
}

export function StatusCard({ resolution }: StatusCardProps) {
  const status = calculateStatus(resolution);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const weekDates = getCurrentWeekDates();
  const today = getTodayDate();
  const completedDays = weekDates
    .filter(date => date <= today)
    .filter(date => {
      const checkIn = resolution.checkIns.find(ci => ci.date === date);
      return checkIn && checkIn.status === 'done';
    }).length;

  const daysSoFar = weekDates.filter(date => date <= today).length;
  const requiredDays = Math.ceil((resolution.mdd / 7) * daysSoFar);

  return (
    <div className="status-card" style={{ borderColor: statusColor }}>
      <div className="status-header">
        <h3>{resolution.name}</h3>
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {statusLabel}
        </span>
      </div>
      
      <div className="status-stats">
        <div className="stat">
          <span className="stat-value">{completedDays}</span>
          <span className="stat-label">Done this week</span>
        </div>
        <div className="stat">
          <span className="stat-value">{requiredDays}</span>
          <span className="stat-label">Required (MDD: {resolution.mdd}/7)</span>
        </div>
      </div>
    </div>
  );
}

