'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatMessageComponent } from './ChatMessage';
import { TutorMascot } from '@/components/mascot/TutorMascot';
import { MascotWardrobeModal } from '@/components/gamification/MascotWardrobeModal';
import { useVoiceCoPilot } from '@/hooks/useVoiceCoPilot';
import { ChatWebSocketClient, ConnectionStatus } from '@/lib/websocket';
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
  UploadCloud,
  Wifi,
  WifiOff,
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

function extractOcrTaskText(fullAiResponse: string): string | null {
  if (!fullAiResponse) return null;

  if (
    fullAiResponse.includes('Пожалуйста, загрузите') ||
    fullAiResponse.includes('Жду ваше фото') ||
    fullAiResponse.includes('Как только вы пришлете')
  ) {
    return null;
  }

  const match = fullAiResponse.match(
    /(?:Распознанный текст с фото|Распознанный текст|Условие с фото|Распознано|Условие задания|Текст задачи с фото)[:\*]*\s*([\s\S]+?)(?=(?:\n\s*🔍|\n\s*💡|\n\s*\*\*Анализ|\n\s*\*\*Сократовский|\*\*Анализ|\*\*Сократовский|\n\s*С чего начнем|\n\s*Давай решим|$))/i
  );

  if (match && match[1].trim().length > 5) {
    return match[1].trim().replace(/^\*+|\*+$/g, '').trim();
  }

  return null;
}

export const ChatBox: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMathKeyboardOpen, setIsMathKeyboardOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  const textInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsClientRef = useRef<ChatWebSocketClient | null>(null);

  const sentWithImageRef = useRef<boolean>(false);
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

  // Ссылки на стабильные коллбэки для исключения перезапусков сокета
  const callbacksRef = useRef({
    appendStreamingToken,
    setIsStreaming,
    speakText,
    resetActivityTimer,
  });

  useEffect(() => {
    callbacksRef.current = {
      appendStreamingToken,
      setIsStreaming,
      speakText,
      resetActivityTimer,
    };
  });

  const processImageFile = useCallback((file: File | Blob, customLabel: string = 'Скриншот / Фото (Vision OCR)') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setActiveCustomTask('Распознаю условие со скриншота / фото...', customLabel);
      resetActivityTimer();
    };
    reader.readAsDataURL(file);
  }, [setActiveCustomTask, resetActivityTimer]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processImageFile(blob, 'Скриншот из буфера (Ctrl+V)');
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [processImageFile]);

  // ПОСТОЯННОЕ И СТАБИЛЬНОЕ ПОДКЛЮЧЕНИЕ WEBSOCKET БЕЗ ПЕРЕЗАПУСКОВ
  useEffect(() => {
    const ws = new ChatWebSocketClient(
      'session-demo-123',
      (token) => callbacksRef.current.appendStreamingToken(token),
      () => {
        callbacksRef.current.setIsStreaming(false);
        callbacksRef.current.resetActivityTimer();

        const lastMsg = useChatStore.getState().messages.slice(-1)[0];
        if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.text) {
          if (sentWithImageRef.current) {
            const ocrText = extractOcrTaskText(lastMsg.text);
            if (ocrText) {
              useChatStore.getState().setActiveCustomTask(ocrText, 'Распознанная задача');
            }
            sentWithImageRef.current = false;
          }
          callbacksRef.current.speakText(lastMsg.text);
        }
      },
      (err) => {
        console.warn('Chat WS Error:', err);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    ws.connect();
    wsClientRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

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
          speakText('Вижу, ты задумался над задачей. Давай помогу сделать первый шаг!');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming, isSpeaking, isListening, messages, isVoiceEnabled, addMessage, speakText, resetActivityTimer]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, 'Файл скриншота / фото');
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

    sentWithImageRef.current = Boolean(selectedImage);

    const lowerInput = textToSend.toLowerCase().trim();

    const hasTaskDirective =
      lowerInput.startsWith('реши') ||
      lowerInput.startsWith('найди') ||
      lowerInput.startsWith('упрости') ||
      lowerInput.startsWith('построй') ||
      lowerInput.startsWith('вычисли') ||
      lowerInput.startsWith('докажи') ||
      lowerInput.startsWith('задача:') ||
      lowerInput.startsWith('новое задание:') ||
      lowerInput.includes('давай решим:') ||
      lowerInput.includes('другая задача:');

    const isLongProblemStatement =
      textToSend.length > 30 &&
      (lowerInput.includes('в треугольнике') ||
        lowerInput.includes('тело движется') ||
        lowerInput.includes('прямоугольном') ||
        lowerInput.includes('найдите значение выражения') ||
        lowerInput.includes('решите уравнение') ||
        lowerInput.includes('решите систему'));

    const isNewCustomTask =
      !hintType &&
      !overrideText &&
      !selectedImage &&
      (hasTaskDirective || isLongProblemStatement);

    if (isNewCustomTask) {
      setActiveCustomTask(textToSend, 'Задача из чата');
    }

    let messageForWs = textToSend;
    if (hintType) {
      const activeCtx = isNewCustomTask ? textToSend : currentTaskContext;
      messageForWs = `Решаем задачу [${currentCompetencyTitle}]:\n${activeCtx}\n\n${overrideText}`;
    }

    const userText = selectedImage
      ? `[Прикреплен скриншот / фото задания] ${textToSend}`
      : textToSend;

    const userMsg = {
      id: genId('usr'),
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(userMsg);
    if (!overrideText) setInput('');
    setIsStreaming(true);

    addMessage({
      id: genId('ast-stream'),
      sender: 'assistant' as const,
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

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
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          processImageFile(file, 'Перетащенный скриншот (Drag&Drop)');
        }
      }}
      className={`flex flex-col h-full bg-white border rounded-2xl overflow-hidden shadow-sm relative transition-all ${
        isDraggingOver ? 'border-2 border-dashed border-indigo-500 bg-indigo-50/20' : 'border-slate-200/90'
      }`}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 bg-indigo-600/10 backdrop-blur-xs flex flex-col items-center justify-center gap-2 pointer-events-none">
          <UploadCloud size={44} className="text-indigo-600 animate-bounce" />
          <span className="text-sm font-extrabold text-indigo-900 bg-white/90 px-4 py-1.5 rounded-full shadow-sm">
            Отпустите скриншот здесь для мгновенной загрузки!
          </span>
        </div>
      )}

      {/* ШАПКА ЧАТА С ИНДИКАТОРОМ СЕТИ */}
      <div className="sticky top-0 z-20 shrink-0 p-3 bg-white/95 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-2 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <TutorMascot state={getMascotState()} onClick={() => setIsWardrobeOpen(true)} />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-slate-900">{currentCompetencyTitle}</h2>
              <button
                onClick={() => setIsWardrobeOpen(true)}
                className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1 shadow-xs"
                title="Открыть магазин наград и гардероб"
              >
                💎 {crystals}
              </button>

              <button
                onClick={toggleVoice}
                className={`p-1 rounded-lg border text-xs transition flex items-center gap-1 ${
                  isVoiceEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
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

              {/* ИНДИКАТОР СТАТУСА СЕРВЕРА */}
              <button
                onClick={() => wsClientRef.current?.connect()}
                title={
                  connectionStatus === 'connected'
                    ? 'Сервер в сети (соединение стабильно)'
                    : 'Нажмите для повторного подключения'
                }
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
                }`}
              >
                {connectionStatus === 'connected' ? (
                  <>
                    <Wifi size={10} className="text-emerald-600" />
                    <span>Онлайн</span>
                  </>
                ) : connectionStatus === 'connecting' ? (
                  <>
                    <Loader2 size={10} className="animate-spin text-amber-600" />
                    <span>Связь...</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={10} className="text-rose-600" />
                    <span>Переподключить</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Уровень знания: {Math.round(pMastery * 100)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">Подсказка:</span>
          <button
            onClick={() => handleSend('Дай легкую подсказку-намёк по текущему шагу', 'light')}
            className="text-[11px] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg transition font-bold active:scale-95 shadow-xs"
          >
            🟢 Легкая
          </button>
          <button
            onClick={() => handleSend('Дай среднюю подсказку с пошаговым планом действия', 'medium')}
            className="text-[11px] bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg transition font-bold active:scale-95 shadow-xs"
          >
            🟡 Средняя
          </button>
          <button
            onClick={() => handleSend('Дай сильную подробную подсказку по текущему шагу', 'strong')}
            className="text-[11px] bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg transition font-bold active:scale-95 shadow-xs"
          >
            🔴 Сильная
          </button>
        </div>
      </div>

      {/* СООБЩЕНИЯ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <ChatMessageComponent key={`${msg.id}-${index}`} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <Loader2 size={14} className="animate-spin text-indigo-600" /> AI-репетитор размышляет...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ПРЕДПРОСМОТР СКРИНШОТА / ФОТО */}
      {selectedImage && (
        <div className="px-4 pt-2 bg-slate-100 flex items-center gap-2 shrink-0 border-t border-slate-200">
          <div className="relative border border-indigo-200 rounded-lg p-1 bg-white flex items-center gap-2 shadow-xs">
            <ImageIcon size={16} className="text-indigo-600" />
            <span className="text-xs text-slate-700 font-medium">Скриншот прикреплен (готов к Vision OCR)</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600"
              title="Удалить"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* КЛАВИАТУРА f(x) */}
      {isMathKeyboardOpen && (
        <div className="p-2.5 bg-white border-t border-slate-200 flex flex-col gap-2 transition-all animate-in fade-in duration-200 shrink-0 shadow-md">
          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 border-b border-slate-200/80 pb-1.5">
            <span className="font-semibold text-indigo-600 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" /> {adaptiveKeyboard.categoryTitle}
            </span>
            <span className="text-slate-400">Авто-адаптация под предмет</span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-start items-center max-h-36 overflow-y-auto">
            {adaptiveKeyboard.symbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(sym.insert, sym.offset)}
                title={sym.desc}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-mono font-bold transition active:scale-95 shadow-xs"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ПОЛЕ ВВОДА */}
      <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center shrink-0 shadow-sm">
        <input
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.webp,.heic,.heif"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить скриншот или фото задания (также работает Ctrl+V)"
          className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-indigo-600 rounded-xl transition"
        >
          <Paperclip size={18} />
        </button>

        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Идет запись речи... Нажмите для завершения' : 'Нажмите, чтобы надиктовать ответ голосом'}
          className={`p-2.5 border rounded-xl transition font-bold text-xs flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-md shadow-rose-600/30'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600 hover:border-slate-300'
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
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-slate-300'
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
              ? 'Скриншот прикреплен. Задай вопрос или нажми отправить...'
              : 'Задай вопрос, вставь скриншот (Ctrl+V) или надиктуй 🎙️...'
          }
          disabled={isStreaming}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition placeholder:text-slate-400 disabled:opacity-50 shadow-xs"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isStreaming || (!input.trim() && !selectedImage)}
          title="Отправить сообщение"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition font-bold shadow-md shadow-indigo-600/20 active:scale-95"
        >
          {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {isWardrobeOpen && (
        <MascotWardrobeModal isOpen={isWardrobeOpen} onClose={() => setIsWardrobeOpen(false)} />
      )}
    </div>
  );
};