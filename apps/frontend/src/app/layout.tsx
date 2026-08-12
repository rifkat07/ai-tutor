import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/Navbar';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI-Tutor v2.0 — Интерактивная подготовка к ЕГЭ/ОГЭ',
  description: 'Сократовский AI-репетитор с BKT-моделью знаний и DeepSeek API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}