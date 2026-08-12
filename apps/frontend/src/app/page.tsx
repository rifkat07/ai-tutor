import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4">
      <div className="max-w-3xl text-center space-y-6">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
          <Sparkles size={14} /> AI-Tutor v2.0 с поддержкой DeepSeek API
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Твой личный AI-репетитор для сдачи ЕГЭ на <span className="text-blue-500">80+ баллов</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg">
          Учись по методике Сократа: без готовых списанных решений, с индивидуальным Графом Знаний и проверкой вычислений в реальном времени.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/tutor"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            Начать занятие <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium px-6 py-3 rounded-xl transition"
          >
            Личный кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}