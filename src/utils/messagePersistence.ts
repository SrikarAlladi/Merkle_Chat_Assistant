import { IMessage } from '../types/chat';

const STORAGE_KEY = 'merkle_chat_messages';
const MAX_STORED_MESSAGES = 100; // Limit stored messages to prevent localStorage bloat

export interface StoredChatData {
  messages: IMessage[];
  lastUpdated: string;
  sessionId?: string;
}

export class MessagePersistence {
  private static instance: MessagePersistence;

  private constructor() {}

  public static getInstance(): MessagePersistence {
    if (!MessagePersistence.instance) {
      MessagePersistence.instance = new MessagePersistence();
    }
    return MessagePersistence.instance;
  }

  // Save messages to localStorage
  public saveMessages(messages: IMessage[], sessionId?: string): void {
    try {
      // Keep only the most recent messages to prevent storage bloat
      const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
      
      const dataToStore: StoredChatData = {
        messages: messagesToStore,
        lastUpdated: new Date().toISOString(),
        sessionId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('Failed to save messages to localStorage:', error);
    }
  }

  // Load messages from localStorage
  public loadMessages(): StoredChatData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: StoredChatData = JSON.parse(stored);
      
      // Check if data is recent (within 7 days)
      const lastUpdated = new Date(data.lastUpdated);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (lastUpdated < sevenDaysAgo) {
        this.clearMessages();
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to load messages from localStorage:', error);
      this.clearMessages(); // Clear corrupted data
      return null;
    }
  }

  // Clear stored messages
  public clearMessages(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear messages from localStorage:', error);
    }
  }

  // Check if localStorage is available
  public isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Get storage usage info
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Rough estimate of localStorage limit (usually 5-10MB)
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Export messages as JSON
  public exportMessages(): string | null {
    const data = this.loadMessages();
    if (!data) return null;

    return JSON.stringify(data, null, 2);
  }

  // Import messages from JSON
  public importMessages(jsonData: string): boolean {
    try {
      const data: StoredChatData = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error('Invalid data structure');
      }

      // Validate message structure
      for (const message of data.messages) {
        if (!message.id || !message.text || !message.sender || !message.timestamp) {
          throw new Error('Invalid message structure');
        }
      }

      this.saveMessages(data.messages, data.sessionId);
      return true;
    } catch (error) {
      console.error('Failed to import messages:', error);
      return false;
    }
  }
}

// Export singleton instance
export const messagePersistence = MessagePersistence.getInstance();
