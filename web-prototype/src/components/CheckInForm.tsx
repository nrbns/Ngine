import { useState, useEffect } from 'react';
import { CheckIn, CheckInStatus } from '../types';
import { getTodayDate, getCheckInForDate } from '../utils';
import { Resolution } from '../types';

interface CheckInFormProps {
  resolution: Resolution;
  onCheckIn: (checkIn: CheckIn) => void;
}

export function CheckInForm({ resolution, onCheckIn }: CheckInFormProps) {
  const today = getTodayDate();
  const existingCheckIn = getCheckInForDate(resolution, today);
  
  const [status, setStatus] = useState<CheckInStatus>(
    existingCheckIn?.status || 'not-done'
  );
  const [energy, setEnergy] = useState<number>(
    existingCheckIn?.energy || 3
  );

  useEffect(() => {
    if (existingCheckIn) {
      setStatus(existingCheckIn.status);
      setEnergy(existingCheckIn.energy);
    }
  }, [existingCheckIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn({
      date: today,
      status,
      energy,
    });
  };

  return (
    <div className="checkin-form">
      <h3>Daily Check-In</h3>
      <p className="date-label">{new Date(today).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>How did you do today?</label>
          <div className="status-buttons">
            <button
              type="button"
              className={`status-btn ${status === 'done' ? 'active' : ''}`}
              onClick={() => setStatus('done')}
            >
              ✅ Done
            </button>
            <button
              type="button"
              className={`status-btn ${status === 'partial' ? 'active' : ''}`}
              onClick={() => setStatus('partial')}
            >
              ⚠️ Partial
            </button>
            <button
              type="button"
              className={`status-btn ${status === 'not-done' ? 'active' : ''}`}
              onClick={() => setStatus('not-done')}
            >
              ❌ Not Done
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="energy">
            Energy Level: {energy}/5
          </label>
          <input
            id="energy"
            type="range"
            min="1"
            max="5"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="energy-slider"
          />
          <div className="energy-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          {existingCheckIn ? 'Update Check-In' : 'Save Check-In'}
        </button>
      </form>
    </div>
  );
}

