import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useBreakpoint } from '../hooks/useMediaQuery';

interface MobileMenuContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  isSwipeEnabled: boolean;
  setSwipeEnabled: (enabled: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

interface MobileMenuProviderProps {
  children: React.ReactNode;
}

export const MobileMenuProvider: React.FC<MobileMenuProviderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwipeEnabled, setSwipeEnabled] = useState(true);
  const { isMobile } = useBreakpoint();

  // Auto-close menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const value: MobileMenuContextType = {
    isMenuOpen,
    toggleMenu,
    openMenu,
    closeMenu,
    isSwipeEnabled,
    setSwipeEnabled,
  };

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  );
};

export const useMobileMenu = (): MobileMenuContextType => {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};
