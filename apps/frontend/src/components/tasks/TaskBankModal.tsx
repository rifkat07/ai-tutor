'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useChatStore, SubjectType, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  CheckCircle,
  BookOpen,
  Loader2,
  Search,
  Sparkles,
  Zap,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';

interface TaskBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BankTaskFromDB {
  id: string;
  taskNumber: string;
  title: string;
  subject: SubjectType;
  condition: string;
  similarity?: number | null;
}

const TOPIC_CATEGORIES: Record<string, Record<string, { id: string; label: string; match: string }[]>> = {
  math: {
    EGE: [
      { id: 'all', label: 'Все номера', match: '' },
      { id: 'geo1', label: '№1 Планиметрия', match: '№1' },
      { id: 'vec2', label: '№2 Векторы', match: '№2' },
      { id: 'ster3', label: '№3 Стереометрия', match: '№3' },
      { id: 'prob4', label: '№4–5 Вероятность', match: '№4' },
      { id: 'eq6', label: '№6 Уравнения', match: '№6' },
      { id: 'calc7', label: '№7 Вычисления', match: '№7' },
      { id: 'der8', label: '№8 Производная', match: '№8' },
      { id: 'app9', label: '№9–10 Прикладные & Движение', match: '№9' },
      { id: 'graph11', label: '№11 Графики', match: '№11' },
      { id: 'extr12', label: '№12 Экстремумы', match: '№12' },
      { id: 'trig13', label: '№13 Тригонометрия (2 часть)', match: '№13' },
      { id: 'ster14', label: '№14 Стереометрия (2 часть)', match: '№14' },
      { id: 'ineq15', label: '№15 Неравенства (2 часть)', match: '№15' },
      { id: 'fin16', label: '№16 Финансы (2 часть)', match: '№16' },
      { id: 'param18', label: '№18 Параметры (2 часть)', match: '№18' },
    ],
    OGE: [
      { id: 'all', label: 'Все номера ОГЭ', match: '' },
      { id: 'oge6', label: '№6 Дроби и вычисления', match: '№6' },
      { id: 'oge9', label: '№9 Уравнения', match: '№9' },
      { id: 'oge10', label: '№10 Вероятность', match: '№10' },
      { id: 'oge14', label: '№14 Прогрессии', match: '№14' },
      { id: 'oge15', label: '№15–17 Геометрия', match: '№15' },
      { id: 'oge20', label: '№20 Системы (2 часть)', match: '№20' },
      { id: 'oge21', label: '№21 Задачи на движение (2 часть)', match: '№21' },
    ],
  },
  physics: {
    EGE: [
      { id: 'all', label: 'Все разделы физики', match: '' },
      { id: 'mech', label: '№1–3 Механика и законы', match: '№1' },
      { id: 'mkt', label: '№8 МКТ и термодинамика', match: '№8' },
      { id: 'el', label: '№12–15 Электродинамика и колебания', match: '№12' },
      { id: 'part2', label: '№21 Расчетные задачи (2 часть)', match: '№21' },
    ],
    OGE: [
      { id: 'all', label: 'Все темы ОГЭ', match: '' },
      { id: 'mech', label: 'Механические явления', match: 'механик' },
      { id: 'therm', label: 'Тепловые явления', match: 'тепл' },
      { id: 'el', label: 'Электромагнитные явления', match: 'электр' },
    ],
  },
  cs: {
    EGE: [
      { id: 'all', label: 'Все номера КЕГЭ', match: '' },
      { id: 'kege1', label: 'КЕГЭ №1 Графы', match: '№1' },
      { id: 'kege2', label: 'КЕГЭ №2 Таблицы истинности', match: '№2' },
      { id: 'kege8', label: 'КЕГЭ №8 Комбинаторика', match: '№8' },
      { id: 'kege14', label: 'КЕГЭ №14 Системы счисления', match: '№14' },
      { id: 'kege16', label: 'КЕГЭ №16 Рекурсия', match: '№16' },
      { id: 'kege24', label: 'КЕГЭ №24 Строки и файлы', match: '№24' },
    ],
    OGE: [
      { id: 'all', label: 'Все темы ОГЭ', match: '' },
      { id: 'oge_code', label: 'Кодирование информации', match: 'код' },
      { id: 'oge_prog', label: 'Программирование Python', match: 'програм' },
    ],
  },
  russian: {
    EGE: [
      { id: 'all', label: 'Все задания', match: '' },
      { id: 'rus4', label: '№4 Ударения', match: '№4' },
      { id: 'rus9', label: '№9 Чередование корней', match: '№9' },
      { id: 'rus13', label: '№13 НЕ слитно/раздельно', match: '№13' },
      { id: 'rus15', label: '№15 Правописание Н и НН', match: '№15' },
      { id: 'rus27', label: '№27 Сочинение (К1–К12)', match: '№27' },
    ],
    OGE: [
      { id: 'all', label: 'Все задания', match: '' },
      { id: 'oge_ortho', label: 'Орфография и пунктуация', match: 'орфограф' },
      { id: 'oge_essay', label: 'Сочинение №13.2', match: 'сочинен' },
    ],
  },
  chemistry: {
    EGE: [
      { id: 'all', label: 'Все темы', match: '' },
      { id: 'chem1', label: '№1 Строение атома', match: '№1' },
      { id: 'chem19', label: '№19 Окислительно-восстановительные (ОВР)', match: '№19' },
      { id: 'chem26', label: '№26 Расчеты: Массовая доля раствора', match: '№26' },
    ],
    OGE: [
      { id: 'all', label: 'Все темы ОГЭ', match: '' },
      { id: 'oge_chem', label: 'Строение веществ и реакции', match: 'строени' },
    ],
  },
};

export const TaskBankModal: React.FC<TaskBankModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeSubject, examType, setExamType, setTaskContext } =
    useChatStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [dbTasks, setDbTasks] = useState<BankTaskFromDB[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const currentExam = examType === 'OGE' ? 'OGE' : 'EGE';

  const topicChips = useMemo(() => {
    const subjTopics = TOPIC_CATEGORIES[activeSubject] || TOPIC_CATEGORIES.math;
    return (
      subjTopics[currentExam] ||
      subjTopics.EGE || [
        { id: 'all', label: 'Все задания', match: '' },
      ]
    );
  }, [activeSubject, currentExam]);

  // Загрузка заданий
  useEffect(() => {
    if (!isOpen) return;

    const fetchTasks = async () => {
      setLoading(true);
      setPage(1);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        if (searchQuery.trim().length >= 2) {
          const res = await fetch(`${apiBase}/api/v1/tasks/semantic-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              subject: activeSubject,
              exam_type: currentExam,
              limit: 50,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setDbTasks(data || []);
            setTotalCount(data.length || 0);
            setHasMore(false);
          }
        } else {
          // Загружаем полную порцию базы для быстрого переключения чипсов
          const res = await fetch(
            `${apiBase}/api/v1/tasks/?subject=${activeSubject}&exam_type=${currentExam}&page=1&limit=50`
          );
          if (res.ok) {
            const json = await res.json();
            const taskItems = json.tasks || (Array.isArray(json) ? json : []);
            setDbTasks(taskItems);
            setTotalCount(json.total || taskItems.length);
            setHasMore(Boolean(json.has_more));
          }
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTasks, searchQuery ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [isOpen, activeSubject, currentExam, searchQuery]);

  const handleLoadNext10Tasks = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(
        `${apiBase}/api/v1/tasks/?subject=${activeSubject}&exam_type=${currentExam}&page=${nextPage}&limit=10`
      );
      if (res.ok) {
        const json = await res.json();
        const newItems = json.tasks || [];
        if (newItems.length > 0) {
          setDbTasks((prev) => [...prev, ...newItems]);
          setPage(nextPage);
        }
        setHasMore(Boolean(json.has_more));
      }
    } catch (err) {
      console.error('Load more tasks error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const displayedTasks = useMemo(() => {
    if (selectedTopic === 'all') return dbTasks;
    const chip = topicChips.find((c) => c.id === selectedTopic);
    if (!chip || !chip.match) return dbTasks;

    const m = chip.match.toLowerCase();
    return dbTasks.filter((t) => {
      const numLower = (t.taskNumber || '').toLowerCase();
      const titleLower = (t.title || '').toLowerCase();
      return numLower.includes(m) || titleLower.includes(m);
    });
  }, [dbTasks, selectedTopic, topicChips]);

  const selectedTopicLabel = useMemo(() => {
    if (selectedTopic === 'all') return 'Все номера';
    const chip = topicChips.find((c) => c.id === selectedTopic);
    return chip ? chip.label : '';
  }, [selectedTopic, topicChips]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl shadow-inner">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Банк Заданий КИМ ({currentExam})
                </h2>
                <span className="text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <Sparkles size={10} /> Векторный RAG
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Официальные прототипы ФИПИ с рубрикатором по номерам заданий
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs gap-1">
              <button
                onClick={() => {
                  setExamType('EGE');
                  setSearchQuery('');
                  setSelectedTopic('all');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currentExam === 'EGE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ЕГЭ
              </button>
              <button
                onClick={() => {
                  setExamType('OGE');
                  setSearchQuery('');
                  setSelectedTopic('all');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currentExam === 'OGE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ОГЭ
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* СТРОКА СЕМАНТИЧЕСКОГО ВЕКТОРНОГО ПОИСКА */}
        <div className="py-2.5 border-b border-slate-200 flex gap-2.5 items-center shrink-0">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-2.5 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Семантический поиск: опишите задачу своими словами (например: «сложение дробей», «объем цилиндра», «дискриминант»)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition shrink-0"
            >
              Сброс
            </button>
          )}
        </div>

        {/* 🏷️ ИНТЕРАКТИВНЫЙ РУБРИКАТОР ПО НОМЕРАМ И ТЕМАМ КИМ */}
        <div className="py-2.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <Layers size={14} className="text-slate-400 ml-1 mr-0.5 shrink-0" />
          {topicChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedTopic(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                selectedTopic === chip.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Список задач */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 text-xs">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <span>
                {searchQuery
                  ? 'Векторный поиск ближайших задач в pgvector...'
                  : `Загрузка прототипов КИМ ${currentExam}...`}
              </span>
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <BookOpen size={32} className="mx-auto text-slate-400 mb-1" />
              <p className="font-bold text-slate-800">
                В этой категории пока нет задач!
              </p>
              <p className="text-[11px] text-slate-500">
                Выберите другой раздел в рубрикаторе или сбросьте поиск.
              </p>
            </div>
          ) : (
            <>
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 hover:border-blue-300 transition shadow-2xs"
                >
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                        {task.taskNumber} — {task.title}
                      </span>
                      {task.similarity !== null &&
                        task.similarity !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-1">
                            <Zap size={11} /> Совпадение: {task.similarity}%
                          </span>
                        )}
                    </div>

                    <button
                      onClick={() => {
                        setTaskContext(
                          task.condition,
                          `${task.taskNumber} (${task.title})`,
                          0.3
                        );
                        onClose();
                      }}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl transition font-bold shadow-xs active:scale-95"
                    >
                      <CheckCircle size={14} /> Решать с AI
                    </button>
                  </div>

                  <div className="text-xs text-slate-900 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs leading-relaxed">
                    <KaTeXRenderer content={task.condition} />
                  </div>
                </div>
              ))}

              {/* КНОПКА ЗАГРУЗКИ СЛЕДУЮЩИХ 10 ЗАДАНИЙ */}
              {!searchQuery && selectedTopic === 'all' && (
                <div className="pt-3 flex justify-center">
                  {hasMore ? (
                    <button
                      onClick={handleLoadNext10Tasks}
                      disabled={loadingMore}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-700 text-xs font-bold px-6 py-3 rounded-2xl transition flex items-center gap-2 shadow-xs active:scale-95"
                    >
                      {loadingMore ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-blue-600"
                        />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      <span>
                        {loadingMore
                          ? 'Загрузка следующих 10 заданий...'
                          : `Загрузить следующие 10 заданий (${
                              page * 10 + 1
                            }–${(page + 1) * 10}) ⬇️`}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" /> Все доступные задания базы загружены ({totalCount} шт)
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Подвал с четким и понятным разделением счетчиков */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>
            {searchQuery
              ? `Найдено ${displayedTasks.length} семантически похожих задач`
              : selectedTopic === 'all'
              ? `Показано ${displayedTasks.length} заданий (Всего в базе ${currentExam}: ${totalCount || dbTasks.length})`
              : `Показано ${displayedTasks.length} заданий по теме «${selectedTopicLabel}» (Всего в базе ${currentExam}: ${totalCount || dbTasks.length})`}
          </span>
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