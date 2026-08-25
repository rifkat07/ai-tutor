'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';

interface RecommendationData {
  primary_recommendation: {
    node_id: string;
    title: string;
    grade: number;
    potential_score_gain: number;
    score_gain_label?: string;
    current_mastery_percent: number;
    bottleneck_reason: string;
    recommended_task: string;
  } | null;
}

// Вспомогательная функция правильного русского склонения слова "балл"
function formatPointsLabel(gain: number): string {
  const absN = Math.abs(gain) % 100;
  const lastDigit = absN % 10;

  let word = 'баллов';
  if (absN >= 11 && absN <= 19) {
    word = 'баллов';
  } else if (lastDigit === 1) {
    word = 'балл';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    word = 'балла';
  }

  return `+${gain} ${word} к прогнозу!`;
}

export const NextActionWidget: React.FC = () => {
  const {
    activeSubject,
    selectedGrade,
    pMastery,
    mistakesBank,
    setTaskContext,
    addMessage,
  } = useChatStore();

  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(
          `${apiBase}/api/v1/competencies/recommendations?subject=${activeSubject}&grade=${selectedGrade}&mastery=${pMastery}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Recommendation fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [activeSubject, selectedGrade, pMastery, mistakesBank.length]);

  if (!data?.primary_recommendation) return null;

  const rec = data.primary_recommendation;
  const scoreLabel =
    rec.score_gain_label || formatPointsLabel(rec.potential_score_gain);

  const handleStartRecommendedLesson = () => {
    setTaskContext(
      rec.recommended_task,
      `🎯 Персональный трек: ${rec.title}`,
      rec.current_mastery_percent / 100
    );

    addMessage({
      id: Date.now().toString(),
      sender: 'assistant',
      text: `🎯 **Запущен рекомендованный мини-урок:**\n\nТема: *«${rec.title}»*\nПотенциальный прирост: **${scoreLabel}**\n\nДавай сделаем первый шаг к ликвидации этого пробела!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
      {/* Декоративный мягкий свет */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 100% РУССКОЯЗЫЧНАЯ ПЛАШКА */}
            <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Zap size={12} className="text-amber-500" /> Рекомендация ИИ • Следующий шаг
            </span>

            {/* ПРАВИЛЬНОЕ СКЛОНЕНИЕ БАЛЛОВ */}
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <TrendingUp size={12} className="text-emerald-600" /> {scoreLabel}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {rec.title}
          </h3>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            💡 {rec.bottleneck_reason} (Освоено: {rec.current_mastery_percent}%)
          </p>
        </div>

        {/* Кнопка мгновенного старта */}
        <button
          onClick={handleStartRecommendedLesson}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <Sparkles size={14} /> Подтянуть тему <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};