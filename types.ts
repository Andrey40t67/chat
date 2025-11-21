export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  joinedAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered';
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: 'private' | 'group';
  participants: User[]; 
  unreadCount: number;
  lastMessage?: Message;
}

export interface DBState {
  username: string | null;
}