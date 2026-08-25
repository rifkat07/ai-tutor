'use client';

import React from 'react';
import { ChatMessage } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start animate-in fade-in duration-200`}>
      {/* Аватарка */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
          isUser
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/20'
            : 'bg-emerald-100 text-emerald-700 border-emerald-300'
        }`}
      >
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Бабл сообщения: Синий у ученика, Мягкий зеленый у ИИ */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed border shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
            : 'bg-emerald-50 text-slate-800 border-emerald-200 rounded-tl-none'
        }`}
      >
        <div className="font-normal space-y-1">
          <KaTeXRenderer content={message.text} />
        </div>
        <div
          className={`text-[9px] mt-1.5 flex justify-end font-mono ${
            isUser ? 'text-blue-200' : 'text-emerald-700/60'
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};