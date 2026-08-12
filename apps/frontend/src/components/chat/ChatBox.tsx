'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatMessageComponent } from './ChatMessage';
import { ChatWebSocketClient } from '@/lib/websocket';
import { Send, Loader2, Paperclip, X, Image as ImageIcon } from 'lucide-react';

export const ChatBox: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsClientRef = useRef<ChatWebSocketClient | null>(null);

  const {
    messages,
    isStreaming,
    addMessage,
    appendStreamingToken,
    setIsStreaming,
    currentTaskContext,
    currentCompetencyTitle,
    pMastery,
    examType,
    activeSubject,
  } = useChatStore();

  useEffect(() => {
    const ws = new ChatWebSocketClient(
      'session-demo-123',
      (token) => appendStreamingToken(token),
      () => setIsStreaming(false)
    );
    ws.connect();
    wsClientRef.current = ws;

    return () => ws.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = (overrideText?: string, hintType?: 'light' | 'medium' | 'strong') => {
    let textToSend = overrideText || input;
    if ((!textToSend.trim() && !selectedImage) || isStreaming) return;

    // Если это кнопка подсказки — явно добавляем текущую задачу в запрос
    if (hintType) {
      textToSend = `Решаем задачу [${currentCompetencyTitle}]:\n${currentTaskContext}\n\n${overrideText}`;
    }

    const userText = selectedImage
      ? `[Прикреплено фото тетради] ${textToSend}`
      : (overrideText || input);

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(userMsg);
    if (!overrideText) setInput('');
    setIsStreaming(true);

    addMessage({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    wsClientRef.current?.sendMessage({
      message: textToSend,
      image: selectedImage,
      hint_type: hintType,
      subject: activeSubject,
      exam_type: examType,
      competency: currentCompetencyTitle,
      task_context: currentTaskContext,
      p_mastery: pMastery,
      history: messages.map((m) => ({ role: m.sender, content: m.text })),
    });

    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
      <div className="sticky top-0 z-20 shrink-0 p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2 shadow-md">
        <div>
          <h2 className="text-xs font-bold text-white">{currentCompetencyTitle}</h2>
          <p className="text-[10px] text-slate-400">Уровень знания: {Math.round(pMastery * 100)}%</p>
        </div>

        {/* 3 УНИВЕРСАЛЬНЫЕ КНОПКИ ПОДСКАЗОК */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">Подсказка:</span>
          <button
            onClick={() => handleSend('Дай легкую подсказку-намёк по текущему шагу', 'light')}
            className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition font-medium active:scale-95"
          >
            🟢 Легкая
          </button>
          <button
            onClick={() => handleSend('Дай среднюю подсказку с пошаговым планом действия', 'medium')}
            className="text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition font-medium active:scale-95"
          >
            🟡 Средняя
          </button>
          <button
            onClick={() => handleSend('Дай сильную подробную подсказку по текущему шагу', 'strong')}
            className="text-[11px] bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition font-medium active:scale-95"
          >
            🔴 Сильная
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Loader2 size={14} className="animate-spin text-blue-500" /> AI-репетитор размышляет...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="px-4 pt-2 bg-slate-950 flex items-center gap-2 shrink-0">
          <div className="relative border border-blue-500/50 rounded-lg p-1 bg-slate-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-400" />
            <span className="text-xs text-slate-300">Фото тетради прикреплено</span>
            <button onClick={() => setSelectedImage(null)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center shrink-0">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить фото тетради"
          className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Напиши шаг или прикрепи фото тетради..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={isStreaming}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2.5 rounded-lg transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};