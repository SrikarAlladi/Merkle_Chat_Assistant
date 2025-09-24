import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IMessage } from '../types/chat';
import { grokService, GrokMessage } from '../services/grokService';

// Extended interface for Redux state
export interface ChatState {
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
  currentInput: string;
  isTyping: boolean;
  sessionId: string | null;
  messageQueue: string[]; // Queue for handling rapid user inputs
  isProcessingQueue: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  retryCount: number;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentInput: '',
  isTyping: false,
  sessionId: null,
  messageQueue: [],
  isProcessingQueue: false,
  connectionStatus: 'connected',
  retryCount: 0,
};

// Async thunk for sending message to Grok API
export const sendMessageToGrok = createAsyncThunk(
  'chat/sendMessageToGrok',
  async (message: string, { getState, rejectWithValue }) => {
    console.log('🚀 sendMessageToGrok called for message:', message);
    try {
      const state = getState() as { chat: ChatState };
      
      // Convert chat history to Grok format (last 10 messages for context)
      const conversationHistory: GrokMessage[] = state.chat.messages
        .slice(-10) // Keep last 10 messages for context
        .filter(msg => !msg.isLoading) // Exclude loading messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Send message to Grok API
      const responseText = await grokService.sendMessage(message, conversationHistory);
      
      // Create response message
      const response: IMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: responseText,
        sender: 'assistant' as const,
        timestamp: new Date().toISOString(),
      };

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message to Grok API';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for initializing chat session
export const initializeChatSession = createAsyncThunk(
  'chat/initializeChatSession',
  async (_, { rejectWithValue }) => {
    try {
      // Check Grok service health
      const isHealthy = await grokService.healthCheck();
      
      if (!isHealthy) {
        console.warn('Grok service health check failed, using mock responses');
      }
      
      const sessionId = 'session_' + Date.now().toString();
      return { sessionId, isHealthy };
    } catch (error) {
      return rejectWithValue('Failed to initialize chat session');
    }
  }
);

// Async thunk for checking Grok service health
export const checkGrokHealth = createAsyncThunk(
  'chat/checkGrokHealth',
  async (_, { rejectWithValue }) => {
    try {
      const isHealthy = await grokService.healthCheck();
      return isHealthy;
    } catch (error) {
      return rejectWithValue('Health check failed');
    }
  }
);

// Async thunk for processing message queue
export const processMessageQueue = createAsyncThunk(
  'chat/processMessageQueue',
  async (_, { getState, dispatch }) => {
    const state = getState() as { chat: ChatState };
    
    console.log('processMessageQueue called', {
      queueLength: state.chat.messageQueue.length,
      queue: state.chat.messageQueue
    });
    
    if (state.chat.messageQueue.length === 0) {
      console.log('Queue is empty - nothing to process');
      return;
    }

    const nextMessage = state.chat.messageQueue[0];
    console.log('Processing message from queue:', nextMessage);
    
    // Remove message from queue and process it
    dispatch(dequeueMessage());
    
    try {
      const result = await dispatch(sendMessageToGrok(nextMessage));
      console.log('Message processed successfully:', result);
      
      // Process next message in queue if any
      const updatedState = getState() as { chat: ChatState };
      if (updatedState.chat.messageQueue.length > 0) {
        console.log('Processing next message in queue after delay');
        setTimeout(() => dispatch(processMessageQueue()), 500);
      } else {
        console.log('Queue is now empty');
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add user message immediately
    addUserMessage: (state, action: PayloadAction<string>) => {
      const userMessage: IMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: action.payload,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMessage);
      state.currentInput = '';
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set typing indicator
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isTyping = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update current input
    setCurrentInput: (state, action: PayloadAction<string>) => {
      state.currentInput = action.payload;
    },

    // Clear all messages
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
      state.isTyping = false;
    },

    // Update specific message (for editing/updating)
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<IMessage> }>) => {
      const { id, updates } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
    },

    // Remove message
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },

    // Queue management
    enqueueMessage: (state, action: PayloadAction<string>) => {
      state.messageQueue.push(action.payload);
    },

    dequeueMessage: (state) => {
      state.messageQueue.shift();
    },

    clearQueue: (state) => {
      state.messageQueue = [];
      state.isProcessingQueue = false;
    },

    // Connection status management
    setConnectionStatus: (state, action: PayloadAction<'connected' | 'disconnected' | 'reconnecting'>) => {
      state.connectionStatus = action.payload;
      if (action.payload === 'connected') {
        state.retryCount = 0;
      }
    },

    incrementRetryCount: (state) => {
      state.retryCount += 1;
    },

    resetRetryCount: (state) => {
      state.retryCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Handle sendMessageToGrok async thunk
    builder
      .addCase(sendMessageToGrok.pending, (state) => {
        console.log('📝 sendMessageToGrok.pending - Setting loading state');
        state.isLoading = true;
        state.isTyping = true;
        state.error = null;
        // Don't add loading messages - use global TypingIndicator instead
      })
      .addCase(sendMessageToGrok.fulfilled, (state, action) => {
        console.log('✅ sendMessageToGrok.fulfilled - Adding AI response');
        state.isLoading = false;
        state.isTyping = false;
        state.error = null;
        
        // Just add the response - no loading message to remove
        state.messages.push(action.payload);
      })
      .addCase(sendMessageToGrok.rejected, (state, action) => {
        console.log('❌ sendMessageToGrok.rejected - Error occurred');
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.payload as string;
        
        // No loading message to remove
      });

    // Handle initializeChatSession async thunk
    builder
      .addCase(initializeChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeChatSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.sessionId;
        state.error = null;
      })
      .addCase(initializeChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Handle checkGrokHealth async thunk
    builder
      .addCase(checkGrokHealth.fulfilled, (state, action) => {
        // Health check result can be used for UI indicators
        if (!action.payload) {
          console.warn('Grok API is not available, using mock responses');
        }
      })
      .addCase(checkGrokHealth.rejected, (state, action) => {
        console.error('Grok health check failed:', action.payload);
      });

    // Handle processMessageQueue async thunk
    builder
      .addCase(processMessageQueue.pending, (state) => {
        state.isProcessingQueue = true;
        console.log('Queue processing started');
      })
      .addCase(processMessageQueue.fulfilled, (state) => {
        state.isProcessingQueue = false;
        console.log('Queue processing completed');
      })
      .addCase(processMessageQueue.rejected, (state) => {
        state.isProcessingQueue = false;
        console.log('Queue processing failed');
      });
  },
});

// Export actions
export const {
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
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
