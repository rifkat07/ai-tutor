'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  DownloadCloud,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  ListOrdered,
  Search,
  Check,
} from 'lucide-react';

interface SdamgiaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VariantItem {
  id: string;
  variant_number: string;
  title: string;
  url: string;
  tasks_count: number;
}

interface SdamgiaTask {
  task_number: string;
  title: string;
  condition: string;
  solution_hint?: string;
}

interface VariantResponse {
  variant_id: string;
  subject: string;
  exam_type: string;
  title: string;
  source_url: string;
  tasks_count: number;
  tasks: SdamgiaTask[];
}

export const SdamgiaImportModal: React.FC<SdamgiaImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeSubject, examType, setTaskContext, addMessage } =
    useChatStore();
  const [activeTab, setActiveTab] = useState<'catalog' | 'manual'>('catalog');

  const [page, setPage] = useState<number>(1);
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [manualId, setManualId] = useState<string>('');
  const [loadingVariant, setLoadingVariant] = useState<boolean>(false);
  const [selectedVariantData, setSelectedVariantData] =
    useState<VariantResponse | null>(null);

  const currentSubj = SUBJECTS[activeSubject] || SUBJECTS.math;
  const currentExam = examType === 'OGE' ? 'OGE' : 'EGE';

  useEffect(() => {
    if (!isOpen) return;

    const loadInitialCatalog = async () => {
      setLoadingCatalog(true);
      setPage(1);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(
          `${apiBase}/api/v1/tasks/sdamgia-catalog?subject=${activeSubject}&exam_type=${currentExam}&page=1&limit=10`
        );
        if (res.ok) {
          const json = await res.json();
          setVariantsList(json.variants || []);
          setHasMore(Boolean(json.has_more));
        }
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };

    setSelectedVariantData(null);
    loadInitialCatalog();
  }, [isOpen, activeSubject, currentExam]);

  const handleLoadNext10 = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(
        `${apiBase}/api/v1/tasks/sdamgia-catalog?subject=${activeSubject}&exam_type=${currentExam}&page=${nextPage}&limit=10`
      );
      if (res.ok) {
        const json = await res.json();
        const newItems = json.variants || [];
        if (newItems.length > 0) {
          setVariantsList((prev) => [...prev, ...newItems]);
          setPage(nextPage);
        }
        setHasMore(Boolean(json.has_more));
      }
    } catch (err) {
      console.error('Load more variants error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFetchVariantTasks = async (testId: string) => {
    const idToFetch = testId.trim();
    if (!idToFetch || loadingVariant) return;

    setLoadingVariant(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/tasks/import-sdamgia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: idToFetch,
          subject: activeSubject,
          exam_type: currentExam,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSelectedVariantData(json);
      }
    } catch (err) {
      console.error('Fetch variant tasks error:', err);
    } finally {
      setLoadingVariant(false);
    }
  };

  // ПРИ ВЫБОРЕ ЗАДАЧИ: ПЕРЕКЛЮЧАЕМ КАРТОЧКУ И ОЧИЩАЕМ ЧАТ ПОД НОВУЮ ЗАДАЧУ!
  const handleSelectTask = (task: SdamgiaTask) => {
    const newContextTitle = `Решу${currentExam} Вариант #${selectedVariantData?.variant_id} (${task.task_number})`;

    // 1. Устанавливаем задачу в карточку
    setTaskContext(task.condition, newContextTitle, 0.3);

    // 2. СБРАСЫВАЕМ ИСТОРИЮ ЧАТА ПОД НОВУЮ ЗАДАЧУ (чтобы ИИ не думал о старом уравнении!)
    useChatStore.setState({
      messages: [
        {
          id: `${Date.now()}-sdamgia-start`,
          sender: 'assistant',
          text: `📥 **Загружено задание из варианта Решу${currentExam} #${selectedVariantData?.variant_id}!**\n\nНомер: **${task.task_number}** — *${task.title}*\n\n${task.condition}\n\nС чего начнем решение?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden text-slate-900">
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {selectedVariantData ? (
              <button
                onClick={() => setSelectedVariantData(null)}
                className="p-2 bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
              >
                <ArrowLeft size={16} /> Назад к каталогу
              </button>
            ) : (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl shadow-inner">
                <DownloadCloud size={22} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {selectedVariantData
                    ? selectedVariantData.title
                    : `Каталог Вариантов Решу${currentExam}`}
                </h2>
                <span className="text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                  {currentSubj.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedVariantData
                  ? `Всего ${selectedVariantData.tasks_count} реальных заданий с РешуЕГЭ/СдамГИА`
                  : `Официальная база вариантов по предмету ${currentSubj.name}`}
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

        {/* Вкладки */}
        {!selectedVariantData && (
          <div className="flex gap-2 py-3 border-b border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered size={14} /> Каталог вариантов (
              {variantsList.length})
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search size={14} /> Поиск по номеру теста
            </button>
          </div>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {loadingVariant ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 text-xs">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <span>Загрузка и парсинг всех задач варианта с РешуЕГЭ...</span>
            </div>
          ) : selectedVariantData ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {selectedVariantData.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Успешно импортировано {selectedVariantData.tasks_count}{' '}
                    заданий • {currentSubj.name}
                  </p>
                </div>
                <a
                  href={selectedVariantData.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl font-bold transition"
                >
                  <span>Открыть на РешуЕГЭ</span> <ExternalLink size={12} />
                </a>
              </div>

              {selectedVariantData.tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Не удалось загрузить задачи для этого номера варианта.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Проверьте номер теста или выберите вариант из каталога.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedVariantData.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2.5 hover:border-blue-300 transition shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                          {t.task_number} — {t.title}
                        </span>
                        <button
                          onClick={() => handleSelectTask(t)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 size={14} /> Решать с AI
                        </button>
                      </div>
                      <div className="text-xs text-slate-900 bg-white p-3.5 rounded-xl border border-slate-200/90 leading-relaxed shadow-2xs">
                        <KaTeXRenderer content={t.condition} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'manual' ? (
            <div className="space-y-4 max-w-lg mx-auto py-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Введите номер теста из школы (например: 5421822):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      handleFetchVariantTasks(manualId)
                    }
                    placeholder="Например: 5421822..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={() => handleFetchVariantTasks(manualId)}
                    disabled={!manualId.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs shrink-0"
                  >
                    Загрузить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 text-xs">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <span>Загрузка каталога вариантов из базы...</span>
                </div>
              ) : variantsList.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <DownloadCloud
                    size={32}
                    className="mx-auto text-blue-500 mb-1"
                  />
                  <p className="font-bold text-slate-800">
                    База вариантов еще не заполнена
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Запустите ярлык{' '}
                    <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                      sync_sdamgia.bat
                    </code>{' '}
                    на Рабочем столе для автоматического сбора вариантов!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {variantsList.map((v, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 transition shadow-2xs"
                      >
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                            Тест #{v.id}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                            {v.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {v.tasks_count} заданий • {currentSubj.name}
                          </p>
                        </div>

                        <button
                          onClick={() => handleFetchVariantTasks(v.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs shrink-0 flex items-center gap-1 active:scale-95"
                        >
                          <span>Открыть</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* КНОПКА ПОДГРУЗКИ СЛЕДУЮЩИХ 10 ВАРИАНТОВ */}
                  <div className="pt-3 flex justify-center">
                    {hasMore ? (
                      <button
                        onClick={handleLoadNext10}
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
                            ? 'Загрузка следующих 10 вариантов...'
                            : `Загрузить следующие 10 вариантов (${
                                page * 10 + 1
                              }–${(page + 1) * 10}) ⬇️`}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 font-bold bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" /> Все
                        доступные варианты месяца загружены (
                        {variantsList.length} шт)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Синхронизировано с базой заданий РешуЕГЭ / СдамГИА</span>
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