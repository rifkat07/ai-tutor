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
  BookOpen,
} from 'lucide-react';
import { useChatStore, SUBJECTS, SubjectType, ExamType } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { activeSubject, setSubject, examType, setExamType } = useChatStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const currentSubject = SUBJECTS[activeSubject];

  const navLinks = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/tutor', label: 'AI-Репетитор', icon: MessageSquare },
    { href: '/dashboard', label: 'Кабинет', icon: LayoutDashboard },
    { href: '/dashboard/graph', label: 'Граф знаний', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
            <Sparkles size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              AI-Tutor <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.0</span>
            </span>
          </div>
        </Link>

        {/* 3 ГЛОБАЛЬНЫХ РАЗДЕЛА: Школьный репетитор | ОГЭ | ЕГЭ */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs shrink-0 gap-1">
          <button
            onClick={() => setExamType('SCHOOL')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              examType === 'SCHOOL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap size={14} /> Школьный репетитор (5–11 кл)
          </button>
          <button
            onClick={() => setExamType('OGE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              examType === 'OGE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ОГЭ (9 кл)
          </button>
          <button
            onClick={() => setExamType('EGE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              examType === 'EGE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ЕГЭ (11 кл)
          </button>
        </div>

        {/* Выбор Предмета */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 transition"
          >
            <span>{currentSubject.icon}</span>
            <span className="hidden md:inline">{currentSubject.name}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              {Object.values(SUBJECTS).map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => {
                    setSubject(subj.id as SubjectType);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition ${
                    activeSubject === subj.id
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{subj.icon}</span>
                  <span>{subj.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Навигационные ссылки */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Профиль */}
        <div className="shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <UserIcon size={14} className="text-blue-400" />
              <span className="font-medium text-slate-200 hidden sm:inline">{user.full_name}</span>
              <button onClick={logout} title="Выйти" className="text-slate-400 hover:text-red-400 ml-1 transition">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};