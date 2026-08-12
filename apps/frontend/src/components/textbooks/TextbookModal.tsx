'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, Search, CheckCircle, GraduationCap, Loader2, ArrowLeft, BookOpen, Sparkles, Camera } from 'lucide-react';

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

export const TextbookModal: React.FC<TextbookModalProps> = ({ isOpen, onClose }) => {
  const { activeSubject, selectedGrade, setSelectedGrade, setTaskContext, generateSimilarTask } = useChatStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [textbooks, setTextbooks] = useState<TextbookFromDB[]>([]);
  const [selectedBook, setSelectedBook] = useState<TextbookFromDB | null>(null);
  const [exercises, setExercises] = useState<ExerciseFromDB[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchTextbooksFromDB = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/textbooks/?grade=${selectedGrade}&subject=${activeSubject}`);
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

  const openBookExercises = async (book: TextbookFromDB) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/textbooks/${book.id}/exercises`);
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

  const filteredExercises = exercises.filter((ex) =>
    searchQuery === '' ||
    ex.exercise_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.condition_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {selectedBook ? (
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-xs font-semibold mr-2 transition"
              >
                <ArrowLeft size={16} /> Назад к книгам
              </button>
            ) : (
              <GraduationCap className="text-emerald-400" size={24} />
            )}
            <div>
              <h2 className="text-lg font-bold text-white">
                {selectedBook ? selectedBook.title : 'Школьные Учебники и ГДЗ'}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedBook ? `Автор: ${selectedBook.author} (${selectedBook.grade} класс)` : 'Выберите учебник или используйте фото со своего стола'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Выбор Класса (5–11 кл) */}
        {!selectedBook && (
          <div className="flex justify-between items-center py-4 border-b border-slate-800 gap-2 flex-wrap">
            <div className="flex gap-1.5 overflow-x-auto">
              {[5, 6, 7, 8, 9, 10, 11].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedGrade === grade
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {grade} кл
                </button>
              ))}
            </div>

            {/* Быстрые ИИ-Кнопки */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  generateSimilarTask();
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Sparkles size={14} /> Сгенерировать ИИ
              </button>
            </div>
          </div>
        )}

        {/* Поиск внутри книги */}
        {selectedBook && (
          <div className="py-3 border-b border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру упражнения (например: №10, №20, №342)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Список книг / упражнений */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 text-xs">
              <Loader2 size={24} className="animate-spin text-emerald-500" />
              <span>Загрузка оцифрованных данных из БД...</span>
            </div>
          ) : selectedBook ? (
            filteredExercises.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">
                Упражнений для этого учебника в базе не найдено
              </p>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
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
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg font-bold transition shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle size={14} /> Решать с AI
                    </button>
                  </div>
                  <div className="text-sm text-slate-200">
                    <KaTeXRenderer content={ex.condition_text} />
                  </div>
                </div>
              ))
            )
          ) : (
            textbooks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-3 bg-slate-950/50 rounded-xl p-6 border border-slate-800">
                <BookOpen size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">
                  Вы можете использовать свой бумажный учебник или сгенерировать упражнение ИИ!
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      generateSimilarTask();
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    <Sparkles size={14} /> Сгенерировать ИИ
                  </button>
                </div>
              </div>
            ) : (
              textbooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-emerald-500/50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {book.author}
                      </span>
                      <span className="text-xs text-slate-400">{book.grade} класс</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">{book.title}</h3>
                  </div>
                  <button
                    onClick={() => openBookExercises(book)}
                    className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold transition shadow-md shadow-emerald-600/20"
                  >
                    <BookOpen size={14} /> Открыть Упражнения
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};