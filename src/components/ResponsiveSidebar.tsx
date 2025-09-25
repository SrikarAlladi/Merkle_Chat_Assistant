import React, { useEffect } from 'react';
import { useBreakpoint } from '../hooks/useMediaQuery';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useSidebarSwipe } from '../hooks/useSwipeGesture';
import MerkleLogo from './MerkleLogo';

interface ResponsiveSidebarProps {
  children?: React.ReactNode;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ children }) => {
  const { isMobile } = useBreakpoint();
  const { isMenuOpen, closeMenu } = useMobileMenu();

  // Swipe gesture handlers
  const { touchHandlers } = useSidebarSwipe(
    () => { }, // We'll handle opening from the main app area
    closeMenu,
    isMobile && isMenuOpen
  );

  // Close menu when clicking overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMenu();
    }
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMenuOpen]);

  return (
    <>
      <div className="flex-col hidden md:flex">
        <MerkleLogo className="text-white" width={40} height={40} />
      </div>
      <div className="bg-white border-2 sidebar-content border-[#1D4ED8] rounded-2xl overflow-hidden hidden md:flex flex-col flex-grow">
        <DesktopSidebarContent />
      </div>
    </>
  );
};


// Desktop sidebar content component
const DesktopSidebarContent: React.FC = () => {
  return (
    <>
      {/* Navigation */}
      <nav className="px-4 py-4">
        <ul className="space-y-2">
          <li>
            <button className="w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">Home</button>
          </li>
          <li>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium text-sm transition-colors">Chat</button>
          </li>
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="mt-auto px-4 py-4 border-t border-gray-200">
        <button className="w-full text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">Settings</button>
      </div>
    </>
  );
};

export default ResponsiveSidebar;
