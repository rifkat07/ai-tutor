'use client';

import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { GraduationCap, Glasses, Crown, Wand2, BookOpen, Sparkles } from 'lucide-react';

interface MascotProps {
  state?: 'idle' | 'thinking' | 'success' | 'explaining';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const TutorMascot: React.FC<MascotProps> = ({ state = 'idle', size = 'sm', onClick }) => {
  const { equippedHat, equippedAccessory, equippedAura } = useChatStore();

  const dimensions = size === 'lg' ? 'w-20 h-20' : size === 'md' ? 'w-14 h-14' : 'w-10 h-10';
  const eyeSize = size === 'lg' ? 'w-3.5 h-5' : size === 'md' ? 'w-2.5 h-3.5' : 'w-1.5 h-2.5';

  // 1. Динамический цвет ауры вокруг персонажа
  const getAuraClass = () => {
    if (state === 'thinking') return 'bg-amber-500/30 animate-ping';
    if (state === 'success') return 'bg-emerald-500/50 animate-bounce';
    if (equippedAura === 'gold') return 'bg-amber-400/30 animate-pulse';
    if (equippedAura === 'cyberpunk') return 'bg-fuchsia-500/30 animate-pulse';
    return 'bg-emerald-500/20 animate-pulse';
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${dimensions} flex items-center justify-center shrink-0 cursor-pointer group select-none`}
      title="🎭 Нажми, чтобы открыть гардероб и магазин наград"
    >
      {/* Пульсирующий ореол */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${getAuraClass()}`} />

      {/* Корпус лица Робота-Наставника */}
      <div
        className={`relative ${dimensions} rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 shadow-md group-hover:scale-105 ${
          state === 'thinking'
            ? 'bg-slate-900 border-amber-500 text-amber-400 shadow-amber-500/20'
            : state === 'success'
            ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-emerald-500/30 scale-105'
            : equippedAura === 'gold'
            ? 'bg-slate-900 border-amber-400/70 text-amber-300 shadow-amber-400/10'
            : equippedAura === 'cyberpunk'
            ? 'bg-slate-900 border-fuchsia-500/70 text-fuchsia-300 shadow-fuchsia-500/20'
            : 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
        }`}
      >
        {/* Антенна робота */}
        <div className="absolute -top-1.5 w-1 h-1.5 bg-slate-700 rounded-t-full flex items-center justify-center">
          <span
            className={`w-1.5 h-1.5 rounded-full absolute -top-1 ${
              state === 'thinking' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
        </div>

        {/* 🎭 ЖИВАЯ МИМИКА ЛИЦА */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {/* Левый глаз */}
          {state === 'thinking' ? (
            <div className={`${eyeSize} bg-amber-400 rounded-full animate-pulse`} />
          ) : state === 'success' ? (
            <div className="text-emerald-400 font-bold text-xs leading-none">^</div>
          ) : (
            <div className={`${eyeSize} bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400`} />
          )}

          {/* Правый глаз */}
          {state === 'thinking' ? (
            <div className={`${eyeSize} bg-amber-400 rounded-full animate-pulse`} />
          ) : state === 'success' ? (
            <div className="text-emerald-400 font-bold text-xs leading-none">^</div>
          ) : (
            <div className={`${eyeSize} bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400`} />
          )}
        </div>

        {/* Рот / Речевой индикатор */}
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {state === 'thinking' ? (
            <div className="w-2.5 h-0.5 bg-amber-400/80 rounded-full animate-pulse" />
          ) : state === 'success' ? (
            <div className="w-3 h-1 bg-emerald-400 rounded-b-full shadow-sm" />
          ) : state === 'explaining' ? (
            <div className="flex gap-0.5 items-center">
              <span className="w-0.5 h-1 bg-emerald-400 animate-bounce" />
              <span className="w-0.5 h-2 bg-emerald-400 animate-bounce delay-75" />
              <span className="w-0.5 h-1 bg-emerald-400 animate-bounce delay-150" />
            </div>
          ) : (
            <div className="w-2 h-0.5 bg-emerald-400/60 rounded-full" />
          )}
        </div>

        {/* 🎓 2. НАДЕТЫЙ ГОЛОВНОЙ УБОР */}
        {equippedHat === 'mortarboard' && (
          <span className="absolute -top-2.5 -left-1 text-amber-400 drop-shadow-md pointer-events-none">
            <GraduationCap size={size === 'lg' ? 26 : 15} />
          </span>
        )}
        {equippedHat === 'glasses' && (
          <span className="absolute top-1.5 text-indigo-300 drop-shadow-md pointer-events-none">
            <Glasses size={size === 'lg' ? 24 : 14} />
          </span>
        )}
        {equippedHat === 'crown' && (
          <span className="absolute -top-3 text-amber-400 drop-shadow-md pointer-events-none">
            <Crown size={size === 'lg' ? 26 : 15} />
          </span>
        )}

        {/* 🪄 3. НАДЕТЫЙ АКСЕССУАР */}
        {equippedAccessory === 'pointer' && (
          <span className="absolute -bottom-1 -right-1 text-indigo-400 drop-shadow pointer-events-none">
            <Wand2 size={size === 'lg' ? 20 : 12} />
          </span>
        )}
        {equippedAccessory === 'book' && (
          <span className="absolute -bottom-1 -left-1 text-emerald-400 drop-shadow pointer-events-none">
            <BookOpen size={size === 'lg' ? 20 : 12} />
          </span>
        )}

        {/* Искорки */}
        <span className="absolute -top-1 -right-1 text-indigo-400 animate-pulse pointer-events-none">
          <Sparkles size={10} />
        </span>
      </div>
    </div>
  );
};