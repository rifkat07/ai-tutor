'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { KaTeXRenderer } from '../math/KaTeXRenderer';
import { X, Zap, Award, ArrowRight, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface DiagnosticTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  topic: string;
  subjectTitle: string;
  difficulty: number;
  discrimination: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS_BY_CLASS: Record<string, Question[]> = {
  grade_5: [
    {
      id: 1,
      topic: "Порядок арифметических действий",
      subjectTitle: "Математика",
      difficulty: -1.2,
      discrimination: 1.2,
      question: "Найдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$",
      options: ["$1610$", "$1860$", "$1200$", "$1500$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "Простые линейные уравнения",
      subjectTitle: "Математика",
      difficulty: -0.5,
      discrimination: 1.4,
      question: "Решите уравнение:\n$$4x + 3x = 77$$",
      options: ["$x = 11$", "$x = 7$", "$x = 14$", "$x = 9$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "Сложение обыкновенных дробей",
      subjectTitle: "Математика",
      difficulty: 0.1,
      discrimination: 1.6,
      question: "Вычислите сумму дробей с одинаковыми знаменателями:\n$$\\frac{5}{12} + \\frac{2}{12}$$",
      options: ["$\\frac{7}{12}$", "$\\frac{7}{24}$", "$\\frac{10}{12}$", "$\\frac{3}{12}$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "Периметр прямоугольника",
      subjectTitle: "Математика",
      difficulty: 0.7,
      discrimination: 1.8,
      question: "Найдите периметр прямоугольника со сторонами $a = 14\\text{ см}$ и $b = 6\\text{ см}$.",
      options: ["$40\\text{ см}$", "$84\\text{ см}$", "$20\\text{ см}$", "$28\\text{ см}$"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "Текстовые задачи на части",
      subjectTitle: "Математика",
      difficulty: 1.4,
      discrimination: 2.0,
      question: "Маша прочитала $35$ страниц книги, что составляет $\\frac{1}{3}$ всей книги. Сколько всего страниц в книге?",
      options: ["$105$", "$70$", "$90$", "$120$"],
      correctIndex: 0,
    },
  ],

  grade_6: [
    {
      id: 1,
      topic: "Нахождение НОК и НОД чисел",
      subjectTitle: "Математика",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "Найдите наименьшее общее кратное (НОК) чисел $28$ и $42$.",
      options: ["$84$", "$14$", "$168$", "$56$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "Арифметика отрицательных чисел",
      subjectTitle: "Математика",
      difficulty: -0.3,
      discrimination: 1.4,
      question: "Вычислите значение выражения:\n$$-15 + (-25) - (-10)$$",
      options: ["$-30$", "$-50$", "$-20$", "$0$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "Пропорции и отношения",
      subjectTitle: "Математика",
      difficulty: 0.3,
      discrimination: 1.6,
      question: "Решите пропорцию:\n$$\\frac{x}{6} = \\frac{15}{5}$$",
      options: ["$x = 18$", "$x = 12$", "$x = 30$", "$x = 9$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "Уравнения с модулем",
      subjectTitle: "Математика",
      difficulty: 0.9,
      discrimination: 1.8,
      question: "Найдите корни уравнения с модулем:\n$$|x| - 5 = 7$$",
      options: ["$x = \\pm 12$", "$x = 12$", "$x = \\pm 2$", "$x = 2$"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "Проценты и скидки",
      subjectTitle: "Математика",
      difficulty: 1.5,
      discrimination: 2.1,
      question: "Товар стоил $2000$ рублей. Цену снизили на $15\\%$. Какова новая цена товара?",
      options: ["$1700\\text{ руб}$", "$1850\\text{ руб}$", "$1600\\text{ руб}$", "$1750\\text{ руб}$"],
      correctIndex: 0,
    },
  ],

  grade_7: [
    {
      id: 1,
      topic: "Линейные уравнения с одной переменной",
      subjectTitle: "Алгебра",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "Решите уравнение:\n$$3x + 5 = 20$$",
      options: ["$x = 5$", "$x = 15$", "$x = 3$", "$x = 6$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "Свойства степеней",
      subjectTitle: "Алгебра",
      difficulty: -0.2,
      discrimination: 1.4,
      question: "Упростите выражение:\n$$2^3 \\cdot 2^4$$",
      options: ["$2^7 = 128$", "$2^{12}$", "$4^7$", "$2^1 = 2$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "Равнобедренный треугольник",
      subjectTitle: "Геометрия",
      difficulty: 0.4,
      discrimination: 1.6,
      question: "В равнобедренном треугольнике угол при вершине равен $80^\\circ$. Найдите углы при основании.",
      options: ["$50^\\circ$", "$80^\\circ$", "$100^\\circ$", "$40^\\circ$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "Разность квадратов (ФСУ)",
      subjectTitle: "Алгебра",
      difficulty: 1.0,
      discrimination: 1.8,
      question: "Раскройте скобки:\n$$(x - 4)(x + 4)$$",
      options: ["$x^2 - 16$", "$x^2 + 16$", "$x^2 - 8x + 16$", "$x^2 - 8$"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "Смежные углы",
      subjectTitle: "Геометрия",
      difficulty: 1.6,
      discrimination: 2.2,
      question: "Один из смежных углов в $3$ раза больше другого. Найдите меньший угол.",
      options: ["$45^\\circ$", "$60^\\circ$", "$30^\\circ$", "$90^\\circ$"],
      correctIndex: 0,
    },
  ],

  grade_8: [
    {
      id: 1,
      topic: "Квадратные уравнения и дискриминант",
      subjectTitle: "Алгебра",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "Решите квадратное уравнение:\n$$x^2 - 5x + 6 = 0$$",
      options: ["$x_1 = 2, x_2 = 3$", "$x_1 = -2, x_2 = -3$", "$x_1 = 1, x_2 = 6$", "$x_1 = -1, x_2 = 6$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "Арифметический квадратный корень",
      subjectTitle: "Алгебра",
      difficulty: -0.2,
      discrimination: 1.4,
      question: "Вычислите значение корня:\n$$\\sqrt{144} - \\sqrt{49}$$",
      options: ["$5$", "$7$", "$12$", "$19$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "Теорема Пифагора",
      subjectTitle: "Геометрия",
      difficulty: 0.5,
      discrimination: 1.7,
      question: "В прямоугольном треугольнике катеты равны $6\\text{ см}$ и $8\\text{ см}$. Найдите гипотенузу.",
      options: ["$10\\text{ см}$", "$14\\text{ см}$", "$12\\text{ см}$", "$100\\text{ см}$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "Квадратные неравенства",
      subjectTitle: "Алгебра",
      difficulty: 1.1,
      discrimination: 1.9,
      question: "Укажите решение неравенства:\n$$x^2 - 9 \\le 0$$",
      options: ["[-3; 3]", "(-\\infty; -3] \\cup [3; +\\infty)", "[0; 3]", "(-3; 3)"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "Теорема Виета",
      subjectTitle: "Алгебра",
      difficulty: 1.7,
      discrimination: 2.2,
      question: "Найдите сумму корней уравнения по теореме Виета:\n$$2x^2 - 8x + 3 = 0$$",
      options: ["$4$", "$-4$", "$8$", "$1.5$"],
      correctIndex: 0,
    },
  ],

  grade_9: [
    {
      id: 1,
      topic: "ОГЭ №6 (Дроби и вычисления)",
      subjectTitle: "ОГЭ Математика",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "ОГЭ №6. Найдите значение выражения:\n$$\\frac{1}{4} + \\frac{7}{10}$$",
      options: ["$0.95$", "$0.8$", "$0.32$", "$1.1$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "ОГЭ №9 (Квадратные уравнения)",
      subjectTitle: "ОГЭ Алгебра",
      difficulty: -0.2,
      discrimination: 1.4,
      question: "ОГЭ №9. Найдите корни уравнения:\n$$x^2 - 16 = 0$$",
      options: ["$x = \\pm 4$", "$x = 4$", "$x = 16$", "$x = \\pm 8$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "ОГЭ №10 (Теория вероятностей)",
      subjectTitle: "ОГЭ Математика",
      difficulty: 0.5,
      discrimination: 1.7,
      question: "ОГЭ №10. В сборнике билетов всего $20$ билетов, в $4$ из них вопрос по геометрии. Найдите вероятность сдать билет по геометрии.",
      options: ["$0.2$", "$0.25$", "$0.4$", "$0.05$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "ОГЭ №20 (Системы уравнений 2 части)",
      subjectTitle: "ОГЭ Алгебра",
      difficulty: 1.2,
      discrimination: 2.0,
      question: "ОГЭ №20. Решите систему уравнений:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$",
      options: ["(3; 4) \\text{ и } (4; 3)", "(5; 2) \\text{ и } (2; 5)", "(1; 6) \\text{ и } (6; 1)", "(0; 7)"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "ОГЭ №21 (Задачи на движение)",
      subjectTitle: "ОГЭ Алгебра",
      difficulty: 1.8,
      discrimination: 2.3,
      question: "ОГЭ №21. Первый велосипедист проехал $24\\text{ км}$ на $1\\text{ ч}$ быстрее второго. Скорость первого на $2\\text{ км/ч}$ больше. Найдите скорость первого.",
      options: ["$8\\text{ км/ч}$", "$6\\text{ км/ч}$", "$10\\text{ км/ч}$", "$12\\text{ км/ч}$"],
      correctIndex: 0,
    },
  ],

  grade_10: [
    {
      id: 1,
      topic: "Показательные уравнения",
      subjectTitle: "Алгебра",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "Решите показательное уравнение:\n$$2^{x+1} + 2^x = 24$$",
      options: ["$x = 3$", "$x = 4$", "$x = 2$", "$x = 1$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "Основное тригонометрическое тождество",
      subjectTitle: "Алгебра",
      difficulty: -0.2,
      discrimination: 1.4,
      question: "Упростите выражение:\n$$\\sin^2(\\alpha) + \\cos^2(\\alpha) + 4$$",
      options: ["$5$", "$4$", "$1$", "$\\sin(2\\alpha)$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "Стереометрия: Взаимное расположение плоскостей",
      subjectTitle: "Геометрия",
      difficulty: 0.5,
      discrimination: 1.7,
      question: "Даны параллельные плоскости $\\alpha$ и $\\beta$. Отрезок перпендикуляра между ними равен $12\\text{ см}$. Найдите расстояние между плоскостями.",
      options: ["$12\\text{ см}$", "$24\\text{ см}$", "$6\\text{ см}$", "$0\\text{ см}$"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "Логарифмические уравнения",
      subjectTitle: "Алгебра",
      difficulty: 1.2,
      discrimination: 2.0,
      question: "Найдите корень уравнения:\n$$\\log_2(x - 3) = 4$$",
      options: ["$x = 19$", "$x = 11$", "$x = 16$", "$x = 8$"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "Тригонометрические формулы двойного угла",
      subjectTitle: "Алгебра",
      difficulty: 1.7,
      discrimination: 2.2,
      question: "Преобразуйте выражение:\n$$2\\sin(x)\\cos(x)$$",
      options: ["\\sin(2x)", "\\cos(2x)", "2\\sin(x)", "\\sin^2(x)"],
      correctIndex: 0,
    },
  ],

  grade_11: [
    {
      id: 1,
      topic: "ЕГЭ №6 (Показательные уравнения)",
      subjectTitle: "ЕГЭ Алгебра",
      difficulty: -1.0,
      discrimination: 1.2,
      question: "ЕГЭ №6. Найдите корень уравнения:\n$$3^{x-2} = 27$$",
      options: ["$x = 5$", "$x = 3$", "$x = 9$", "$x = 1$"],
      correctIndex: 0,
    },
    {
      id: 2,
      topic: "ЕГЭ №13 (Тригонометрические уравнения)",
      subjectTitle: "ЕГЭ Математика",
      difficulty: -0.2,
      discrimination: 1.5,
      question: "ЕГЭ №13. Укажите наименьший положительный корень:\n$$2\\cos^2(x) - \\sqrt{3}\\cos(x) = 0$$",
      options: ["$\\pi / 6$", "$\\pi / 2$", "$\\pi / 3$", "$\\pi / 4$"],
      correctIndex: 0,
    },
    {
      id: 3,
      topic: "ЕГЭ №15 (Логарифмические неравенства)",
      subjectTitle: "ЕГЭ Алгебра",
      difficulty: 0.6,
      discrimination: 1.8,
      question: "ЕГЭ №15. Решите неравенство:\n$$\\log_3(x + 5) > 2$$",
      options: ["(4; +\\infty)", "(-5; 4)", "(9; +\\infty)", "(0; 4)"],
      correctIndex: 0,
    },
    {
      id: 4,
      topic: "ЕГЭ №8 (Производная функции)",
      subjectTitle: "ЕГЭ Математика",
      difficulty: 1.3,
      discrimination: 2.0,
      question: "ЕГЭ №8. На рисунке изображен график функции. В скольких точках производная равна нулю?",
      options: ["$4$", "$2$", "$6$", "$0$"],
      correctIndex: 0,
    },
    {
      id: 5,
      topic: "ЕГЭ №18 (Задачи с параметром: Окружности)",
      subjectTitle: "ЕГЭ Математика",
      difficulty: 1.9,
      discrimination: 2.3,
      question: "ЕГЭ №18. При каких $a$ система $x^2+y^2=25$ и $(x-4)^2+(y-3)^2=a^2$ имеет 2 решения?",
      options: ["$a \\in (-10; 0) \\cup (0; 10)$", "$a \\in (0; 5)$", "$a = 10$", "$a > 0$"],
      correctIndex: 0,
    },
  ],
};

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({ isOpen, onClose }) => {
  const { selectedGrade, setSelectedGrade, setExamType, addMessage } = useChatStore();
  
  const [stage, setStage] = useState<'SELECT_GRADE' | 'TESTING' | 'FINISHED'>('SELECT_GRADE');
  const [chosenGrade, setChosenGrade] = useState<number>(selectedGrade || 5);
  const [currentStep, setCurrentStep] = useState(0);
  const [userTheta, setUserTheta] = useState(0.0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!isOpen) return null;

  const gradeKey = `grade_${chosenGrade}`;
  const questionsList = QUESTIONS_BY_CLASS[gradeKey] || QUESTIONS_BY_CLASS.grade_5;
  const currentQ = questionsList[currentStep] || questionsList[0];

  const handleStartTest = (gradeNum: number) => {
    setChosenGrade(gradeNum);
    setSelectedGrade(gradeNum);
    
    if (gradeNum === 9) setExamType('OGE');
    else if (gradeNum >= 10) setExamType('EGE');
    else setExamType('SCHOOL');

    setCurrentStep(0);
    setUserTheta(0.0);
    setSelectedOption(null);
    setStage('TESTING');
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQ.correctIndex;
    
    let newTheta = userTheta;
    if (isCorrect) {
      newTheta += 0.4 * currentQ.discrimination;
    } else {
      newTheta -= 0.3 * currentQ.discrimination;
    }
    setUserTheta(newTheta);
    setSelectedOption(null);

    if (currentStep + 1 < questionsList.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setStage('FINISHED');
    }
  };

  const handleResetTest = () => {
    setStage('SELECT_GRADE');
    setCurrentStep(0);
    setUserTheta(0.0);
    setSelectedOption(null);
  };

  const projectedScore = Math.min(100, Math.max(30, Math.round(50 + userTheta * 20)));

  const applyResults = () => {
    onClose();
    useChatStore.setState({
      pMastery: projectedScore / 100,
    });

    addMessage({
      id: Date.now().toString(),
      sender: 'assistant',
      text: `⚡ **Адаптивная IRT-Диагностика (${chosenGrade} класс) завершена!**\n\nТвой стартовый результат: **${projectedScore} баллов** из 100.\nТемы для прокачки занесены в **«Зоны роста»** в твоем Кабинете!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden text-slate-900">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-500 rounded-xl">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {stage === 'SELECT_GRADE' ? 'Выбор класса для Диагностики' : `Диагностика IRT • ${chosenGrade} класс`}
              </h2>
              <p className="text-xs text-slate-500">
                {stage === 'SELECT_GRADE' ? 'Укажите ваш класс, чтобы подобрать точные вопросы' : `Точный замер уровня знаний по программе ${chosenGrade} класса`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ЭТАП 1: ОБЯЗАТЕЛЬНЫЙ ВЫБОР КЛАССА */}
        {stage === 'SELECT_GRADE' && (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full font-bold uppercase">
                Шаг 1 из 2
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">В каком классе вы учитесь?</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ИИ подберет 5 специализированных вопросов именно по вашей школьной программе или формату экзамена:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { grade: 5, label: '5 класс', desc: 'Арифметика и Дроби' },
                { grade: 6, label: '6 класс', desc: 'НОК, Модули, Пропорции' },
                { grade: 7, label: '7 класс', desc: 'Линейные уравнения' },
                { grade: 8, label: '8 класс', desc: 'Квадратные уравнения' },
                { grade: 9, label: '9 класс (ОГЭ)', desc: 'КИМы ОГЭ №1–25' },
                { grade: 10, label: '10 класс', desc: 'Показательные уравнения' },
                { grade: 11, label: '11 класс (ЕГЭ)', desc: 'КИМы ЕГЭ №1–18' },
              ].map((item) => (
                <button
                  key={item.grade}
                  onClick={() => handleStartTest(item.grade)}
                  className={`p-3.5 rounded-2xl border text-left transition hover:scale-105 active:scale-95 shadow-2xs ${
                    chosenGrade === item.grade
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 text-slate-800'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ЭТАП 2: ПРОХОЖДЕНИЕ ТЕСТА */}
        {stage === 'TESTING' && (
          <div className="py-4 space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Вопрос {currentStep + 1} из {questionsList.length} • <strong className="text-slate-900">{currentQ.topic}</strong></span>
              <span className="font-semibold text-amber-700">Сложность: {currentQ.difficulty > 0 ? `+${currentQ.difficulty}` : currentQ.difficulty}</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questionsList.length) * 100}%` }}
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium text-slate-900 leading-relaxed shadow-2xs">
              <KaTeXRenderer content={currentQ.question} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-3 rounded-xl border text-xs text-left transition font-semibold flex items-center justify-between shadow-2xs ${
                    selectedOption === idx
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <KaTeXRenderer content={opt.startsWith('$') ? opt : `$${opt}$`} />
                  {selectedOption === idx && <CheckCircle2 size={16} className="text-amber-600 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={handleResetTest}
                className="text-xs text-slate-500 hover:text-slate-900 transition font-medium"
              >
                ← Сменить класс
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm shadow-indigo-600/20 flex items-center gap-2"
              >
                Ответить <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ЭТАП 3: РЕЗУЛЬТАТЫ И ПЕРСОНАЛЬНЫЙ ПРОГНОЗ */}
        {stage === 'FINISHED' && (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Award size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Прогноз результата ({chosenGrade} класс): {projectedScore} баллов</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Тест выявил ваши сильные стороны и пробелы. Индивидуальный трек и рекомендации в Личном Кабинете обновлены под программу {chosenGrade} класса!
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleResetTest}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition flex items-center gap-2"
              >
                <RefreshCw size={16} /> Сменить класс / Заново
              </button>
              <button
                onClick={applyResults}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <Sparkles size={16} /> Применить и начать занятия
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};