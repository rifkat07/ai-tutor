'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Network,
  Home,
  ChevronDown,
  User as UserIcon,
  LogOut,
  GraduationCap,
  Zap,
  Calendar,
} from 'lucide-react';
import { useChatStore, SUBJECTS, SubjectType } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { DiagnosticTestModal } from '@/components/diagnostic/DiagnosticTestModal';
import { ExamCountdownModal, getDynamicExamCountdown } from '@/components/countdown/ExamCountdownModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDiagOpen, setIsDiagOpen] = useState(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);

  const { activeSubject, setSubject, examType, setExamType, selectedGrade, pMastery } = useChatStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const currentSubject = SUBJECTS[activeSubject] || SUBJECTS.math;

  // 100% ДИНАМИЧЕСКИЙ РАСЧЕТ ИНДИКАТОРА ДЕДЛАЙНА
  const countdownInfo = getDynamicExamCountdown(examType, selectedGrade || 5, pMastery);
  
  const getBadgeShortText = () => {
    if (examType === 'EGE') return `⏳ До ЕГЭ: ${countdownInfo.daysLeft} дн • ${countdownInfo.recommendedPace}`;
    if (examType === 'OGE') return `⏳ До ОГЭ: ${countdownInfo.daysLeft} дн • ${countdownInfo.recommendedPace}`;
    return `⏳ До ВПР: ${countdownInfo.daysLeft} дн • ${selectedGrade} кл`;
  };

  const navLinks = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/tutor', label: 'AI-Репетитор', icon: MessageSquare },
    { href: '/dashboard', label: 'Кабинет', icon: LayoutDashboard },
    { href: '/dashboard/graph', label: 'Граф знаний', icon: Network },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                AI-Tutor <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">v2.0</span>
              </span>
            </div>
          </Link>

          {/* 3 ГЛОБАЛЬНЫХ РАЗДЕЛА */}
          <div className="flex bg-slate-100 border border-slate-200/90 p-1 rounded-xl text-xs shrink-0 gap-1 shadow-inner">
            <button
              onClick={() => setExamType('SCHOOL')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                examType === 'SCHOOL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap size={14} /> Школа (5–11 кл)
            </button>
            <button
              onClick={() => setExamType('OGE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                examType === 'OGE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ОГЭ (9 кл)
            </button>
            <button
              onClick={() => setExamType('EGE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                examType === 'EGE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ЕГЭ (11 кл)
            </button>
          </div>

          {/* ДИНАМИЧЕСКИЙ БЕЙДЖ ОБРАТНОГО ОТСЧЕТА */}
          <button
            onClick={() => setIsCountdownOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-bold transition shadow-sm active:scale-95 shrink-0"
            title="Нажмите для просмотра индивидуального графика подготовки"
          >
            <Calendar size={13} className="text-amber-600" />
            <span>{getBadgeShortText()}</span>
          </button>

          {/* КНОПКА ЗАПУСКА ДИАГНОСТИКИ */}
          <button
            onClick={() => setIsDiagOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl transition font-bold shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Zap size={14} className="fill-white" /> Диагностика IRT
          </button>

          {/* Выбор Предмета */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 shadow-sm transition"
            >
              <span>{currentSubject.icon}</span>
              <span className="hidden md:inline">{currentSubject.name}</span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150">
                {Object.values(SUBJECTS).map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => {
                      setSubject(subj.id as SubjectType);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition ${
                      activeSubject === subj.id
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{subj.icon}</span>
                    <span>{subj.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Навигация */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Профиль / Вход */}
          <div className="shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-sm">
                <UserIcon size={14} className="text-blue-600" />
                <span className="font-bold text-slate-800 hidden sm:inline">{user.full_name}</span>
                <button onClick={logout} title="Выйти" className="text-slate-400 hover:text-red-600 ml-1 transition">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20"
              >
                Войти
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Модальные окна */}
      <DiagnosticTestModal isOpen={isDiagOpen} onClose={() => setIsDiagOpen(false)} />
      <ExamCountdownModal isOpen={isCountdownOpen} onClose={() => setIsCountdownOpen(false)} />
    </>
  );
};