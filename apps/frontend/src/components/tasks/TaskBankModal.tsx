'use client';

import React, { useState, useEffect } from 'react';
import { useChatStore, SubjectType, SUBJECTS } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, CheckCircle, BookOpen, Loader2 } from 'lucide-react';

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
}

export const TaskBankModal: React.FC<TaskBankModalProps> = ({ isOpen, onClose }) => {
  const { activeSubject, examType, setExamType, setTaskContext } = useChatStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [dbTasks, setDbTasks] = useState<BankTaskFromDB[]>([]);

  // Загрузка реальных КИМов ОГЭ/ЕГЭ из базы данных
  useEffect(() => {
    if (!isOpen) return;

    const fetchBankTasksFromDB = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/v1/tasks/?subject=${activeSubject}&exam_type=${examType}`);
        if (res.ok) {
          const data = await res.json();
          setDbTasks(data || []);
        }
      } catch (err) {
        console.error('Error fetching bank tasks from DB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBankTasksFromDB();
  }, [isOpen, activeSubject, examType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">Банк Заданий ({examType}) из БД</h2>
            
            {/* Переключатель ЕГЭ / ОГЭ */}
            <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setExamType('EGE')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  examType === 'EGE' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                ЕГЭ
              </button>
              <button
                onClick={() => setExamType('OGE')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  examType === 'OGE' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                ОГЭ
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Список задач из базы данных */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 text-xs">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span>Загрузка Банка КИМов {examType} из базы данных...</span>
            </div>
          ) : dbTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2 bg-slate-950/50 rounded-xl p-6 border border-slate-800">
              <BookOpen size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">
                В базе данных пока нет занесенных заданий для формата {examType} ({SUBJECTS[activeSubject]?.name}).
              </p>
              <p className="text-[11px] text-slate-500">
                Запустите <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-mono">seed_fipi.bat</code> или <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-mono">ingest_all_pdfs.bat</code> на диске для подгрузки!
              </p>
            </div>
          ) : (
            dbTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                    {task.taskNumber} — {task.title}
                  </span>
                  <button
                    onClick={() => {
                      setTaskContext(task.condition, `${task.taskNumber} (${task.title})`, 0.3);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-bold"
                  >
                    <CheckCircle size={14} /> Решать с AI
                  </button>
                </div>
                <div className="text-sm text-slate-200">
                  <KaTeXRenderer content={task.condition} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};