'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS, SubjectType } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  Search,
  CheckCircle,
  GraduationCap,
  Loader2,
  ArrowLeft,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface TextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TextbookFromDB {
  id: string;
  grade: number;
  subject: string;
  author: string;
  title: string;
}

interface ExerciseFromDB {
  id: string;
  exercise_number: string;
  chapter_title: string;
  condition_text: string;
  official_solution_hint?: string;
}

export const TextbookModal: React.FC<TextbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeSubject,
    setSubject,
    selectedGrade,
    setSelectedGrade,
    setTaskContext,
    generateSimilarTask,
  } = useChatStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [textbooks, setTextbooks] = useState<TextbookFromDB[]>([]);
  const [selectedBook, setSelectedBook] = useState<TextbookFromDB | null>(null);
  const [exercises, setExercises] = useState<ExerciseFromDB[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;

  useEffect(() => {
    if (!isOpen) return;

    const fetchTextbooksFromDB = async () => {
      setLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(
          `${apiBase}/api/v1/textbooks/?grade=${selectedGrade}&subject=${activeSubject}`
        );
        if (res.ok) {
          const data = await res.json();
          setTextbooks(data || []);
        }
      } catch (err) {
        console.error('Error fetching textbooks from DB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTextbooksFromDB();
  }, [isOpen, selectedGrade, activeSubject]);

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    // Если для нового класса текущий предмет недоступен (например, Химия в 5 классе) -> переключаем на Математику
    if (SUBJECTS[activeSubject]?.minGrade > grade) {
      setSubject('math');
    }
  };

  const openBookExercises = async (book: TextbookFromDB) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(
        `${apiBase}/api/v1/textbooks/${book.id}/exercises`
      );
      if (res.ok) {
        const data = await res.json();
        setExercises(data || []);
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredExercises = exercises.filter(
    (ex) =>
      searchQuery === '' ||
      ex.exercise_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.condition_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {selectedBook ? (
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
              >
                <ArrowLeft size={16} /> Назад к книгам
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl shadow-inner">
                <GraduationCap size={22} />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {selectedBook
                  ? selectedBook.title
                  : `Школьные Учебники ФГОС (${selectedGrade} класс • ${currentSubj.name})`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedBook
                  ? `Автор: ${selectedBook.author} (${selectedBook.grade} класс)`
                  : 'Оцифрованная база упражнений по официальному перечню ФГОС'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Выбор Класса (5–11 кл) */}
        {!selectedBook && (
          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-2 flex-wrap shrink-0">
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1 overflow-x-auto">
              {[5, 6, 7, 8, 9, 10, 11].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeChange(grade)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedGrade === grade
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {grade} кл
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                generateSimilarTask();
              }}
              className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Sparkles size={14} className="text-amber-500" /> Сгенерировать ИИ
            </button>
          </div>
        )}

        {/* 2. ПАНЕЛЬ ВЫБОРА ПРЕДМЕТА */}
        {!selectedBook && (
          <div className="flex gap-1.5 py-2.5 border-b border-slate-200 overflow-x-auto shrink-0">
            {Object.values(SUBJECTS)
              .filter((s) => s.minGrade <= selectedGrade)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id as SubjectType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeSubject === s.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
          </div>
        )}

        {/* Поиск по номеру внутри книги */}
        {selectedBook && (
          <div className="py-3 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-2.5 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру упражнения (например: №10, №20, №342)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        {/* Список книг / упражнений */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 text-xs">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <span>Загрузка учебников {selectedGrade} класса ({currentSubj.name})...</span>
            </div>
          ) : selectedBook ? (
            filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <BookOpen size={32} className="mx-auto text-slate-400 mb-1" />
                <p className="font-bold text-slate-800">
                  Упражнений по этому номеру не найдено
                </p>
                <p className="text-[11px] text-slate-500">
                  Попробуйте изменить запрос в строке поиска.
                </p>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2.5 hover:border-emerald-300 transition shadow-2xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                      {ex.exercise_number} — {ex.chapter_title}
                    </span>
                    <button
                      onClick={() => {
                        setTaskContext(
                          `${selectedBook.author} (${ex.exercise_number}):\n${ex.condition_text}`,
                          `${selectedBook.author} (${ex.exercise_number})`,
                          0.3
                        );
                        onClose();
                      }}
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold transition shadow-xs active:scale-95"
                    >
                      <CheckCircle size={14} /> Решать с AI
                    </button>
                  </div>
                  <div className="text-xs text-slate-900 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs leading-relaxed">
                    <KaTeXRenderer content={ex.condition_text} />
                  </div>
                </div>
              ))
            )
          ) : textbooks.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <BookOpen size={32} className="mx-auto text-emerald-600 mb-1" />
              <p className="font-bold text-slate-800 text-sm">
                В базе пока нет учебников по предмету «{currentSubj.name}» ({selectedGrade} класс)
              </p>
              <p className="text-slate-500 max-w-md mx-auto text-xs">
                Запустите ярлык <code className="bg-slate-100 text-emerald-700 px-2 py-0.5 rounded font-mono text-[11px]">sync_fgos_textbooks.bat</code> на Рабочем столе для автоматического наполнения базы учебниками ФГОС 2023–2026!
              </p>
            </div>
          ) : (
            textbooks.map((book) => (
              <div
                key={book.id}
                className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                      {book.author}
                    </span>
                    <span className="text-xs text-slate-500">
                      {book.grade} класс
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">
                    {book.title}
                  </h3>
                </div>
                <button
                  onClick={() => openBookExercises(book)}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold transition shadow-xs shrink-0 active:scale-95"
                >
                  <BookOpen size={14} /> Открыть Упражнения
                </button>
              </div>
            ))
          )}
        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Синхронизировано с базой учебников ФГОС 2024–2026</span>
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