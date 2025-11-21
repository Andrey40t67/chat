import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { registerUser, getStoredUser, subscribeToMessages, sendMessage, subscribeToChatMeta } from './services/dbService';
import { Chat, Message, User } from './types';
import { DEFAULT_CHANNELS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState(''); // Login input
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(DEFAULT_CHANNELS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);

  // --- Initialization & Login ---
  useEffect(() => {
    const existingUser = getStoredUser();
    if (existingUser) {
      setUser(existingUser);
    }

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newUser = registerUser(inputValue.trim());
    setUser(newUser);
  };

  // --- Real-time Chat List Updates ---
  useEffect(() => {
    if (!user) return;

    // Subscribe to metadata for all default channels to show "Last Message"
    DEFAULT_CHANNELS.forEach(channel => {
      subscribeToChatMeta(channel.id, (meta) => {
        if (meta && meta.lastMessage) {
          try {
             const lastMsg = JSON.parse(meta.lastMessage);
             setChats(prev => prev.map(c => {
               if (c.id === channel.id) {
                 return { ...c, lastMessage: lastMsg };
               }
               return c;
             }));
          } catch (e) {
            // ignore parse error
          }
        }
      });
    });
  }, [user]);

  // --- Real-time Message Subscription ---
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    setMessages([]); // Clear previous messages locally before loading new
    const seenIds = new Set<string>();

    const unsubscribe = subscribeToMessages(activeChatId, (msg) => {
      if (seenIds.has(msg.id)) return;
      seenIds.add(msg.id);

      setMessages(prev => {
        // Insert and sort
        const newArr = [...prev, msg];
        return newArr.sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    return () => {
      // Gun doesn't have a simple "off" for maps sometimes, but our wrapper helps
      // Cleanup handled in dbService logic wrapper if fully implemented, 
      // simple return function calls off()
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeChatId]);

  const handleSendMessage = (text: string) => {
    if (!activeChatId || !user) return;
    sendMessage(activeChatId, user, text);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-tg-bg text-white">
        <div className="w-full max-w-md p-8 bg-tg-secondary rounded-2xl shadow-2xl mx-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">ReactGram</h1>
            <p className="text-tg-muted">Enter your name to start chatting with real people.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Your Display Name"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-slate-500"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition transform active:scale-95 shadow-lg"
            >
              Start Messaging
            </button>
          </form>
          <p className="mt-6 text-xs text-center text-slate-500">
            Powered by Gun.js Decentralized Graph Database
          </p>
        </div>
      </div>
    );
  }

  // --- Main App UI ---
  return (
    <div className="flex h-screen w-screen bg-tg-bg overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobileView ? (activeChatId ? 'hidden' : 'w-full') : 'w-80 md:w-96 shrink-0'} 
        h-full border-r border-slate-700 transition-all duration-300
      `}>
        <Sidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={setActiveChatId}
          currentUser={user}
        />
      </div>

      {/* Chat Window */}
      <div className={`
        flex-1 h-full relative
        ${isMobileView ? (!activeChatId ? 'hidden' : 'w-full') : 'block'}
      `}>
        {activeChatId && activeChat ? (
          <ChatWindow 
            chatId={activeChatId}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChatId(null)}
            currentUser={user}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
             <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
               <span className="text-4xl">💬</span>
             </div>
             <h3 className="text-xl font-medium text-gray-300">Select a Global Channel</h3>
             <p className="text-sm mt-2 text-center max-w-md text-slate-500">
               Join one of the public channels to chat with other users currently on the site.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;