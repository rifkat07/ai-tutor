'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, BookOpen, AlertTriangle, GraduationCap, Loader2 } from 'lucide-react';

interface TaskTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TheoryCard {
  title: string;
  content: string;
}

interface TrapItem {
  title: string;
  text: string;
}

export const TaskTheoryModal: React.FC<TaskTheoryModalProps> = ({ isOpen, onClose }) => {
  const { currentCompetencyTitle, activeSubject, currentTaskContext, addMessage } = useChatStore();
  const [activeTab, setActiveTab] = useState<'theory' | 'traps'>('theory');
  const [loading, setLoading] = useState(true);

  const [cards, setCards] = useState<TheoryCard[]>([]);
  const [traps, setTraps] = useState<TrapItem[]>([]);
  const [feynmanQuestion, setFeynmanQuestion] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchTheory = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/competencies/theory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: SUBJECTS[activeSubject]?.name || 'Математика',
            competency_title: currentCompetencyTitle,
            task_context: currentTaskContext,
          }),
        });

        const data = await res.json();
        setCards(data.cards || []);
        setTraps(data.traps || []);
        setFeynmanQuestion(data.feynmanQuestion || 'почему мы применили именно этот метод?');
      } catch (err) {
        console.error('Theory fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheory();
  }, [isOpen, currentTaskContext, activeSubject, currentCompetencyTitle]);

  if (!isOpen) return null;

  const startFeynmanMode = () => {
    onClose();
    addMessage({
      id: Date.now().toString(),
      sender: 'assistant',
      text: `🎓 **Режим «Метод Фейнмана» активирован!**\n\nПредставь, что я твой одноклассник, который вообще не понял эту задачу. Объясни мне в 2–3 предложениях своими словами: **${feynmanQuestion}**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} />
            <div>
              <h2 className="text-base font-bold text-white">{currentCompetencyTitle}</h2>
              <p className="text-xs text-slate-400">Микро-теория и ловушки под текущую задачу</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Табы */}
        <div className="flex gap-2 py-3 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'theory' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <BookOpen size={14} /> 📚 Микро-Шпаргалка
          </button>
          <button
            onClick={() => setActiveTab('traps')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'traps' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <AlertTriangle size={14} /> ⚠️ Ловушки и Ошибки
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12 gap-3 text-slate-400 text-xs">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span>Генерирую уникальную ИИ-теорию под эту задачу...</span>
            </div>
          ) : activeTab === 'theory' ? (
            cards.map((card, index) => (
              <div key={index} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-blue-400">
                  <KaTeXRenderer content={card.title} />
                </h3>
                <div className="text-sm text-slate-200">
                  <KaTeXRenderer content={card.content} />
                </div>
              </div>
            ))
          ) : (
            traps.map((trap, index) => (
              <div key={index} className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> <KaTeXRenderer content={trap.title} />
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed">
                  <KaTeXRenderer content={trap.text} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Нижняя кнопка Метод Фейнмана */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Закрепи материал с ИИ</span>
          <button
            onClick={startFeynmanMode}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            <GraduationCap size={16} /> 🎓 Проверь меня (Метод Фейнмана)
          </button>
        </div>
      </div>
    </div>
  );
};