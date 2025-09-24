import { useCallback, useRef, useState, useEffect } from 'react';
import type React from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for a swipe
  preventDefaultTouchmove?: boolean;
  enabled?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmove = false,
    enabled = true,
  } = options;

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const [isSwping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
  }, [enabled]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!enabled) return;
    
    if (preventDefaultTouchmove && isSwping) {
      // Only prevent default if we're actively swiping
      const touch = event.touches[0];
      const startPos = touchStartRef.current;
      
      if (startPos) {
        const deltaX = Math.abs(touch.clientX - startPos.x);
        const deltaY = Math.abs(touch.clientY - startPos.y);
        
        // If horizontal movement is more significant, prevent default
        if (deltaX > deltaY && deltaX > 10) {
          event.preventDefault();
        }
      }
    }
  }, [enabled, preventDefaultTouchmove, isSwping]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!enabled || !touchStartRef.current) {
      setIsSwiping(false);
      return;
    }

    const touch = event.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const startPos = touchStartRef.current;
    const endPos = touchEndRef.current;

    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const deltaTime = endPos.time - startPos.time;

    // Calculate distance and velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Only consider it a swipe if it meets threshold and isn't too slow
    if (distance >= threshold && deltaTime < 300 && velocity > 0.1) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine swipe direction (prioritize the axis with more movement)
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset
    touchStartRef.current = null;
    touchEndRef.current = null;
    setIsSwiping(false);
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Return event handlers to be attached to elements
  const touchHandlers: React.HTMLAttributes<HTMLDivElement> = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    touchHandlers,
    isSwping,
  } as { touchHandlers: React.HTMLAttributes<HTMLDivElement>; isSwping: boolean };
}

/**
 * Hook specifically for sidebar swipe gestures
 */
export function useSidebarSwipe(
  onOpen: () => void,
  onClose: () => void,
  enabled = true
): { touchHandlers: React.HTMLAttributes<HTMLDivElement>; isSwping: boolean } {
  const { touchHandlers, isSwping } = useSwipeGesture({
    onSwipeRight: onOpen,
    onSwipeLeft: onClose,
    threshold: 75, // Slightly higher threshold for sidebar
    preventDefaultTouchmove: true,
    enabled,
  });

  return {
    touchHandlers,
    isSwping,
  };
}
