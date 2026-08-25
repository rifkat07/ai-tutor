'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  BookOpen,
  AlertTriangle,
  FileText,
  Printer,
  FileSpreadsheet,
  Clock,
  Sparkles,
  GraduationCap,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  REFERENCE_DATA,
  SQUARE_TABLE,
  POWERS_OF_TWO,
} from './referenceData';

export type KnowledgeTab = 'theory' | 'cheatsheet' | 'reference' | 'tactics';

interface KnowledgeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: KnowledgeTab;
}

interface TheoryCard {
  title: string;
  content: string;
}

interface TrapItem {
  title: string;
  text: string;
}

interface CheatsheetData {
  formulas: string[];
  note: string;
  steps: { step: string; title: string; desc: string }[];
  traps: string[];
}

export const KnowledgeHubModal: React.FC<KnowledgeHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'theory',
}) => {
  const {
    currentCompetencyTitle,
    activeSubject,
    currentTaskContext,
    selectedGrade,
    examType,
    addMessage,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<KnowledgeTab>(initialTab);

  // Состояния теории
  const [theorySubTab, setTheorySubTab] = useState<'cards' | 'traps'>('cards');
  const [theoryLoading, setTheoryLoading] = useState(true);
  const [theoryCards, setTheoryCards] = useState<TheoryCard[]>([]);
  const [theoryTraps, setTheoryTraps] = useState<TrapItem[]>([]);
  const [feynmanQuestion, setFeynmanQuestion] = useState<string>('');

  // Состояния конспекта
  const [cheatsheetLoading, setCheatsheetLoading] = useState(true);
  const [cheatsheet, setSheet] = useState<CheatsheetData | null>(null);

  // Состояния справочника
  const [refSubject, setRefSubject] = useState<string>(activeSubject || 'math');
  const [refGradeFilter, setRefGradeFilter] = useState<string>(
    selectedGrade ? String(selectedGrade) : 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Загрузка теории
  useEffect(() => {
    if (!isOpen || activeTab !== 'theory') return;

    const fetchTheory = async () => {
      setTheoryLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/competencies/theory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: currentSubj.name,
            competency_title: currentCompetencyTitle,
            task_context: currentTaskContext,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTheoryCards(data.cards || []);
          setTheoryTraps(data.traps || []);
          setFeynmanQuestion(
            data.feynmanQuestion || 'почему мы применили именно этот метод?'
          );
        }
      } catch (err) {
        console.error('Theory fetch error:', err);
      } finally {
        setTheoryLoading(false);
      }
    };

    fetchTheory();
  }, [
    isOpen,
    activeTab,
    currentTaskContext,
    activeSubject,
    currentCompetencyTitle,
    currentSubj.name,
  ]);

  // Загрузка конспекта А4
  useEffect(() => {
    if (!isOpen || activeTab !== 'cheatsheet') return;

    const fetchCheatsheet = async () => {
      setCheatsheetLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/competencies/cheatsheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: currentSubj.name,
            grade: selectedGrade || 5,
            exam_type: examType,
            task_context: currentTaskContext,
            competency_title: currentCompetencyTitle,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setSheet(json);
        }
      } catch (err) {
        console.error('Cheatsheet fetch error:', err);
      } finally {
        setCheatsheetLoading(false);
      }
    };

    fetchCheatsheet();
  }, [
    isOpen,
    activeTab,
    currentTaskContext,
    currentCompetencyTitle,
    activeSubject,
    selectedGrade,
    examType,
    currentSubj.name,
  ]);

  const startFeynmanMode = () => {
    onClose();
    addMessage({
      id: Date.now().toString(),
      sender: 'assistant',
      text: `🎓 **Режим «Метод Фейнмана» активирован!**\n\nПредставь, что я твой одноклассник, который не понял эту задачу. Объясни мне в 2–3 предложениях своими словами: **${feynmanQuestion}**`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const matchesSearch = (keywords: string) => {
    if (!searchQuery.trim()) return true;
    return keywords.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const matchesGrade = (targetGrades: number[]) => {
    if (refGradeFilter === 'all') return true;
    const g = parseInt(refGradeFilter, 10);
    return targetGrades.includes(g);
  };

  const currentRefItems = (REFERENCE_DATA[refSubject] || []).filter(
    (item) => matchesGrade(item.grades) && matchesSearch(item.keywords)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-5xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden text-slate-900">
        
        {/* ШАПКА ХАБА */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl shadow-inner">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Центр Знаний и Материалов
                </h2>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                  {currentSubj.name} • {selectedGrade} класс
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Теория, ловушки, печатные конспекты А4 и официальные справочники КИМ ФИПИ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'cheatsheet' && (
              <button
                onClick={handlePrint}
                disabled={cheatsheetLoading || !cheatsheet}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-600/20 active:scale-95"
              >
                <Printer size={15} /> Распечатать / В PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 ГЛАВНЫХ ВКЛАДКИ ЦЕНТРА ЗНАНИЙ */}
        <div className="flex gap-2 py-3 border-b border-slate-200 shrink-0 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'theory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={14} /> 💡 Теория & Ловушки
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer size={14} /> 📄 Конспект А4 (Печать)
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reference'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={14} /> 📐 Справочник КИМ (Энциклопедия)
          </button>
          <button
            onClick={() => setActiveTab('tactics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tactics'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={14} /> ⏱️ Тактика Экзамена
          </button>
        </div>

        {/* ПРОКРУЧИВАЕМЫЙ КОНТЕНТ */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 print:p-0 print:m-0 print:overflow-visible">
          
          {/* 1. ВКЛАДКА: ТЕОРИЯ & ЛОВУШКИ */}
          {activeTab === 'theory' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTheorySubTab('cards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    theorySubTab === 'cards'
                      ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📚 Микро-Шпаргалка
                </button>
                <button
                  onClick={() => setTheorySubTab('traps')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    theorySubTab === 'traps'
                      ? 'bg-amber-50 border border-amber-200 text-amber-800 font-bold'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ Ловушки и Ошибки
                </button>
              </div>

              {theoryLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-3 text-slate-500 text-xs">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <span>Генерирую уникальную ИИ-теорию под эту задачу...</span>
                </div>
              ) : theorySubTab === 'cards' ? (
                <div className="space-y-3">
                  {theoryCards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-2xs"
                    >
                      <h3 className="text-xs font-bold text-blue-700">
                        <KaTeXRenderer content={card.title} />
                      </h3>
                      <div className="text-xs text-slate-800 leading-relaxed font-sans">
                        <KaTeXRenderer content={card.content} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {theoryTraps.map((trap, index) => (
                    <div
                      key={index}
                      className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-2 shadow-2xs"
                    >
                      <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle size={16} />{' '}
                        <KaTeXRenderer content={trap.title} />
                      </h3>
                      <div className="text-xs text-amber-950 leading-relaxed font-sans">
                        <KaTeXRenderer content={trap.text} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Кнопка Метод Фейнмана */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  Закрепи материал, объяснив его ИИ своими словами
                </span>
                <button
                  onClick={startFeynmanMode}
                  disabled={theoryLoading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
                >
                  <GraduationCap size={16} /> 🎓 Проверь меня (Метод Фейнмана)
                </button>
              </div>
            </div>
          )}

          {/* 2. ВКЛАДКА: КОНСПЕКТ А4 */}
          {activeTab === 'cheatsheet' && (
            <div>
              {cheatsheetLoading || !cheatsheet ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 text-xs">
                  <Loader2 size={32} className="animate-spin text-indigo-600" />
                  <span>
                    ИИ составляет индивидуальный конспект А4 под текущую задачу...
                  </span>
                </div>
              ) : (
                <div
                  id="printable-a4-sheet"
                  className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 border border-slate-200 print:border-none print:shadow-none print:p-4 [&_img]:!inline-block"
                >
                  {/* Шапка листа А4 */}
                  <div className="border-b-2 border-indigo-600 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 block">
                        AI-Tutor v2.0 • Памятка к уроку
                      </span>
                      <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                        {currentCompetencyTitle}
                      </h1>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Предмет: <strong>{currentSubj.name}</strong> • Класс:{' '}
                        <strong>
                          {selectedGrade} класс ({examType})
                        </strong>
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      <span>Дата: {new Date().toLocaleDateString()}</span>
                      <span className="block text-emerald-600 font-bold">
                        Верифицировано ФИПИ
                      </span>
                    </div>
                  </div>

                  {/* БЛОК 1: Базовые формулы */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <Sparkles size={13} className="text-indigo-600" /> 1. Главные формулы и теоретическая опора:
                    </h2>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5">
                      {cheatsheet.formulas.map((f, idx) => (
                        <KaTeXRenderer key={idx} content={f} />
                      ))}
                      {cheatsheet.note && (
                        <div className="text-[11px] text-slate-600 italic pt-1">
                          <KaTeXRenderer content={cheatsheet.note} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* БЛОК 2: Пошаговый алгоритм */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> 2. Пошаговый алгоритм выполнения задания:
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      {cheatsheet.steps.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5"
                        >
                          <strong className="text-indigo-900 block text-xs">
                            {s.step}: {s.title}
                          </strong>
                          <div className="text-slate-600 text-[11px] leading-relaxed">
                            <KaTeXRenderer content={s.desc} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* БЛОК 3: Ловушки */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <AlertTriangle size={13} className="text-amber-600" /> 3. Ловушки (Где теряют баллы 80% школьников):
                    </h2>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1.5 text-amber-950">
                      {cheatsheet.traps.map((t, idx) => (
                        <div key={idx} className="text-xs">
                          <KaTeXRenderer content={t} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* БЛОК 4: Разбор примера чистовика */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <FileText size={13} className="text-slate-600" /> 4. Пример задачи и эталонное оформление:
                    </h2>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1 font-mono text-slate-800 leading-relaxed">
                      <KaTeXRenderer content={currentTaskContext} />
                      <p className="text-[10px] text-emerald-700 font-sans font-bold pt-1.5">
                        ✓ Чистовик оформлен с соблюдением требований критериев оценивания комиссии.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. ВКЛАДКА: ЭНЦИКЛОПЕДИЧЕСКИЙ СПРАВОЧНИК КИМ ФИПИ */}
          {activeTab === 'reference' && (
            <div className="space-y-4">
              {/* Поиск и фильтры по классам */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-2.5 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск формулы (Пифагор, Конус, Логарифм, Менделеев, ОМ, Python, Н и НН, Виет)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl shrink-0 overflow-x-auto">
                  <Filter
                    size={13}
                    className="text-slate-400 ml-1.5 mr-0.5 shrink-0"
                  />
                  {['all', '5', '6', '7', '8', '9', '10', '11'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setRefGradeFilter(g)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                        refGradeFilter === g
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g === 'all' ? 'Все кл' : `${g} кл`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Предметные табы */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'math', label: '📐 Алгебра & Математика' },
                  { id: 'geometry', label: '📐 Геометрия & Стерео' },
                  { id: 'physics', label: '⚡ Физика & Константы' },
                  { id: 'chemistry', label: '🧪 Химия & Таблицы' },
                  { id: 'cs', label: '💻 Информатика & Python' },
                  { id: 'russian', label: '📚 Русский Язык' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setRefSubject(tab.id);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      refSubject === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* СПИСОК КАРТОЧЕК СПРАВОЧНИКА */}
              <div className="space-y-3">
                {currentRefItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs shadow-2xs"
                  >
                    <span className="font-bold text-emerald-800">
                      {item.title}
                    </span>
                    {item.formulas.map((f, fIdx) => (
                      <KaTeXRenderer key={fIdx} content={f} />
                    ))}
                    {item.notes && (
                      <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}

                {/* Таблица квадратов */}
                {refSubject === 'math' &&
                  matchesGrade([7, 8, 9, 10, 11]) &&
                  matchesSearch('квадраты числа') && (
                    <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="font-bold text-emerald-800 text-xs">
                        Официальная таблица квадратов двузначных чисел:
                      </span>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center font-mono text-[10px]">
                        {SQUARE_TABLE.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-1 rounded border border-slate-200 shadow-2xs"
                          >
                            <span className="text-indigo-600 block text-[8px] font-bold">
                              {item.n}
                            </span>
                            <strong className="text-slate-900">{item.v}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Степени двойки */}
                {refSubject === 'cs' &&
                  matchesSearch('степени двойки байты биты') && (
                    <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="font-bold text-emerald-800 text-xs">
                        Степени двойки и Единицы измерения информации:
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center font-mono text-[10px]">
                        {POWERS_OF_TWO.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-1 rounded border border-slate-200 shadow-2xs"
                          >
                            <span className="text-indigo-600 block text-[8px] font-bold">
                              {item.p}
                            </span>
                            <strong className="text-slate-900">{item.v}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 4. ВКЛАДКА: ТАКТИКА ЭКЗАМЕНА */}
          {activeTab === 'tactics' && (
            <div className="space-y-3">
              <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl space-y-2.5 text-xs text-amber-950 shadow-2xs">
                <span className="font-extrabold text-amber-800 uppercase tracking-wide block">
                  Стратегия двух волн (3 часа 55 минут):
                </span>
                <p className="text-slate-800 leading-relaxed">
                  1. <strong>Первая волна (45–60 минут):</strong> Решите все легкие задачи первой части, не застревая дольше 3 минут на одной задаче.
                </p>
                <p className="text-slate-800 leading-relaxed">
                  2. <strong>Вторая волна (90 минут):</strong> Решение высокобалльных задач развернутой части (уравнения, геометрия, параметры).
                </p>
                <p className="text-slate-800 leading-relaxed">
                  3. <strong>Проверка и перенос в бланк (30 минут):</strong> Обязательно сверьте перенос ответов в бланк ответов №1!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ПОДВАЛ */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0 print:hidden">
          <span>Единый центр теоретических и справочных материалов ФИПИ</span>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};