import { useState } from 'react';
import { Resolution } from '../types';
import { getTodayDate } from '../utils';

interface ResolutionFormProps {
  onSubmit: (resolution: Resolution) => void;
}

export function ResolutionForm({ onSubmit }: ResolutionFormProps) {
  const [name, setName] = useState('');
  const [mdd, setMdd] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resolution: Resolution = {
      id: crypto.randomUUID(),
      name: name.trim(),
      mdd,
      createdAt: getTodayDate(),
      checkIns: [],
    };

    onSubmit(resolution);
  };

  return (
    <div className="resolution-form">
      <h2>Create Your Resolution</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Resolution Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Exercise daily"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mdd">
            Minimum Daily Discipline (MDD)
            <span className="hint">Days per week you commit to</span>
          </label>
          <input
            id="mdd"
            type="number"
            min="1"
            max="7"
            value={mdd}
            onChange={(e) => setMdd(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Start Tracking
        </button>
      </form>
    </div>
  );
}

