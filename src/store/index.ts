// Export store and types
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export chat slice actions and thunks
export {
  addUserMessage,
  setLoading,
  setTyping,
  setError,
  clearError,
  setCurrentInput,
  clearMessages,
  updateMessage,
  removeMessage,
  enqueueMessage,
  dequeueMessage,
  clearQueue,
  setConnectionStatus,
  incrementRetryCount,
  resetRetryCount,
  sendMessageToGrok,
  initializeChatSession,
  checkGrokHealth,
  processMessageQueue,
} from './chatSlice';

export type { ChatState } from './chatSlice';
