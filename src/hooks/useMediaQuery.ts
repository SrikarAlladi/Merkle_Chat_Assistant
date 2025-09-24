import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [isMd, setIsMd] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return false; // default for server-side rendering
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleChange = () => {
      setIsMd(mediaQuery.matches);
    };

    // Initial check
    handleChange();

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    isMd,
    isMobile: !isMd,
  };
}
