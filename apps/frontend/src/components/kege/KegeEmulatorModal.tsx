'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import {
  X,
  Play,
  Clock,
  Bookmark,
  Terminal,
  Table,
  Code2,
  Laptop,
  Check,
  Sparkles,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface KegeEmulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEGE_TASKS_DATA: Record<number, { title: string; condition: string; starterCode: string }> = {
  1: {
    title: 'КЕГЭ №1: Анализ информационных моделей (Графы)',
    condition: 'На рисунке справа схема дорог Н-ского района изображена в виде графа, в таблице содержатся сведения о длинах этих дорог. Определите длину дороги из пункта А в пункт Д.',
    starterCode: '# Задание №1 КЕГЭ: Сравнение таблицы и графа\nprint("Анализ степеней вершин графа...")\n',
  },
  2: {
    title: 'КЕГЭ №2: Построение таблиц истинности',
    condition: 'Логическая функция $F$ задаётся выражением: $$((x \\le y) \\land (y \\le z)) \\lor (w \\equiv 1)$$ Напишите программу, выводящую все наборы переменных, при которых $F = 0$.',
    starterCode: '# Задание №2 КЕГЭ: Таблица истинности\nprint("x y z w")\nfor x in range(2):\n    for y in range(2):\n        for z in range(2):\n            for w in range(2):\n                f = (x <= y) and (y <= z) or (w == 1)\n                if not f:\n                    print(x, y, z, w)\n',
  },
  5: {
    title: 'КЕГЭ №5: Анализ алгоритмов для автоматов',
    condition: 'На вход алгоритма подаётся натуральное число $N$. Алгоритм строит по нему число $R$:\n1. Строится двоичная запись $N$.\n2. К этой записи дописываются биты четности.\nУкажите минимальное $R > 97$, полученное в результате.',
    starterCode: '# Задание №5 КЕГЭ: Двоичные автоматы\nfor N in range(1, 1000):\n    b = bin(N)[2:]\n    b += str(b.count("1") % 2)\n    b += str(b.count("1") % 2)\n    R = int(b, 2)\n    if R > 97:\n        print("Минимальное R:", R)\n        break\n',
  },
  8: {
    title: 'КЕГЭ №8: Комбинаторика и перебор слов',
    condition: 'Все 5-буквенные слова, составленные из букв В, И, Ш, Н, Я, записаны в алфавитном порядке. Сколько слов содержат не более одной буквы В и не начинаются с буквы Ш?',
    starterCode: 'from itertools import product\n\nwords = ["".join(p) for p in product("ВИШНЯ", repeat=5)]\ncount = 0\nfor w in words:\n    if w.count("В") <= 1 and w[0] != "Ш":\n        count += 1\n\nprint("Количество подходящих слов:", count)\n',
  },
  14: {
    title: 'КЕГЭ №14: Системы счисления',
    condition: 'Значение арифметического выражения $$4^{12} + 2^{30} - 32$$ записали в системе счисления с основанием 4. Сколько цифр 3 содержится в этой записи?',
    starterCode: '# Задание №14 КЕГЭ: Позиционные системы счисления\nexpr = 4**12 + 2**30 - 32\ns = ""\nwhile expr > 0:\n    s = str(expr % 4) + s\n    expr //= 4\n\nprint("Результат в 4-ричной системе:", s)\nprint("Количество цифр 3:", s.count("3"))\n',
  },
  16: {
    title: 'КЕГЭ №16: Вычисление значений рекурсивных функций',
    condition: 'Алгоритм вычисления функции $F(n)$ задан соотношениями:\n$$F(1) = 1$$\n$$F(n) = n + F(n - 1), \\text{ если } n > 1$$\nЧему равно значение функции $F(2026)$?',
    starterCode: 'import sys\nsys.setrecursionlimit(5000)\n\ndef F(n):\n    if n == 1:\n        return 1\n    return n + F(n - 1)\n\nprint("Значение F(2026):", F(2026))\n',
  },
  17: {
    title: 'КЕГЭ №17: Обработка числовой последовательности',
    condition: 'В последовательности чисел от 1 до 1000 определите количество пар элементов, кратных 3, сумма которых меньше максимума.',
    starterCode: '# Задание №17 КЕГЭ: Пары элементов\nnumbers = list(range(1, 1001))\nmax_val = max(numbers)\npairs_count = 0\nfor i in range(len(numbers) - 1):\n    a, b = numbers[i], numbers[i+1]\n    if (a % 3 == 0 or b % 3 == 0) and (a + b < max_val):\n        pairs_count += 1\nprint("Количество пар:", pairs_count)\n',
  },
};

function generateStarterCodeForContext(taskContext: string, title: string): string {
  const clean = (taskContext || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\$\\]/g, ' ')
    .trim();

  const taskBody = clean.replace(/^[А-Яа-яA-Za-z\s0-9\(\)№\-:]+:\s*/, '').trim();
  const lower = taskBody.toLowerCase();

  const rangeMatch = taskBody.match(/от\s*(\d+)\s*до\s*(\d+)/i);
  if (rangeMatch || lower.includes('сумм') || lower.includes('четн')) {
    const start = rangeMatch ? rangeMatch[1] : '1';
    const end = rangeMatch ? rangeMatch[2] : '100';

    const isOdd = lower.includes('нечетн');
    const isEven = !isOdd && lower.includes('четн');

    let cond = '';
    let label = 'чисел';

    if (isOdd) {
      cond = ' if x % 2 != 0';
      label = 'нечетных чисел';
    } else if (isEven) {
      cond = ' if x % 2 == 0';
      label = 'четных чисел';
    }

    return `# ${title || 'Вычисление суммы в диапазоне'}\ntotal = sum(x for x in range(${start}, ${Number(end) + 1})${cond})\nprint(f"Сумма ${label} от ${start} до ${end}:", total)\n`;
  }

  if (lower.includes('меньш') || lower.includes('миним') || lower.includes('наименьш')) {
    const varsMatch = taskBody.match(/\b([A-Za-zА-Яа-я])\b\s*(?:и|,)\s*\b([A-Za-zА-Яа-я])\b/);
    const v1 = varsMatch ? varsMatch[1].toUpperCase() : 'X';
    const v2 = varsMatch ? varsMatch[2].toUpperCase() : 'Y';
    return `# ${title || 'Поиск меньшего числа'}\n${v1} = 15\n${v2} = 28\n\n# Алгоритм нахождения меньшего числа:\nif ${v1} < ${v2}:\n    print("Меньшее число:", ${v1})\nelse:\n    print("Меньшее число:", ${v2})\n`;
  }

  if (lower.includes('больш') || lower.includes('максим') || lower.includes('наибольш')) {
    const varsMatch = taskBody.match(/\b([A-Za-zА-Яа-я])\b\s*(?:и|,)\s*\b([A-Za-zА-Яа-я])\b/);
    const v1 = varsMatch ? varsMatch[1].toUpperCase() : 'A';
    const v2 = varsMatch ? varsMatch[2].toUpperCase() : 'B';
    return `# ${title || 'Поиск большего числа'}\n${v1} = 15\n${v2} = 28\n\n# Алгоритм нахождения большего числа:\nif ${v1} > ${v2}:\n    print("Большее число:", ${v1})\nelse:\n    print("Большее число:", ${v2})\n`;
  }

  if (lower.includes('двоичн') || lower.includes('бит') || lower.includes('байт')) {
    const nums = taskBody.match(/\b\d+\b/g) || ['25'];
    return `# ${title || 'Перевод в двоичную систему'}\nN = ${nums[0]}\nbinary = bin(N)[2:]\nprint(f"Число {N} в двоичной системе:", binary)\nprint("Количество единиц:", binary.count("1"))\n`;
  }

  return `# ${title || 'Решение задачи'}\n# Задайте переменные и напишите ваш код:\nprint("Программа запущена")\n`;
}

export const KegeEmulatorModal: React.FC<KegeEmulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTaskContext, currentCompetencyTitle, selectedGrade, examType } =
    useChatStore();

  const isEgeMode = examType === 'EGE' || (selectedGrade && selectedGrade >= 10);

  const [currentTaskNum, setCurrentTaskNum] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'ide' | 'table'>('ide');
  const [timeLeft, setTimeLeft] = useState(14100);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  const [pythonCode, setPythonCode] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string>(
    '# Нажмите "Запустить код", чтобы выполнить расчет в среде Python 3.12'
  );
  const [isRunningCode, setIsRunningCode] = useState(false);

  const [tableData, setTableData] = useState<string[][]>(
    Array(12)
      .fill(null)
      .map(() => Array(5).fill(''))
  );

  const resetCodeToTaskContext = useCallback(() => {
    if (isEgeMode && KEGE_TASKS_DATA[currentTaskNum]) {
      setPythonCode(KEGE_TASKS_DATA[currentTaskNum].starterCode);
    } else {
      const dynamicCode = generateStarterCodeForContext(
        currentTaskContext,
        currentCompetencyTitle
      );
      setPythonCode(dynamicCode);
    }
    setConsoleOutput('# Нажмите "Запустить код", чтобы выполнить расчет для текущей задачи');
  }, [currentTaskContext, currentCompetencyTitle, isEgeMode, currentTaskNum]);

  useEffect(() => {
    if (!isOpen) return;
    resetCodeToTaskContext();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resetCodeToTaskContext]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunPython = async () => {
    setIsRunningCode(true);
    setConsoleOutput('>>> Запуск скрипта в среде Python 3.12...\n');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/tasks/run-python`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.error) {
          setConsoleOutput(`❌ ${json.error}`);
        } else {
          setConsoleOutput(
            `>>> Python 3.12 (${isEgeMode ? 'КЕГЭ' : 'Школьный'} Runtime)\n${json.output || '[Программа завершена без вывода stdout]'}\n>>> [Выполнено успешно]`
          );
        }
      } else {
        setConsoleOutput('❌ Ошибка сервера выполнения Python.');
      }
    } catch (err: any) {
      setConsoleOutput(`❌ Ошибка выполнения: ${err.message}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleCellChange = (r: number, c: number, val: string) => {
    const updated = [...tableData.map((row) => [...row])];
    updated[r][c] = val;
    setTableData(updated);
  };

  const displayCondition =
    isEgeMode && KEGE_TASKS_DATA[currentTaskNum]
      ? KEGE_TASKS_DATA[currentTaskNum].condition
      : currentTaskContext;

  const displayTitle =
    isEgeMode && KEGE_TASKS_DATA[currentTaskNum]
      ? KEGE_TASKS_DATA[currentTaskNum].title
      : currentCompetencyTitle || 'Школьная задача';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-6xl rounded-3xl p-5 shadow-2xl flex flex-col h-[94vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3.5 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl shadow-inner">
              {isEgeMode ? <Laptop size={22} /> : <Code2 size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {isEgeMode
                    ? 'Официальная Станция КЕГЭ (Информатика)'
                    : `Интерактивная Среда Python (${selectedGrade} класс)`}
                </h2>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                  {isEgeMode ? 'ФЦТ / КЕГЭ 2024–2026' : 'Школьная песочница'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isEgeMode
                  ? 'Единый интерфейс сдачи экзамена со встроенным Python 3.12 и таблицами'
                  : 'Живой интерпретатор кода с авто-подстройкой под открытую задачу'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEgeMode && (
              <div className="flex items-center gap-2 bg-slate-50 border border-amber-300 px-3.5 py-1.5 rounded-xl">
                <Clock size={16} className="text-amber-600 animate-pulse" />
                <span className="font-mono text-sm font-black text-slate-900">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* СЕТКА ЗАДАНИЙ 1–27 (ТОЛЬКО ДЛЯ 11 КЛАССА ЕГЭ) */}
        {isEgeMode && (
          <div className="py-2.5 border-b border-slate-200 shrink-0 overflow-x-auto flex items-center gap-1.5 bg-slate-50/50 px-2 rounded-xl my-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 shrink-0">
              Задания:
            </span>
            {Array.from({ length: 27 }, (_, i) => i + 1).map((num) => {
              const isAnswered = Boolean(answers[num]?.trim());
              const isCurrent = currentTaskNum === num;
              const isFlagged = flagged[num];

              return (
                <button
                  key={num}
                  onClick={() => setCurrentTaskNum(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-black transition relative shrink-0 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : isAnswered
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {num}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ГЛАВНАЯ РАБОЧАЯ ОБЛАСТЬ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 py-3 overflow-hidden">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl">
                  {displayTitle}
                </span>
                {isEgeMode && (
                  <button
                    onClick={() =>
                      setFlagged((prev) => ({
                        ...prev,
                        [currentTaskNum]: !prev[currentTaskNum],
                      }))
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition ${
                      flagged[currentTaskNum]
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Bookmark size={13} />
                    <span>
                      {flagged[currentTaskNum] ? 'Отложено' : 'Отложить'}
                    </span>
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <KaTeXRenderer content={displayCondition} />
              </div>
            </div>

            {/* ПОЛЕ ВВОДА ОТВЕТА */}
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-2 mt-4 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 block">
                {isEgeMode
                  ? `Ответ на задание №${currentTaskNum}:`
                  : 'Итоговый результат работы алгоритма:'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={answers[currentTaskNum] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentTaskNum]: e.target.value,
                    }))
                  }
                  placeholder="Введите полученное число или строку..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  onClick={() => {
                    if (isEgeMode && currentTaskNum < 27) {
                      setCurrentTaskNum(currentTaskNum + 1);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-xs"
                >
                  <Check size={14} /> Сохранить
                </button>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: PYTHON IDE */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 p-2 bg-white shrink-0">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('ide')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'ide'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 size={14} /> 🐍 Python
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'table'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table size={14} /> 📊 Таблица
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetCodeToTaskContext}
                  title="Сбросить код к условию текущей задачи"
                  className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200/70 text-slate-600 rounded-xl text-xs transition flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  <span className="text-[10px] hidden sm:inline">Сбросить под задачу</span>
                </button>

                {activeTab === 'ide' && (
                  <button
                    onClick={handleRunPython}
                    disabled={isRunningCode}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95"
                  >
                    {isRunningCode ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Play size={13} />
                    )}
                    <span>{isRunningCode ? 'Выполнение...' : 'Запустить код'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* РЕДАКТОР КОДА */}
            {activeTab === 'ide' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200 shrink-0 text-[10px] text-slate-500">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" /> Авто-код под контекст задачи
                  </span>
                  <span className="text-slate-400">Меняйте любые числа и пишите код</span>
                </div>

                <textarea
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                  className="flex-1 bg-white p-4 font-mono text-xs text-slate-900 placeholder-slate-400 resize-none outline-none leading-relaxed border-none selection:bg-indigo-100"
                  placeholder="# Пишите код на Python здесь..."
                  spellCheck={false}
                />

                {/* КОНСОЛЬ ВЫВОДА STDOUT (АККУРАТНЫЙ СВЕТЛЫЙ ТЕРМИНАЛ) */}
                <div className="h-32 bg-slate-900 border-t border-slate-800 p-3 font-mono text-[11px] text-emerald-400 overflow-y-auto flex flex-col justify-between shrink-0">
                  <div className="flex items-center justify-between text-slate-400 text-[9px] border-b border-slate-800 pb-1 mb-1">
                    <span className="flex items-center gap-1">
                      <Terminal size={11} /> Консоль вывода (stdout)
                    </span>
                    <button
                      onClick={() => setConsoleOutput('')}
                      className="hover:text-slate-200"
                    >
                      Очистить
                    </button>
                  </div>
                  <pre className="flex-1 whitespace-pre-wrap font-mono">
                    {consoleOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* ТАБЛИЦА */}
            {activeTab === 'table' && (
              <div className="flex-1 p-3 overflow-auto bg-white">
                <div className="text-[11px] text-slate-500 mb-2 flex justify-between">
                  <span>Электронная таблица для обработки числовых данных</span>
                  <span className="text-emerald-700 font-bold">A1:E12</span>
                </div>
                <table className="w-full text-xs font-mono border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border border-slate-200 p-1 w-8 text-center">#</th>
                      {['A', 'B', 'C', 'D', 'E'].map((col) => (
                        <th key={col} className="border border-slate-200 p-1 text-center font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border border-slate-200 bg-slate-50 text-slate-500 p-1 text-center font-bold">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="border border-slate-200 p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                              className="w-full bg-transparent p-1.5 text-xs text-slate-900 outline-none focus:bg-indigo-50"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ПОДВАЛ */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>
            {isEgeMode
              ? `Отвечено на ${Object.keys(answers).length} из 27 заданий`
              : 'Интерактивная среда программирования Python 3.12'}
          </span>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            Вернуться к занятию
          </button>
        </div>
      </div>
    </div>
  );
};