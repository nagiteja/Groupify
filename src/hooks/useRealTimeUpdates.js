import { useEffect, useState } from 'react';

export const useRealTimeUpdates = (sessionId, currentParticipants) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (!sessionId) return;

    const pollForUpdates = () => {
      const sessionData = localStorage.getItem(`groupify_session_${sessionId}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const sessionUpdateTime = new Date(session.lastUpdate || 0).getTime();
        
        if (sessionUpdateTime > lastUpdate) {
          setLastUpdate(sessionUpdateTime);
          // Trigger a page refresh to get latest data
          window.location.reload();
        }
      }
    };

    const interval = setInterval(pollForUpdates, 1000); // Check every second
    return () => clearInterval(interval);
  }, [sessionId, lastUpdate]);

  return lastUpdate;
};
