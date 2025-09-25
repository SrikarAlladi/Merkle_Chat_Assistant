import React from 'react';
import { useMobileMenu } from '../context/MobileMenuContext';
import MerkleLogo from './MerkleLogo';

const ChatHeader: React.FC = () => {
  const { toggleMenu } = useMobileMenu();

  return (
      <div className="flex items-center w-full py-[10px] justify-between">
        {/* Desktop: left-aligned small title */}
        <h6 className="hidden md:block text-white text-sm">
          Tracker Chat
        </h6>

        {/* Mobile: left group (hamburger + logo) */}
        <div className="flex items-center gap-3 md:hidden mobile-header">
          <button
            onClick={toggleMenu}
            className="p-2 text-black bg-white rounded-lg transition-colors active:bg-white/20"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <MerkleLogo className="text-white" width={30} fontSize={"1.1rem"} height={30} />
        </div>

        {/* Mobile: title pushed to the end */}
        <h6 className="md:hidden ml-auto text-white text-sm font-medium">
          Tracker Chat
        </h6>
      </div>
  );
};

export default ChatHeader;
