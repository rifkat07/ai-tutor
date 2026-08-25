'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatMessageComponent } from '@/components/chat/ChatMessage';
import { TutorMascot } from '@/components/mascot/TutorMascot';
import { MascotWardrobeModal } from '@/components/gamification/MascotWardrobeModal';
import { useVoiceCoPilot } from '@/hooks/useVoiceCoPilot';
import { ChatWebSocketClient } from '@/lib/websocket';
import {
  Send,
  Loader2,
  Paperclip,
  X,
  Image as ImageIcon,
  Calculator,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

const genId = (prefix: string) => `${Date.now()}-${prefix}-${Math.random().toString(36).substring(2, 7)}`;

interface MathSymbol {
  label: string;
  insert: string;
  offset?: number;
  desc: string;
}

const SYMBOLS_GRADE_5_6: MathSymbol[] = [
  { label: 'a/b', insert: '/', offset: 1, desc: 'Дробь' },
  { label: '·', insert: ' * ', offset: 3, desc: 'Умножение' },
  { label: ':', insert: ' : ', offset: 3, desc: 'Деление' },
  { label: 'x²', insert: '²', offset: 1, desc: 'Квадрат' },
  { label: 'x³', insert: '³', offset: 1, desc: 'Куб' },
  { label: '( )', insert: '( )', offset: 1, desc: 'Круглые скобки' },
  { label: '%', insert: '%', offset: 1, desc: 'Процент' },
  { label: '°', insert: '°', offset: 1, desc: 'Градус' },
  { label: '<', insert: ' < ', offset: 3, desc: 'Меньше' },
  { label: '>', insert: ' > ', offset: 3, desc: 'Больше' },
  { label: '≤', insert: '≤', offset: 1, desc: 'Меньше или равно' },
  { label: '≥', insert: '≥', offset: 1, desc: 'Больше или равно' },
  { label: '≠', insert: '≠', offset: 1, desc: 'Не равно' },
  { label: '±', insert: '±', offset: 1, desc: 'Плюс-минус' },
  { label: 'P=', insert: 'P = ', offset: 4, desc: 'Периметр' },
  { label: 'S=', insert: 'S = ', offset: 4, desc: 'Площадь' },
  { label: 'см²', insert: ' см²', offset: 4, desc: 'Квадратные сантиметры' },
  { label: 'м²', insert: ' м²', offset: 3, desc: 'Квадратные метры' },
];

const SYMBOLS_GRADE_7_9: MathSymbol[] = [
  { label: 'x²', insert: '²', offset: 1, desc: 'Квадрат' },
  { label: 'x³', insert: '³', offset: 1, desc: 'Куб' },
  { label: 'xⁿ', insert: '^( )', offset: 2, desc: 'Степень n' },
  { label: '√x', insert: '√( )', offset: 2, desc: 'Квадратный корень' },
  { label: 'a/b', insert: '/', offset: 1, desc: 'Дробь' },
  { label: '±', insert: '±', offset: 1, desc: 'Плюс-минус' },
  { label: '≤', insert: '≤', offset: 1, desc: 'Меньше или равно' },
  { label: '≥', insert: '≥', offset: 1, desc: 'Больше или равно' },
  { label: '≠', insert: '≠', offset: 1, desc: 'Не равно' },
  { label: 'π', insert: 'π', offset: 1, desc: 'Число Пи' },
  { label: '∠', insert: '∠', offset: 1, desc: 'Угол' },
  { label: '△', insert: '△', offset: 1, desc: 'Треугольник' },
  { label: 'vec a', insert: 'a⃗', offset: 2, desc: 'Вектор a' },
  { label: '|x|', insert: '| |', offset: 1, desc: 'Модуль' },
  { label: 'sin', insert: 'sin( )', offset: 4, desc: 'Синус' },
  { label: 'cos', insert: 'cos( )', offset: 4, desc: 'Косинус' },
  { label: 'tg', insert: 'tg( )', offset: 3, desc: 'Тангенс' },
  { label: 'D=', insert: 'D = b² - 4ac', offset: 12, desc: 'Дискриминант' },
  { label: '{ }', insert: '{ }', offset: 1, desc: 'Фигурные скобки' },
  { label: '[ ]', insert: '[ ]', offset: 1, desc: 'Квадратные скобки' },
  { label: '( )', insert: '( )', offset: 1, desc: 'Круглые скобки' },
  { label: '°', insert: '°', offset: 1, desc: 'Градус' },
];

const SYMBOLS_GRADE_10_11: MathSymbol[] = [
  { label: 'sin', insert: 'sin( )', offset: 4, desc: 'Синус' },
  { label: 'cos', insert: 'cos( )', offset: 4, desc: 'Косинус' },
  { label: 'tg', insert: 'tg( )', offset: 3, desc: 'Тангенс' },
  { label: 'ctg', insert: 'ctg( )', offset: 4, desc: 'Котангенс' },
  { label: 'log_a', insert: 'log_{ }( )', offset: 5, desc: 'Логарифм по основанию a' },
  { label: 'log₂', insert: 'log₂( )', offset: 5, desc: 'Логарифм по основанию 2' },
  { label: 'ln', insert: 'ln( )', offset: 3, desc: 'Натуральный логарифм' },
  { label: 'xⁿ', insert: '^( )', offset: 2, desc: 'Степень n' },
  { label: 'x²', insert: '²', offset: 1, desc: 'Квадрат' },
  { label: '√x', insert: '√( )', offset: 2, desc: 'Корень' },
  { label: "f'(x)", insert: "f'(x)", offset: 5, desc: 'Производная' },
  { label: '[a; b)', insert: '[ ; )', offset: 1, desc: 'Полуинтервал' },
  { label: '(a; b)', insert: '( ; )', offset: 1, desc: 'Открытый интервал' },
  { label: '[a; b]', insert: '[ ; ]', offset: 1, desc: 'Отрезок' },
  { label: '∞', insert: '∞', offset: 1, desc: 'Бесконечность' },
  { label: '+∞', insert: '+∞', offset: 2, desc: 'Плюс бесконечность' },
  { label: '-∞', insert: '-∞', offset: 2, desc: 'Минус бесконечность' },
  { label: '∈', insert: ' ∈ ', offset: 3, desc: 'Принадлежит' },
  { label: '∪', insert: ' ∪ ', offset: 3, desc: 'Объединение множеств' },
  { label: 'π', insert: 'π', offset: 1, desc: 'Число Пи' },
  { label: 'e', insert: 'e', offset: 1, desc: 'Число Эйлера' },
  { label: '≤', insert: '≤', offset: 1, desc: 'Меньше или равно' },
  { label: '≥', insert: '≥', offset: 1, desc: 'Больше или равно' },
  { label: '≠', insert: '≠', offset: 1, desc: 'Не равно' },
  { label: '±', insert: '±', offset: 1, desc: 'Плюс-минус' },
  { label: '⇒', insert: ' ⇒ ', offset: 3, desc: 'Следовательно' },
  { label: 'a/b', insert: '/', offset: 1, desc: 'Дробь' },
];

const SYMBOLS_PHYSICS_CHEMISTRY: MathSymbol[] = [
  { label: '→', insert: ' → ', offset: 3, desc: 'Стрелка реакции' },
  { label: 'Δt', insert: 'Δt', offset: 2, desc: 'Изменение времени' },
  { label: 'Δ', insert: 'Δ', offset: 1, desc: 'Дельта' },
  { label: 'ρ', insert: 'ρ', offset: 1, desc: 'Плотность' },
  { label: 'λ', insert: 'λ', offset: 1, desc: 'Длина волны' },
  { label: '°C', insert: '°C', offset: 2, desc: 'Градусы Цельсия' },
  { label: 'м/с', insert: ' м/с', offset: 4, desc: 'Метры в секунду' },
  { label: 'м/с²', insert: ' м/с²', offset: 5, desc: 'Ускорение' },
  { label: 'Н', insert: ' Н', offset: 2, desc: 'Ньютоны' },
  { label: 'Дж', insert: ' Дж', offset: 3, desc: 'Джоули' },
  { label: 'Па', insert: ' Па', offset: 3, desc: 'Паскали' },
  { label: 'кг', insert: ' кг', offset: 3, desc: 'Килограммы' },
  { label: 'x²', insert: '²', offset: 1, desc: 'Квадрат' },
  { label: '√x', insert: '√( )', offset: 2, desc: 'Корень' },
  { label: '·', insert: ' * ', offset: 3, desc: 'Умножение' },
  { label: 'a/b', insert: '/', offset: 1, desc: 'Дробь' },
  { label: '( )', insert: '( )', offset: 1, desc: 'Скобки' },
];

function getAdaptiveSymbols(grade: number, subject: string, examType: string) {
  if (subject === 'physics' || subject === 'chemistry') {
    return {
      categoryTitle: subject === 'physics' ? 'Физика (величины и формулы)' : 'Химия (реакции и индексы)',
      symbols: SYMBOLS_PHYSICS_CHEMISTRY,
    };
  }

  if (examType === 'EGE' || grade >= 10) {
    return {
      categoryTitle: '10–11 класс (ЕГЭ • Матанализ и Профиль)',
      symbols: SYMBOLS_GRADE_10_11,
    };
  }

  if (examType === 'OGE' || grade >= 7) {
    return {
      categoryTitle: `${grade} класс (Алгебра, Геометрия, ОГЭ)`,
      symbols: SYMBOLS_GRADE_7_9,
    };
  }

  return {
    categoryTitle: `${grade} класс (Арифметика и Дроби)`,
    symbols: SYMBOLS_GRADE_5_6,
  };
}

export const ChatBox: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMathKeyboardOpen, setIsMathKeyboardOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  const textInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsClientRef = useRef<ChatWebSocketClient | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const hasPromptedInactivityRef = useRef<boolean>(false);

  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasPromptedInactivityRef.current = false;
  }, []);

  const {
    isListening,
    isSpeaking,
    isVoiceEnabled,
    toggleListening,
    speakText,
    toggleVoice,
  } = useVoiceCoPilot((voiceText) => {
    setInput((prev) => (prev ? `${prev} ${voiceText}` : voiceText));
    resetActivityTimer();
  });

  const speakTextRef = useRef(speakText);
  speakTextRef.current = speakText;

  const {
    messages,
    isStreaming,
    addMessage,
    appendStreamingToken,
    setIsStreaming,
    currentTaskContext,
    currentCompetencyTitle,
    pMastery,
    examType,
    activeSubject,
    selectedGrade,
    crystals,
    setActiveCustomTask,
  } = useChatStore();

  const adaptiveKeyboard = getAdaptiveSymbols(selectedGrade || 5, activeSubject, examType);

  // ЖЕЛЕЗОБЕТОННОЕ ПОДКЛЮЧЕНИЕ WEBSOCKET
  useEffect(() => {
    const ws = new ChatWebSocketClient(
      'session-demo-123',
      (token) => {
        useChatStore.getState().appendStreamingToken(token);
      },
      () => {
        useChatStore.getState().setIsStreaming(false);
        resetActivityTimer();

        const lastMsg = useChatStore.getState().messages.slice(-1)[0];
        if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.text.trim()) {
          speakTextRef.current(lastMsg.text);

          const fullText = lastMsg.text;
          const ocrMatch =
            fullText.match(/\*\*Распознанный текст(?: с фото)?:\*\*\s*([\s\S]*?)(?=\n\n\*\*|\n\n🔍|\n\n💡|\n\n\*\*Анализ|\n\n\*\*Сократовский|\n[🔍💡\*]|$)/i) ||
            fullText.match(/Распознанный текст(?: с фото)?:\s*([\s\S]*?)(?=\n\n|\n[🔍💡\*]|$)/i);

          if (ocrMatch && ocrMatch[1]) {
            const cleanOcr = ocrMatch[1].trim();
            if (cleanOcr.length > 8) {
              useChatStore.getState().setActiveCustomTask(cleanOcr, 'Задание с фото тетради');
            }
          }
        }
      }
    );

    ws.connect();
    wsClientRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, [resetActivityTimer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // ДЕТЕКТОР ЗАВИСАНИЯ И ПАУЗ (>35 СЕКУНД)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isStreaming || isSpeaking || isListening) {
        resetActivityTimer();
        return;
      }

      const elapsed = Date.now() - lastActivityRef.current;
      const lastMsg = messages[messages.length - 1];

      if (
        elapsed >= 35000 &&
        !hasPromptedInactivityRef.current &&
        lastMsg &&
        lastMsg.sender === 'assistant' &&
        messages.length > 0
      ) {
        hasPromptedInactivityRef.current = true;

        const nudgeText =
          '💬 *Вижу, ты задумался над этим шагом.* Давай сделаем первый толчок вместе: нажми **🟢 Легкая подсказка** или напиши, с чего хочешь начать!';

        addMessage({
          id: genId('nudge'),
          sender: 'assistant',
          text: nudgeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (isVoiceEnabled) {
          speakTextRef.current('Вижу, ты задумался над задачей. Давай помогу сделать первый шаг!');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming, isSpeaking, isListening, messages, isVoiceEnabled, addMessage, resetActivityTimer]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setActiveCustomTask('Задание с прикрепленного фото тетради (Vision OCR)...', 'Фото тетради');
        resetActivityTimer();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertSymbol = (symbolText: string, cursorOffset: number = 0) => {
    resetActivityTimer();
    if (!textInputRef.current) {
      setInput((prev) => prev + symbolText);
      return;
    }
    const start = textInputRef.current.selectionStart || input.length;
    const end = textInputRef.current.selectionEnd || input.length;
    const updated = input.substring(0, start) + symbolText + input.substring(end);
    setInput(updated);

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        const newPos = start + (cursorOffset || symbolText.length);
        textInputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleSend = (overrideText?: string, hintType?: 'light' | 'medium' | 'strong') => {
    resetActivityTimer();
    const textToSend = overrideText || input;
    if ((!textToSend.trim() && !selectedImage) || isStreaming) return;

    const lowerTrimmed = textToSend.toLowerCase().trim();
    const isNewCustomTask =
      !hintType &&
      !overrideText &&
      (lowerTrimmed.startsWith('реши:') ||
        lowerTrimmed.startsWith('найди:') ||
        lowerTrimmed.startsWith('задача:') ||
        lowerTrimmed.startsWith('пример:') ||
        lowerTrimmed.startsWith('упражнение:') ||
        lowerTrimmed.startsWith('решите уравнение') ||
        lowerTrimmed.startsWith('найдите значение выражения'));

    if (isNewCustomTask) {
      setActiveCustomTask(textToSend, 'Задача из чата');
    }

    let messageForWs = textToSend;
    if (hintType) {
      const activeCtx = isNewCustomTask ? textToSend : currentTaskContext;
      messageForWs = `Решаем задачу [${currentCompetencyTitle}]:\n${activeCtx}\n\n${overrideText}`;
    }

    const userText = selectedImage
      ? `[Прикреплено фото тетради] ${textToSend}`
      : textToSend;

    const userMsg = {
      id: genId('usr'),
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(userMsg);
    if (!overrideText) setInput('');

    const assistantMsgId = genId('ast');
    addMessage({
      id: assistantMsgId,
      sender: 'assistant' as const,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsStreaming(true);

    // Сторожевой таймер сброса зависания стриминга
    setTimeout(() => {
      if (useChatStore.getState().isStreaming) {
        useChatStore.getState().setIsStreaming(false);
      }
    }, 15000);

    wsClientRef.current?.sendMessage({
      message: messageForWs,
      image: selectedImage,
      hint_type: hintType,
      subject: activeSubject,
      exam_type: examType,
      competency: currentCompetencyTitle,
      task_context: isNewCustomTask ? textToSend : currentTaskContext,
      p_mastery: pMastery,
      history: messages.map((m) => ({ role: m.sender, content: m.text })),
    });

    setSelectedImage(null);
  };

  const getMascotState = () => {
    if (isSpeaking) return 'explaining';
    if (isListening) return 'thinking';
    if (isStreaming) return 'thinking';
    return 'idle';
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative backdrop-blur-md">
      {/* 1. ШАПКА ЧАТА (shrink-0) */}
      <div className="sticky top-0 z-20 shrink-0 p-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-2 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <TutorMascot state={getMascotState()} onClick={() => setIsWardrobeOpen(true)} />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white">{currentCompetencyTitle}</h2>
              <button
                onClick={() => setIsWardrobeOpen(true)}
                className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1"
                title="Открыть магазин наград и гардероб"
              >
                💎 {crystals}
              </button>

              <button
                onClick={toggleVoice}
                className={`p-1 rounded-lg border text-xs transition flex items-center gap-1 ${
                  isVoiceEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={
                  isVoiceEnabled
                    ? 'Голос наставника включен (нажмите, чтобы выключить)'
                    : 'Голос наставника выключен'
                }
              >
                {isVoiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span className="text-[9px] font-bold">{isVoiceEnabled ? 'Голос' : 'Без звука'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Уровень знания: {Math.round(pMastery * 100)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">Подсказка:</span>
          <button
            onClick={() => handleSend('Дай легкую подсказку-намёк по текущему шагу', 'light')}
            className="text-[11px] bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 px-2.5 py-1 rounded-lg transition font-medium active:scale-95"
          >
            🟢 Легкая
          </button>
          <button
            onClick={() => handleSend('Дай среднюю подсказку с пошаговым планом действия', 'medium')}
            className="text-[11px] bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-400 px-2.5 py-1 rounded-lg transition font-medium active:scale-95"
          >
            🟡 Средняя
          </button>
          <button
            onClick={() => handleSend('Дай сильную подробную подсказку по текущему шагу', 'strong')}
            className="text-[11px] bg-slate-900 border border-slate-800 hover:border-red-500/50 text-red-400 px-2.5 py-1 rounded-lg transition font-medium active:scale-95"
          >
            🔴 Сильная
          </button>
        </div>
      </div>

      {/* 2. СПИСОК СООБЩЕНИЙ (СВОЙСТВО min-h-0 ПРЕДОТВРАЩАЕТ ВЫТАЛКИВАНИЕ СТРОКИ ВВОДА!) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessageComponent key={`${msg.id}-${index}`} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Loader2 size={14} className="animate-spin text-blue-500" /> AI-репетитор размышляет...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. ПРЕВЬЮ ПРИКРЕПЛЕННОГО ФОТО */}
      {selectedImage && (
        <div className="px-4 pt-2 bg-slate-950 flex items-center gap-2 shrink-0">
          <div className="relative border border-indigo-500/50 rounded-lg p-1 bg-slate-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-indigo-400" />
            <span className="text-xs text-slate-300">Фото тетради прикреплено</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 4. ВЫДВИЖНАЯ КЛАВИАТУРА f(x) */}
      {isMathKeyboardOpen && (
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex flex-col gap-2 shrink-0 transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 border-b border-slate-800/60 pb-1.5">
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" /> {adaptiveKeyboard.categoryTitle}
            </span>
            <span className="text-slate-500">Авто-адаптация под предмет</span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-start items-center max-h-32 overflow-y-auto">
            {adaptiveKeyboard.symbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(sym.insert, sym.offset)}
                title={sym.desc}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white rounded-lg text-xs font-mono font-bold transition active:scale-95 shadow-sm"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. НИЖНЯЯ ПАНЕЛЬ ВВОДА С МИКРОФОНОМ (shrink-0 z-10 ЖЕЛЕЗНО ВИДНА ВСЕГДА!) */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center shrink-0 z-10">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить фото тетради"
          className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-400 rounded-xl transition"
        >
          <Paperclip size={18} />
        </button>

        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Идет запись речи... Нажмите для завершения' : 'Нажмите, чтобы надиктовать ответ голосом'}
          className={`p-2.5 border rounded-xl transition font-bold text-xs flex items-center justify-center ${
            isListening
              ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-600/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:border-slate-700'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setIsMathKeyboardOpen((prev) => !prev)}
          title="Математическая клавиатура"
          className={`p-2.5 border rounded-xl transition font-bold text-xs flex items-center justify-center ${
            isMathKeyboardOpen
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700'
          }`}
        >
          <Calculator size={18} />
        </button>

        <input
          ref={textInputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            resetActivityTimer();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
            resetActivityTimer();
          }}
          placeholder={
            isListening
              ? '🎤 Слушаю тебя...'
              : selectedImage
              ? 'Опиши задачу с фото или просто отправь...'
              : 'Задай вопрос или введи шаг...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-500"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isStreaming || (!input.trim() && !selectedImage)}
          title="Отправить сообщение"
          className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-xl transition font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ГАРДЕРОБА И МАГАЗИНА */}
      {isWardrobeOpen && (
        <MascotWardrobeModal isOpen={isWardrobeOpen} onClose={() => setIsWardrobeOpen(false)} />
      )}
    </div>
  );
};