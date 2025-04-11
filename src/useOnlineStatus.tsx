import { useEffect, useState } from 'react';

const checkInternetConnection = async (): Promise<boolean> => {
    try {
        // Use a lightweight, cache-busting, external ping
        const response = await fetch('https://www.gstatic.com/generate_204', {
          method: 'GET',
          cache: 'no-cache',
          mode: 'no-cors', // so it won't block on CORS
        });
    
        if(response.ok){
            return true;
        }
        return false; // if fetch succeeds, assume online
      } catch {
        return false;
      }
};

export const useRealOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const verifyConnection = async () => {
      const online = await checkInternetConnection();
      console.log("online >>",online);
      setIsOnline(online);
    };

    // Run on mount
    verifyConnection();
 /*
    // Optional: also listen to browser events
    const handleOnline = () => verifyConnection();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }; */
  }, []);

  return isOnline;
};
