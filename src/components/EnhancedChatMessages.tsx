import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppSelector } from '../store';
import SimpleMarkdownMessage from './SimpleMarkdownMessage';
import TypingIndicator from './TypingIndicator';

const EnhancedChatMessages: React.FC = () => {
  const messages = useAppSelector((state) => state.chat.messages);
  const isTyping = useAppSelector((state) => state.chat.isTyping);
  const isLoading = useAppSelector((state) => state.chat.isLoading);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false); 
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced auto-scroll logic
  const scrollToBottom = useCallback((force = false) => {
    if (!messagesEndRef.current || (!force && isUserScrolling)) return;

    messagesEndRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [isUserScrolling]);

  // Check if user is near bottom of chat
  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom

    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const nearBottom = isNearBottom(); 

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set user scrolling flag
    setIsUserScrolling(!nearBottom);

    // Reset user scrolling flag after a delay
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  }, [isNearBottom]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Only auto-scroll for user messages or when user is near bottom
      if (lastMessage.sender === 'user' || (!isUserScrolling && isNearBottom())) {
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  }, [messages, scrollToBottom, isUserScrolling, isNearBottom]);

  // Auto-scroll when typing indicator appears (only if near bottom)
  useEffect(() => {
    if ((isTyping || isLoading) && (!isUserScrolling || isNearBottom())) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isTyping, isLoading, scrollToBottom, isUserScrolling, isNearBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
 
  return (
    <div className="relative bg-[#FFFFFF] px-[10px] rounded-[10px] flex flex-col overflow-y-scroll flex-grow" ref={messagesContainerRef}
      onScroll={handleScroll}>
      {messages.map((message, index) => (
        <div key={message.id} className="px-6">
          <SimpleMarkdownMessage message={message} />

          {/* Add spacing between different senders */}
          {index < messages.length - 1 &&
            messages[index].sender !== messages[index + 1].sender && (
              <div className="h-2" />
            )}
        </div>
      ))}

      {/* Typing indicator */}
      <TypingIndicator />

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default EnhancedChatMessages;
