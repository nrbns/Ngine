import { useState, useEffect } from 'react';
import { Resolution, CheckIn } from './types';
import { storage } from './storage';
import { ResolutionForm } from './components/ResolutionForm';
import { CheckInForm } from './components/CheckInForm';
import { StatusCard } from './components/StatusCard';

function App() {
  const [resolution, setResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    const data = storage.load();
    setResolution(data.resolution);
  }, []);

  const handleCreateResolution = (newResolution: Resolution) => {
    setResolution(newResolution);
    storage.save({ resolution: newResolution });
  };

  const handleCheckIn = (checkIn: CheckIn) => {
    if (!resolution) return;

    const updatedResolution: Resolution = {
      ...resolution,
      checkIns: [
        ...resolution.checkIns.filter(ci => ci.date !== checkIn.date),
        checkIn,
      ],
    };

    setResolution(updatedResolution);
    storage.save({ resolution: updatedResolution });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? This will delete your resolution and all check-ins.')) {
      setResolution(null);
      storage.clear();
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🚀 NGINE</h1>
        <p className="subtitle">Resolution Tracker v0.1</p>
      </header>

      <main>
        {!resolution ? (
          <ResolutionForm onSubmit={handleCreateResolution} />
        ) : (
          <>
            <StatusCard resolution={resolution} />
            <CheckInForm resolution={resolution} onCheckIn={handleCheckIn} />
            <button onClick={handleReset} className="btn-secondary">
              Reset Resolution
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

