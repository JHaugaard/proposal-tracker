import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useDistillerTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, TIMEOUT_DURATION);
  }, [onTimeout]);

  const clearDistillerTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { resetTimeout, clearTimeout: clearDistillerTimeout };
}