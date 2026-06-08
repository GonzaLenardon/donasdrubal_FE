// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

const BREAKPOINT = '(max-width: 768px)';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(BREAKPOINT).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(BREAKPOINT);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
