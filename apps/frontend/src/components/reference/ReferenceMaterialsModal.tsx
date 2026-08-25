'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, FileSpreadsheet, Search, Filter } from 'lucide-react';

interface ReferenceMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceMaterialsModal: React.FC<ReferenceMaterialsModalProps> = ({ isOpen, onClose }) => {
  const { activeSubject, selectedGrade } = useChatStore();
  const [currentTab, setCurrentTab] = useState<string>(activeSubject || 'math');
  const [gradeFilter, setGradeFilter] = useState<string>(selectedGrade ? String(selectedGrade) : 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const matchesSearch = (keywords: string) => {
    if (!searchQuery.trim()) return true;
    return keywords.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const matchesGrade = (targetGrades: number[]) => {
    if (gradeFilter === 'all') return true;
    const g = parseInt(gradeFilter, 10);
    return targetGrades.includes(g);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-5xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden text-slate-900">
        
        {/* 1. Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl shadow-inner">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Энциклопедический Справочник КИМ (5–11 кл • ОГЭ • ЕГЭ)
                </h2>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                  ФИПИ 2024–2026 • 5X БАЗА
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Исчерпывающий банк формул, теорем, констант и правил по всем 7 школьным предметам
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

        {/* 2. Поисковая строка и фильтр по классам */}
        <div className="py-2.5 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center shrink-0">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск формулы (например: Пифагор, Конус, Производная, Логарифм, Н и НН, Менделеев, Python, Ом)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
          
          {/* Селектор классов */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl shrink-0 overflow-x-auto">
            <Filter size={13} className="text-slate-400 ml-1.5 mr-0.5 shrink-0" />
            {['all', '5', '6', '7', '8', '9', '10', '11'].map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                  gradeFilter === g
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'all' ? 'Все кл' : `${g} кл`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Вкладки предметов */}
        <div className="flex flex-wrap gap-1.5 py-2 border-b border-slate-200 shrink-0">
          {[
            { id: 'math', label: '📐 Математика & Алгебра' },
            { id: 'geometry', label: '📐 Геометрия & Стереометрия' },
            { id: 'physics', label: '⚡ Физика (Все разделы)' },
            { id: 'chemistry', label: '🧪 Химия & Таблицы' },
            { id: 'cs', label: '💻 Информатика & Python' },
            { id: 'russian', label: '📚 Русский Язык & Правила' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                currentTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Контент справочника */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          
          {/* 1. МАТЕМАТИКА И АЛГЕБРА */}
          {(currentTab === 'math' || currentTab === 'algebra') && (
            <div className="space-y-4">
              
              {matchesGrade([5, 6]) && matchesSearch('арифметика порядок действий дроби пропорции проценты нок нод модуль') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Базовая Арифметика, Дроби и Пропорции (5–6 классы):</span>
                    <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">5–6 классы</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Порядок действий и Дроби:</p>
                      <KaTeXRenderer content="$$\text{Порядок:} \quad (\dots) \implies [\cdot, :] \implies [+, -]$$" />
                      <KaTeXRenderer content="$$\frac{a}{c} \pm \frac{b}{c} = \frac{a \pm b}{c}, \quad \frac{a}{b} \cdot \frac{c}{d} = \frac{ac}{bd}, \quad \frac{a}{b} : \frac{c}{d} = \frac{ad}{bc}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">НОК, Пропорции и Проценты:</p>
                      <KaTeXRenderer content="$$\text{НОК}(a, b) = \frac{a \cdot b}{\text{НОД}(a, b)}, \quad \frac{a}{b} = \frac{c}{d} \implies ad = bc$$" />
                      <KaTeXRenderer content="$$p\% = \frac{p}{100}, \quad B = A \cdot \frac{p}{100}, \quad |x| = \begin{cases} x, & x \ge 0 \\ -x, & x < 0 \end{cases}$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([7, 8, 9, 10, 11]) && matchesSearch('таблица квадратов кубов степени двойки') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Таблица квадратов двузначных чисел (10² – 99²):</span>
                    <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">ОГЭ / ЕГЭ</span>
                  </h3>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-[11px] font-mono">
                    {[
                      { n: '11²', v: '121' }, { n: '12²', v: '144' }, { n: '13²', v: '169' }, { n: '14²', v: '196' }, { n: '15²', v: '225' },
                      { n: '16²', v: '256' }, { n: '17²', v: '289' }, { n: '18²', v: '324' }, { n: '19²', v: '361' }, { n: '20²', v: '400' },
                      { n: '21²', v: '441' }, { n: '22²', v: '484' }, { n: '23²', v: '529' }, { n: '24²', v: '576' }, { n: '25²', v: '625' },
                      { n: '26²', v: '676' }, { n: '27²', v: '729' }, { n: '28²', v: '784' }, { n: '29²', v: '841' }, { n: '30²', v: '900' },
                      { n: '31²', v: '961' }, { n: '32²', v: '1024' }, { n: '35²', v: '1225' }, { n: '40²', v: '1600' }, { n: '45²', v: '2025' },
                      { n: '50²', v: '2500' }, { n: '60²', v: '3600' }, { n: '70²', v: '4900' }, { n: '80²', v: '6400' }, { n: '90²', v: '8100' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-indigo-600 block text-[9px] font-bold">{item.n}</span>
                        <strong className="text-slate-900 text-xs">{item.v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchesGrade([7, 8, 9, 10, 11]) && matchesSearch('фсу степени корни формулы сокращенного умножения кубы') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    ФСУ, Свойства степеней и Арифметических корней:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">ФСУ (2-я и 3-я степени):</p>
                      <KaTeXRenderer content="$$(a \pm b)^2 = a^2 \pm 2ab + b^2, \quad a^2 - b^2 = (a-b)(a+b)$$" />
                      <KaTeXRenderer content="$$(a \pm b)^3 = a^3 \pm 3a^2b + 3ab^2 \pm b^3$$" />
                      <KaTeXRenderer content="$$a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Свойства степеней и корней:</p>
                      <KaTeXRenderer content="$$a^n \cdot a^m = a^{n+m}, \quad \frac{a^n}{a^m} = a^{n-m}, \quad (a^n)^m = a^{nm}, \quad a^{-n} = \frac{1}{a^n}$$" />
                      <KaTeXRenderer content="$$a^{\frac{m}{n}} = \sqrt[n]{a^m}, \quad \sqrt{ab} = \sqrt{a}\sqrt{b}, \quad \sqrt{\frac{a}{b}} = \frac{\sqrt{a}}{\sqrt{b}}, \quad \sqrt{a^2} = |a|$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([8, 9, 10, 11]) && matchesSearch('квадратные уравнения дискриминант виет прогрессия') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Квадратные уравнения, Теорема Виета и Прогрессии (8–11 классы):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$ax^2 + bx + c = 0, \quad D = b^2 - 4ac, \quad x_{1,2} = \frac{-b \pm \sqrt{D}}{2a}$$" />
                      <KaTeXRenderer content="$$D_1 = (b/2)^2 - ac, \quad x_{1,2} = \frac{-(b/2) \pm \sqrt{D_1}}{a}$$" />
                      <KaTeXRenderer content="$$x_1 + x_2 = -\frac{b}{a}, \quad x_1 x_2 = \frac{c}{a}, \quad ax^2+bx+c = a(x-x_1)(x-x_2)$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Арифметическая и Геометрическая прогрессии:</p>
                      <KaTeXRenderer content="$$a_n = a_1 + d(n-1), \quad S_n = \frac{a_1 + a_n}{2} \cdot n = \frac{2a_1 + d(n-1)}{2} \cdot n$$" />
                      <KaTeXRenderer content="$$b_n = b_1 \cdot q^{n-1}, \quad S_n = \frac{b_1(q^n - 1)}{q - 1}, \quad S = \frac{b_1}{1-q} \quad (|q|<1)$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([10, 11]) && matchesSearch('логарифм ln log рационализация свойства') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Все свойства Логарифмов и Метод Рационализации (ЕГЭ №6, №15):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$a^{\log_a b} = b, \quad \log_a a = 1, \quad \log_a 1 = 0, \quad \log_a(bc) = \log_a b + \log_a c$$" />
                      <KaTeXRenderer content="$$\log_a\left(\frac{b}{c}\right) = \log_a b - \log_a c, \quad \log_{a^k}(b^m) = \frac{m}{k}\log_a b$$" />
                      <KaTeXRenderer content="$$\log_a b = \frac{\log_c b}{\log_c a} = \frac{1}{\log_b a}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Метод рационализации (ЕГЭ №15):</p>
                      <KaTeXRenderer content="$$\log_a f - \log_a g \iff (a-1)(f-g) \quad (a>0, a\ne 1, f>0, g>0)$$" />
                      <KaTeXRenderer content="$$\log_{h(x)} f(x) \ge 0 \iff (h(x)-1)(f(x)-1) \ge 0$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([9, 10, 11]) && matchesSearch('тригонометрия sin cos tg ctg пи круг формулы приведения') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Тригонометрия: Таблица углов, Формулы двойного угла и Приведения (ЕГЭ №13):
                  </h3>
                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                          <th className="p-2">Функция</th>
                          <th className="p-2">0° (0)</th>
                          <th className="p-2">30° (π/6)</th>
                          <th className="p-2">45° (π/4)</th>
                          <th className="p-2">60° (π/3)</th>
                          <th className="p-2">90° (π/2)</th>
                          <th className="p-2">180° (π)</th>
                          <th className="p-2">270° (3π/2)</th>
                          <th className="p-2">360° (2π)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-900 font-mono">
                        <tr className="border-b border-slate-100">
                          <td className="p-2 font-bold text-emerald-700">sin α</td>
                          <td>0</td>
                          <td>1/2</td>
                          <td>√2/2</td>
                          <td>√3/2</td>
                          <td>1</td>
                          <td>0</td>
                          <td>-1</td>
                          <td>0</td>
                        </tr>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <td className="p-2 font-bold text-emerald-700">cos α</td>
                          <td>1</td>
                          <td>√3/2</td>
                          <td>√2/2</td>
                          <td>1/2</td>
                          <td>0</td>
                          <td>-1</td>
                          <td>0</td>
                          <td>1</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-emerald-700">tg α</td>
                          <td>0</td>
                          <td>√3/3</td>
                          <td>1</td>
                          <td>√3</td>
                          <td className="text-slate-400">—</td>
                          <td>0</td>
                          <td className="text-slate-400">—</td>
                          <td>0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <KaTeXRenderer content="$$\sin^2 x + \cos^2 x = 1, \quad \sin(2x) = 2\sin x \cos x$$" />
                      <KaTeXRenderer content="$$\cos(2x) = \cos^2 x - \sin^2 x = 2\cos^2 x - 1 = 1 - 2\sin^2 x$$" />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <KaTeXRenderer content="$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta$$" />
                      <KaTeXRenderer content="$$\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([10, 11]) && matchesSearch('производная первообразная касательная интеграл экстремум') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Таблица производных, Уравнение касательной и Первообразные (ЕГЭ №8, №12):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$(C)' = 0, \quad (x^n)' = n x^{n-1}, \quad (\sqrt{x})' = \frac{1}{2\sqrt{x}}, \quad (e^x)' = e^x$$" />
                      <KaTeXRenderer content="$$(\sin x)' = \cos x, \quad (\cos x)' = -\sin x, \quad (\ln x)' = \frac{1}{x}, \quad (a^x)' = a^x \ln a$$" />
                      <KaTeXRenderer content="$$(\text{tg } x)' = \frac{1}{\cos^2 x}, \quad (\text{ctg } x)' = -\frac{1}{\sin^2 x}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Геометрический смысл и Касательная:</p>
                      <KaTeXRenderer content="$$k = f'(x_0) = \text{tg }\alpha, \quad y = f(x_0) + f'(x_0)(x - x_0)$$" />
                      <KaTeXRenderer content="$$(uv)' = u'v + uv', \quad \left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}, \quad (f(g(x)))' = f'(g(x))g'(x)$$" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 2. ГЕОМЕТРИЯ И СТЕРЕОМЕТРИЯ */}
          {currentTab === 'geometry' && (
            <div className="space-y-4">
              
              {matchesGrade([7, 8, 9, 10, 11]) && matchesSearch('планиметрия треугольник трапеция ромб параллелограмм круг пифагор') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Планиметрия: Площади фигур и Основные теоремы:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-semibold text-slate-700">Треугольник (все формулы):</p>
                      <KaTeXRenderer content="$$S = \frac{1}{2}ah = \frac{1}{2}ab\sin\gamma = \sqrt{p(p-a)(p-b)(p-c)} = pr = \frac{abc}{4R}$$" />
                      <KaTeXRenderer content="$$S_{\text{равностр}} = \frac{a^2\sqrt{3}}{4}, \quad h = \frac{a\sqrt{3}}{2}, \quad r = \frac{a\sqrt{3}}{6}, \quad R = \frac{a\sqrt{3}}{3}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-semibold text-slate-700">Четырехугольники и Окружности:</p>
                      <KaTeXRenderer content="$$S_{\text{пар}} = ah = ab\sin\gamma, \quad S_{\text{ромб}} = \frac{1}{2}d_1 d_2 = ah$$" />
                      <KaTeXRenderer content="$$S_{\text{трап}} = \frac{a+b}{2}h = mh, \quad S_{\text{круга}} = \pi R^2, \quad L = 2\pi R$$" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs mt-2 text-slate-900">
                    <KaTeXRenderer content="$$c^2 = a^2 + b^2, \quad a^2 = b^2 + c^2 - 2bc\cos\alpha, \quad \frac{a}{\sin\alpha} = \frac{b}{\sin\beta} = \frac{c}{\sin\gamma} = 2R$$" />
                  </div>
                </div>
              )}

              {matchesGrade([10, 11]) && matchesSearch('стереометрия объем цилиндр конус шар сфера пирамида призма') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Стереометрия: Объемы и Площади поверхностей (ЕГЭ №3, №14):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-semibold text-slate-700">Тела вращения (Цилиндр, Конус, Шар):</p>
                      <KaTeXRenderer content="$$V_{\text{цил}} = \pi R^2 h, \quad S_{\text{бок}} = 2\pi Rh, \quad S_{\text{полн}} = 2\pi R(R+h)$$" />
                      <KaTeXRenderer content="$$V_{\text{кон}} = \frac{1}{3}\pi R^2 h, \quad S_{\text{бок}} = \pi R l \quad (l = \sqrt{R^2+h^2})$$" />
                      <KaTeXRenderer content="$$V_{\text{шара}} = \frac{4}{3}\pi R^3, \quad S_{\text{сферы}} = 4\pi R^2$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="font-semibold text-slate-700">Многогранники (Призма, Пирамида):</p>
                      <KaTeXRenderer content="$$V_{\text{призмы}} = S_{\text{осн}} h, \quad V_{\text{куба}} = a^3, \quad d_{\text{куба}} = a\sqrt{3}$$" />
                      <KaTeXRenderer content="$$V_{\text{пир}} = \frac{1}{3}S_{\text{осн}} h, \quad S_{\text{бок}} = \frac{1}{2}P_{\text{осн}} h_{\text{ап}}$$ " />
                      <KaTeXRenderer content="$$d_{\text{пар}}^2 = a^2 + b^2 + c^2 \quad (\text{Диагональ параллелепипеда})$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesGrade([9, 10, 11]) && matchesSearch('векторы координаты скалярное произведение длина') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Векторы на плоскости и в пространстве (ЕГЭ №2):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$\vec{a} = (x_2 - x_1; y_2 - y_1), \quad |\vec{a}| = \sqrt{x^2 + y^2}$$" />
                      <KaTeXRenderer content="$$\vec{a} \pm \vec{b} = (x_a \pm x_b; y_a \pm y_b), \quad k\vec{a} = (kx_a; ky_a)$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$\vec{a} \cdot \vec{b} = x_1 x_2 + y_1 y_2 + z_1 z_2 = |\vec{a}||\vec{b}|\cos\alpha$$" />
                      <KaTeXRenderer content="$$\cos\alpha = \frac{\vec{a} \cdot \vec{b}}{|\vec{a}||\vec{b}|}, \quad \vec{a} \perp \vec{b} \iff \vec{a} \cdot \vec{b} = 0$$" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. ФИЗИКА */}
          {currentTab === 'physics' && (
            <div className="space-y-4">
              
              {matchesSearch('константы ускорение скорость света постоянная авогадро плотность') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Фундаментальные физические константы ФИПИ:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                      <span className="text-slate-500 block text-[9px]">Ускорение св. падения:</span>
                      <strong className="text-slate-900 font-bold">g = 10 м/с²</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                      <span className="text-slate-500 block text-[9px]">Скорость света:</span>
                      <strong className="text-slate-900 font-bold">c = 3·10⁸ м/с</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                      <span className="text-slate-500 block text-[9px]">Газовая постоянная:</span>
                      <strong className="text-slate-900 font-bold">R = 8.31 Дж/(моль·К)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                      <span className="text-slate-500 block text-[9px]">Число Авогадро:</span>
                      <strong className="text-slate-900 font-bold">N_A = 6.02·10²³</strong>
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('механика ньютон импульс кинематика энергия архимед гидростатика') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    1. Механика, Кинематика, Динамика и Гидростатика:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$v(t) = v_0 + at, \quad s = v_0 t + \frac{at^2}{2} = \frac{v^2 - v_0^2}{2a}$$" />
                      <KaTeXRenderer content="$$F = ma, \quad F_{\text{тр}} = \mu N, \quad F_{\text{упр}} = -kx, \quad F_{\text{тяж}} = mg$$" />
                      <KaTeXRenderer content="$$F_{\text{Арх}} = \rho_{\text{ж}} g V_{\text{погр}}, \quad p = \rho g h, \quad N = \frac{A}{t} = Fv$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$p = mv, \quad \vec{p}_1 + \vec{p}_2 = \text{const} \quad (\text{ЗСИ})$$" />
                      <KaTeXRenderer content="$$E_k = \frac{mv^2}{2}, \quad E_p = mgh = \frac{kx^2}{2}, \quad A = F s \cos\alpha$$" />
                      <KaTeXRenderer content="$$T = 2\pi\sqrt{\frac{l}{g}} \quad (\text{Мат. маятник}), \quad T = 2\pi\sqrt{\frac{m}{k}} \quad (\text{Пружинный})$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('мкт газ теплота кпд менделеев термодинамика карно') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    2. МКТ, Газовые законы и Термодинамика:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$pV = \nu RT = \frac{m}{M}RT, \quad p = nkT = \frac{1}{3}nm_0 v_{\text{кв}}^2$$" />
                      <KaTeXRenderer content="$$U = \frac{3}{2}\nu RT, \quad A = p\Delta V, \quad Q = \Delta U + A$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$Q = cm\Delta t, \quad Q = \lambda m \quad (\text{плавление}), \quad Q = Lm \quad (\text{парообр.})$$" />
                      <KaTeXRenderer content="$$\eta = \frac{Q_1 - Q_2}{Q_1} = \frac{T_1 - T_2}{T_1} \quad (\text{Цикл Карно}), \quad \varphi = \frac{p}{p_{\text{нас}}} \cdot 100\%$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('ток кулон ом мощность конденсатор индуктивность ампер лоренц') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    3. Электродинамика, Магнетизм и Колебательный контур:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$F = k\frac{|q_1 q_2|}{r^2}, \quad I = \frac{U}{R}, \quad I = \frac{\mathcal{E}}{R+r}, \quad R = \rho\frac{l}{S}$$" />
                      <KaTeXRenderer content="$$P = UI = I^2 R = \frac{U^2}{R}, \quad Q = I^2 R t \quad (\text{Джоуль-Ленц})$$" />
                      <KaTeXRenderer content="$$C = \frac{q}{U} = \frac{\varepsilon \varepsilon_0 S}{d}, \quad W = \frac{CU^2}{2} = \frac{q^2}{2C}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$F_{\text{Амп}} = I B L \sin\alpha, \quad F_{\text{Лор}} = q v B \sin\alpha$$" />
                      <KaTeXRenderer content="$$\mathcal{E}_i = -\frac{\Delta\Phi}{\Delta t}, \quad \Phi = B S \cos\alpha, \quad W_L = \frac{LI^2}{2}$$" />
                      <KaTeXRenderer content="$$T = 2\pi\sqrt{LC} \quad (\text{Формула Томсона})$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('оптика снеллиус линза фотоэффект эйнштейн де бройль') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    4. Оптика и Квантовая физика:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$\frac{\sin\alpha}{\sin\beta} = \frac{n_2}{n_1}, \quad D = \frac{1}{F} = \frac{1}{d} + \frac{1}{f}, \quad \Gamma = \frac{f}{d}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$E = h\nu = \frac{hc}{\lambda}, \quad h\nu = A_{\text{вых}} + \frac{mv_{\text{max}}^2}{2}, \quad p = \frac{h}{\lambda}$$" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 4. ХИМИЯ */}
          {currentTab === 'chemistry' && (
            <div className="space-y-4">
              
              {matchesSearch('металлы ряд напряжений активность') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Электрохимический ряд напряжений (активности) металлов:
                  </h3>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto whitespace-nowrap shadow-2xs">
                    Li → K → Ba → Ca → Na → Mg → Al → Zn → Cr → Fe → Ni → Sn → Pb → (H₂) → Cu → Hg → Ag → Pt → Au
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Металлы до водорода (H₂) вытесняют H₂ из растворов кислот-неокислителей.
                  </p>
                </div>
              )}

              {matchesSearch('молярная масса объем концентрация доля плотность') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Основные расчетные формулы неорганической и общей химии:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$n = \frac{m}{M} = \frac{V}{V_m} = \frac{N}{N_A}$$" />
                      <KaTeXRenderer content="$$V_m = 22.4\text{ л/моль (н.у.)}, \quad N_A = 6.02 \cdot 10^{23}\text{ моль}^{-1}$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <KaTeXRenderer content="$$w = \frac{m_{\text{в-ва}}}{m_{\text{р-ра}}} \cdot 100\%, \quad \rho = \frac{m}{V}, \quad C_M = \frac{n}{V_{\text{л}}}$$" />
                      <KaTeXRenderer content="$$m_{\text{р-ра}} = m_{\text{в-ва}} + m_{\text{воды}} = V_{\text{р-ра}} \cdot \rho$$" />
                    </div>
                  </div>
                </div>
              )}

              {/* ОРГАНИЧЕСКИЕ КЛАССЫ С ЭКРАНИРОВАНИЕМ СТРОК ДЛЯ JSX */}
              {matchesSearch('органика алканы алкены алкины спирты кислоты углеводороды') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Общие формулы классов органических соединений (10–11 кл):
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-indigo-600 block text-[10px] font-bold">Алканы:</span>
                      <strong className="text-slate-900">{'C_n H_{2n+2}'}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-indigo-600 block text-[10px] font-bold">Алкены:</span>
                      <strong className="text-slate-900">{'C_n H_{2n}'}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-indigo-600 block text-[10px] font-bold">Алкины / Диены:</span>
                      <strong className="text-slate-900">{'C_n H_{2n-2}'}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-indigo-600 block text-[10px] font-bold">Спирты:</span>
                      <strong className="text-slate-900">{'C_n H_{2n+1}OH'}</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 5. ИНФОРМАТИКА */}
          {currentTab === 'cs' && (
            <div className="space-y-4">
              
              {matchesSearch('степени двойки байты кбайты') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Таблица степеней двойки и единицы информации (Основа КЕГЭ):
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center text-xs font-mono">
                    {[
                      { p: '2⁰', v: '1' }, { p: '2¹', v: '2' }, { p: '2²', v: '4' }, { p: '2³', v: '8' },
                      { p: '2⁴', v: '16' }, { p: '2⁵', v: '32' }, { p: '2⁶', v: '64' }, { p: '2⁷', v: '128' },
                      { p: '2⁸', v: '256' }, { p: '2⁹', v: '512' }, { p: '2¹⁰', v: '1024' }, { p: '2¹¹', v: '2048' },
                      { p: '2¹²', v: '4096' }, { p: '2¹³', v: '8192' }, { p: '2¹⁴', v: '16384' }, { p: '2¹⁶', v: '65536' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-indigo-600 block text-[9px] font-bold">{item.p}</span>
                        <strong className="text-slate-900 text-xs">{item.v}</strong>
                      </div>
                    ))}
                  </div>
                  {/* ИСПРАВЛЕННАЯ СТРОКА С БАЙТАМИ */}
                  <div className="text-[10px] text-slate-500 pt-1 font-mono">
                    {'1 Байт = 8 бит, 1 Кбайт = 1024 Байт, 1 Мбайт = 1024 Кбайт, 1 Гбайт = 1024 Мбайт'}
                  </div>
                </div>
              )}

              {matchesSearch('кодирование звук графика комбинаторика алфавит передача') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Формулы кодирования и Комбинаторика КЕГЭ:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Кодирование звука, изображений и файлов:</p>
                      <KaTeXRenderer content="$$I_{\text{граф}} = K \cdot i, \quad N = 2^i \quad (K = X \times Y)$$" />
                      <KaTeXRenderer content="$$I_{\text{звук}} = f \cdot i \cdot t \cdot k \quad (k = 1 \text{ моно}, 2 \text{ стерео})$$" />
                      <KaTeXRenderer content="$$Q = v \cdot t \quad (\text{Передача данных})$$" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-700">Комбинаторика и алфавит:</p>
                      <KaTeXRenderer content="$$N = M^L \quad (\text{Слов длины } L \text{ из алфавита мощности } M)$$" />
                      <KaTeXRenderer content="$$P_n = n!, \quad C_n^k = \frac{n!}{k!(n-k)!}$$" />
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('python методы функции списки itertools') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Шпаргалка Python для КЕГЭ (Задания №2, 8, 14, 17, 24, 26, 27):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-800">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <p>• `bin(x)[2:]` — перевод в двоичную</p>
                      <p>• `hex(x)[2:]` — перевод в шестнадцатеричную</p>
                      <p>• `int('1011', 2)` — перевод из двоичной в десятичную</p>
                      <p>• `s.count('1')` — подсчет вхождений</p>
                      <p>• `s.replace('A', 'B')` — замена подстроки</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <p>• `from itertools import product, permutations`</p>
                      <p>• `from functools import lru_cache`</p>
                      <p>• `import sys; sys.setrecursionlimit(5000)`</p>
                      <p>• `lines = open('24.txt').readline()`</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 6. РУССКИЙ ЯЗЫК */}
          {currentTab === 'russian' && (
            <div className="space-y-4">
              
              {matchesSearch('н и нн причастия прилагательные суффиксы') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Правописание -Н- и -НН- во всех частях речи (ЕГЭ №15):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <strong className="text-emerald-700 block font-bold">Пишется НН:</strong>
                      <p className="text-slate-700 text-[11px]">1. В полных причастиях с приставками (кроме НЕ): *написанный*.</p>
                      <p className="text-slate-700 text-[11px]">2. Есть зависимое слово: *жаренный на масле карась*.</p>
                      <p className="text-slate-700 text-[11px]">3. От глаголов сов. вида: *решённая задача*.</p>
                      <p className="text-slate-700 text-[11px]">4. Суффиксы -ОВА-/-ЕВА-/-ИРОВА-: *маринованный*.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <strong className="text-amber-700 block font-bold">Исключения и Н:</strong>
                      <p className="text-slate-700 text-[11px]">• *Стеклянный, оловянный, деревянный* (НН в прил.).</p>
                      <p className="text-slate-700 text-[11px]">• *Ветреный* (Н, но *безветренный* с НН).</p>
                      <p className="text-slate-700 text-[11px]">• *Кованый, жёваный* (Н, если нет зависимых слов).</p>
                      <p className="text-slate-700 text-[11px]">• В кратких причастиях всегда Н: *задача решена*.</p>
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('чередование корни гар гор лаг лож раст ращ рос бер бир') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Корни с чередованием гласных (ЕГЭ №9):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-900">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-700 block text-[11px] font-bold">От ударения:</strong>
                      <p className="text-slate-700 text-[10px] mt-1">• *гар/гор* (под удар. А: загар, без удар. О: загорелый)</p>
                      <p className="text-slate-700 text-[10px]">• *зар/зор* (под удар. О/А, без удар. А: заря)</p>
                      <p className="text-slate-700 text-[10px]">• *клон/клан, твор/твар*</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-700 block text-[11px] font-bold">От суффикса -А-:</strong>
                      <p className="text-slate-700 text-[10px] mt-1">• *лаг/лож* (полагать / положить)</p>
                      <p className="text-slate-700 text-[10px]">• *кас/кос* (касаться / коснуться)</p>
                      <p className="text-slate-700 text-[10px]">• *бер/бир, тер/тир, мер/мир, пер/пир*</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <strong className="text-indigo-700 block text-[11px] font-bold">От согласной на конце:</strong>
                      <p className="text-slate-700 text-[10px] mt-1">• *раст/ращ/рос* (растение, выращенный, вырос)</p>
                      <p className="text-slate-700 text-[10px]">• *скак/скоч* (скакать / вскочить)</p>
                    </div>
                  </div>
                </div>
              )}

              {matchesSearch('не слитно раздельно причастия глаголы') && (
                <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Правописание НЕ слитно и раздельно (ЕГЭ №13):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <strong className="text-amber-800 block font-bold">Всегда раздельно:</strong>
                      <p className="text-slate-700 text-[11px]">• С глаголами и деепричастиями: *не знал, не зная*.</p>
                      <p className="text-slate-700 text-[11px]">• С краткими причастиями: *работа не закончена*.</p>
                      <p className="text-slate-700 text-[11px]">• При наличии противопоставления с союзом А: *не правда, а ложь*.</p>
                      <p className="text-slate-700 text-[11px]">• Со словами *вовсе не, далеко не, отнюдь не*.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <strong className="text-emerald-700 block font-bold">Слитно:</strong>
                      <p className="text-slate-700 text-[11px]">• Без НЕ не употребляется: *неряха, ненавидеть*.</p>
                      <p className="text-slate-700 text-[11px]">• Можно заменить синонимом без НЕ: *неправда (ложь)*.</p>
                      <p className="text-slate-700 text-[11px]">• Полные причастия без зависимых слов: *незаконченная работа*.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* 5. Подвал */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Справочные материалы верифицированы по стандартам ФИПИ</span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-sm shadow-emerald-600/20"
          >
            Вернуться к задаче
          </button>
        </div>

      </div>
    </div>
  );
};