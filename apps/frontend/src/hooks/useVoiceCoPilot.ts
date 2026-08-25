'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceCoPilot(onTranscriptUpdate?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);

  // 1. Инициализация Speech-to-Text (STT) на устройстве ученика
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        if (onTranscriptUpdate) {
          onTranscriptUpdate(currentText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptUpdate]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening]);

  // 2. Очистка формул и разметки для приятного и понятного звучания
  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$([^\$\n]+?)\$/g, '$1')
      .replace(/\\sin/g, ' синус ')
      .replace(/\\cos/g, ' косинус ')
      .replace(/\\tan|\\tg/g, ' тангенс ')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, ' $1 разделить на $2 ')
      .replace(/\\sqrt\{([^{}]+)\}/g, ' корень из $1 ')
      .replace(/\^2|²/g, ' в квадрате ')
      .replace(/\^3|³/g, ' в кубе ')
      .replace(/\\pm|±/g, ' плюс минус ')
      .replace(/\\le|≤/g, ' меньше или равно ')
      .replace(/\\ge|≥/g, ' больше или равно ')
      .replace(/\\ne|≠/g, ' не равно ')
      .replace(/\\cdot|·|\*/g, ' умножить на ')
      .replace(/\\log_\{([^{}]+)\}\(([^()]+)\)/g, ' логарифм $2 по основанию $1 ')
      .replace(/[*_#`]/g, '')
      .replace(/\[Прикреплено фото тетради\]/g, '')
      .trim();
  };

  // 3. Озвучка Text-to-Speech (TTS)
  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !isVoiceEnabled || !('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang.includes('ru') || v.lang.includes('RU'));
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isVoiceEnabled]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleVoice = () => {
    if (isSpeaking) stopSpeaking();
    setIsVoiceEnabled((prev) => !prev);
  };

  return {
    isListening,
    isSpeaking,
    isVoiceEnabled,
    transcript,
    toggleListening,
    speakText,
    stopSpeaking,
    toggleVoice,
  };
}