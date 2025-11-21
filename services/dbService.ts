import { GUN_PEERS, APP_NAMESPACE } from '../constants';
import { Message, User } from '../types';

// @ts-ignore
const Gun = window.Gun;

// Initialize Gun with public peers
const gun = Gun({
  peers: GUN_PEERS,
  localStorage: true // Persist locally too
});

const app = gun.get(APP_NAMESPACE);

// --- User Management ---

export const registerUser = (name: string): User => {
  const id = 'user_' + Math.random().toString(36).substr(2, 9);
  const user: User = {
    id,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    status: 'online',
    joinedAt: Date.now()
  };
  
  // Save user to local storage for persistence across reloads
  localStorage.setItem('reactgram_user', JSON.stringify(user));
  
  // Announce user to the network
  app.get('users').get(id).put(user);
  
  return user;
};

export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('reactgram_user');
  return stored ? JSON.parse(stored) : null;
};

// --- Messaging ---

// Send a message to a specific channel node
export const sendMessage = (chatId: string, user: User, text: string) => {
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const message: Message = {
    id: msgId,
    chatId,
    senderId: user.id,
    senderName: user.name,
    text,
    timestamp: Date.now(),
    status: 'sent'
  };

  // Put message in the graph
  app.get('chats').get(chatId).get('messages').set(message);
  
  // Update last message for the chat list preview
  app.get('chats').get(chatId).get('meta').put({ 
    lastMessage: JSON.stringify(message),
    updatedAt: Date.now()
  });
};

// Subscribe to messages in a chat
// callback is called whenever a new message arrives
export const subscribeToMessages = (chatId: string, callback: (msg: Message) => void) => {
  // We limit to last 50 items to prevent fetching history from beginning of time
  // Note: Gun.js basic queries are simple, for full history complex logic is needed.
  // Here we just subscribe to the set.
  
  const listener = app.get('chats').get(chatId).get('messages').map().on((data: any, id: string) => {
    if (data && data.text) {
        // Gun can sometimes return nulls for deleted nodes
        callback(data as Message);
    }
  });
  
  return () => listener.off();
};

// Subscribe to chat metadata (last message updates)
export const subscribeToChatMeta = (chatId: string, callback: (data: any) => void) => {
   app.get('chats').get(chatId).get('meta').on((data: any) => {
      if(data) callback(data);
   });
};

// Simple Presence (Optional - just lists users who have ever joined)
export const subscribeToUsers = (callback: (user: User) => void) => {
  app.get('users').map().on((data: any) => {
    if (data && data.name) {
      callback(data as User);
    }
  });
};