export interface IMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string; // ISO string for Redux serialization
  isLoading?: boolean;
}