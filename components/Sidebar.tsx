import React, { useState } from 'react';
import { Menu, Search, Users } from 'lucide-react';
import { Chat, User } from '../types';

// Simple time formatter
const formatTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUser: User;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onSelectChat, currentUser, className }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full bg-tg-secondary border-r border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3 sticky top-0 bg-tg-secondary z-10">
        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition">
          <Menu size={24} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-tg-accent transition"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        </div>
      </div>

      {/* Current User Badge */}
      <div className="px-4 py-2 bg-slate-800/50 flex items-center gap-3 border-b border-slate-700">
         <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full" />
         <div className="flex-1">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
         </div>
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-white/5 ${
              activeChatId === chat.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
            }`}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover bg-slate-700"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-white font-medium truncate">{chat.name}</h3>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatTime(chat.lastMessage?.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-400 truncate pr-2">
                   {chat.lastMessage ? (
                     <>
                        <span className="text-tg-accent mr-1">{chat.lastMessage.senderName}:</span>
                        {chat.lastMessage.text}
                     </>
                   ) : (
                     <span className="italic opacity-50">No messages yet</span>
                   )}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="p-4 text-center">
            <p className="text-xs text-gray-500">
                Global channels. Messages sync with everyone online.
            </p>
        </div>
      </div>
    </div>
  );
};