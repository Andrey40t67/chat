import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, Phone, Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Message, Chat, User } from '../types';
import { WALLPAPER_PATTERN } from '../constants';

interface ChatWindowProps {
  chatId: string;
  activeChat: Chat;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  currentUser: User;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  activeChat, 
  messages, 
  onSendMessage, 
  onBack,
  currentUser
}) => {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom only on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessages = () => {
    let lastDate = '';
    return messages.map((msg) => {
      const dateObj = new Date(msg.timestamp);
      const dateStr = dateObj.toLocaleDateString();
      const showDate = dateStr !== lastDate;
      lastDate = dateStr;
      const isMe = msg.senderId === currentUser.id;

      return (
        <React.Fragment key={msg.id}>
          {showDate && (
            <div className="flex justify-center my-4">
              <span className="bg-slate-800/50 text-gray-300 text-xs py-1 px-3 rounded-full backdrop-blur-sm border border-slate-700">
                {dateStr}
              </span>
            </div>
          )}
          <div className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar for other people */}
            {!isMe && (
                <div className="mr-2 flex-shrink-0 self-end">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=random&size=32`} 
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full"
                    />
                </div>
            )}
            
            <div 
              className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 relative shadow-sm ${
                isMe 
                  ? 'bg-tg-outgoing text-white rounded-br-none' 
                  : 'bg-tg-incoming text-gray-100 rounded-bl-none'
              }`}
            >
              {!isMe && (
                  <p className="text-[11px] font-bold text-tg-accent mb-0.5">{msg.senderName}</p>
              )}
              <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{msg.text}</p>
              <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-blue-200 justify-end' : 'text-gray-400 justify-end'}`}>
                 <span>{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 {isMe && <span>✓</span>}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-tg-bg relative">
      {/* Wallpaper Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
         <div dangerouslySetInnerHTML={{ __html: WALLPAPER_PATTERN }} className="text-white w-full h-full" />
      </div>

      {/* Header */}
      <div className="bg-tg-secondary p-2 px-4 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-300 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full bg-slate-700" />
          <div className="flex flex-col">
            <h2 className="font-semibold text-white leading-tight">{activeChat.name}</h2>
            <span className="text-xs text-tg-muted">
              {messages.length} messages
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
           <MoreVertical size={20} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 z-0">
         {messages.length === 0 && (
             <div className="h-full flex items-center justify-center opacity-50">
                 <div className="text-center">
                     <p className="text-sm">No messages here yet.</p>
                     <p className="text-xs">Say hello to the world!</p>
                 </div>
             </div>
         )}
         {renderMessages()}
         <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-tg-secondary z-10 shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button className="p-3 text-gray-400 hover:text-white transition hidden md:block">
             <Paperclip size={22} />
          </button>
          
          <div className="flex-1 bg-slate-900 rounded-2xl flex items-center px-4 py-1 border border-slate-700 focus-within:border-tg-accent transition">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              className="w-full bg-transparent text-white border-none outline-none resize-none py-3 max-h-32 custom-scrollbar placeholder-gray-500"
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button className="ml-2 text-gray-400 hover:text-yellow-400 transition hidden sm:block">
              <Smile size={22} />
            </button>
          </div>

          {inputValue.trim() ? (
             <button 
              onClick={handleSend}
              className="p-3 bg-tg-accent text-white rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
            >
              <Send size={20} />
            </button>
          ) : (
            <button className="p-3 bg-slate-700 text-white rounded-full hover:bg-slate-600 transition">
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};