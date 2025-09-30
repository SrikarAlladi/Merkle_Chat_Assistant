import React from 'react';
import { useAppSelector } from '../store';

const TypingIndicator: React.FC = () => {
  const isTyping = useAppSelector((state) => state.chat.isTyping);
  const isLoading = useAppSelector((state) => state.chat.isLoading);

  if (!isTyping && !isLoading) return null;

  return (
    <div className="flex items-start space-x-3 mb-6 px-6">
      {/* AI Avatar */}
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Typing Animation */}
      <div className="flex-1 max-w-3xl">
        <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Animated dots */}
            <div className="flex space-x-1">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
            
            {/* Status text */}
            <span className="text-sm text-gray-500 font-medium">
              {isLoading ? 'Grok AI is thinking...' : 'AI is typing...'}
            </span>
            
            {/* Pulse indicator */}
            {/* <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
