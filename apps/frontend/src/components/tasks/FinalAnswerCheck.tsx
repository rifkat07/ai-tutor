'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { CheckCircle2, XCircle, Sparkles, Trophy, Loader2 } from 'lucide-react';

const genId = (prefix: string = 'msg') => `${Date.now()}-${prefix}-${Math.random().toString(36).substring(2, 7)}`;

export const FinalAnswerCheck: React.FC = () => {
  const [answerInput, setAnswerInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const {
    currentTaskContext,
    currentCompetencyTitle,
    addMessage,
    incrementMicroWin,
    addMistake,
    resolveMistakeByContext,
  } = useChatStore();

  const handleCheckAnswer = async () => {
    if (!answerInput.trim() || loading) return;

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/competencies/verify-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_context: currentTaskContext,
          student_answer: answerInput,
        }),
      });

      const data = await res.json();

      if (data.is_correct) {
        setStatus('success');
        incrementMicroWin();
        resolveMistakeByContext(currentTaskContext);

        addMessage({
          id: genId('chk-ok'),
          sender: 'assistant',
          text: `🎉 **ПОЗДРАВЛЯЮ! Итоговый ответ «${answerInput}» ВЕРЕН!**\n\n✅ Навык по теме успешно подтвержден и перенесен в **«Закрытые пробелы»**! Нажми «Похожая», чтобы закрепить результат!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        setStatus('error');
        addMistake(currentTaskContext, currentCompetencyTitle);

        addMessage({
          id: genId('chk-err'),
          sender: 'assistant',
          text: `🤔 Твой ответ **«${answerInput}»** не сошелся.\n\n💡 Задача занесена в твой **«Банк Ошибок»** для закрепления!\n\nНажми кнопку **🟡 Средняя подсказка** выше, и мы пошагово разберем решение!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err) {
      console.error('Answer verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/90 p-3.5 rounded-2xl space-y-2.5 mt-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-500" /> Проверка итогового ответа:
        </span>
        {status === 'success' && (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle2 size={12} className="text-emerald-600" /> ВЕРНО! • ПРОБЕЛ ЗАКРЫТ
          </span>
        )}
        {status === 'error' && (
          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <XCircle size={12} className="text-rose-600" /> ОШИБКА • В БАНКЕ ОШИБОК
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={answerInput}
          onChange={(e) => {
            setAnswerInput(e.target.value);
            setStatus('idle');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
          placeholder="Введи твой итоговый ответ (например: 1610 или x = 2)..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-xs"
        />
        <button
          onClick={handleCheckAnswer}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Проверить
        </button>
      </div>
    </div>
  );
};