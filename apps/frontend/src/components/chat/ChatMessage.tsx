'use client';

import React from 'react';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { Bot, User } from 'lucide-react';
import { ChatMessage as MessageType } from '@/store/useChatStore';

export const ChatMessageComponent: React.FC<{ message: MessageType }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none shadow-md'
        }`}
      >
        <KaTeXRenderer content={message.text} />
        <span className="block text-[10px] text-slate-400 mt-2 text-right" suppressHydrationWarning>
  	  {message.timestamp}
	</span>
      </div>
    </div>
  );
};