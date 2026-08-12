import { create } from 'zustand';

export type SubjectType = 'math' | 'algebra' | 'geometry' | 'russian' | 'physics' | 'chemistry' | 'cs';
export type ExamType = 'EGE' | 'OGE' | 'SCHOOL';
export type SchoolSubMode = 'TUTORING' | 'HOMEWORK';

export interface SubjectInfo {
  id: SubjectType;
  name: string;
  icon: string;
  minGrade: number;
  maxGrade: number; // Введен точный диапазон классов!
  defaultTaskEGE: string;
  defaultTaskOGE: string;
  defaultTaskSchool: string;
  defaultCompetencyEGE: string;
  defaultCompetencyOGE: string;
  defaultCompetencySchool: string;
}

export const SUBJECTS: Record<SubjectType, SubjectInfo> = {
  math: {
    id: 'math',
    name: 'Математика',
    icon: '📐',
    minGrade: 5,
    maxGrade: 6, // Только 5-6 классы!
    defaultTaskEGE: 'а) Решите уравнение: $$2\\sin^2(x) + \\sqrt{3}\\sin(x) = 0$$\nб) Корни на $[\\pi, \\frac{5\\pi}{2}]$.',
    defaultTaskOGE: 'Решите систему уравнений:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$',
    defaultTaskSchool: 'Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$',
    defaultCompetencyEGE: 'ЕГЭ №13 (Тригонометрия)',
    defaultCompetencyOGE: 'ОГЭ №20 (Системы уравнений)',
    defaultCompetencySchool: 'Учебник Виленкина (5 класс)',
  },
  algebra: {
    id: 'algebra',
    name: 'Алгебра',
    icon: '📊',
    minGrade: 7,
    maxGrade: 11, // С 7 по 11 класс
    defaultTaskEGE: 'Решите неравенство: $$\\log_3(x + 5) > 2$$',
    defaultTaskOGE: 'Решите квадратное уравнение: $$x^2 - 5x + 6 = 0$$',
    defaultTaskSchool: 'Макарычев 7 класс (№85):\nПриведите подобные слагаемые:\n$$3x^2 + 5x - 2x^2 + 4$$',
    defaultCompetencyEGE: 'ЕГЭ №15 (Неравенства)',
    defaultCompetencyOGE: 'ОГЭ №20 (Квадратные уравнения)',
    defaultCompetencySchool: 'Учебник Макарычева (7 класс)',
  },
  geometry: {
    id: 'geometry',
    name: 'Геометрия',
    icon: '📐',
    minGrade: 7,
    maxGrade: 11, // С 7 по 11 класс
    defaultTaskEGE: 'В правильной четырехугольной пирамиде $SABCD$ сторона основания $AB = 6$, $SA = 5$. Найдите угол между $SAB$ и основанием.',
    defaultTaskOGE: 'В прямоугольном треугольнике $ABC$ гипотенуза $AB = 10$, катет $AC = 6$. Найдите катет $BC$.',
    defaultTaskSchool: 'Атанасян 7 класс (№105):\nВ равнобедренном треугольнике $ABC$ угол при вершине $B = 80^\\circ$. Найдите углы при основании.',
    defaultCompetencyEGE: 'ЕГЭ №14 (Стереометрия)',
    defaultCompetencyOGE: 'ОГЭ №16 (Планиметрия)',
    defaultCompetencySchool: 'Учебник Атанасяна (7 класс)',
  },
  russian: {
    id: 'russian',
    name: 'Русский Язык',
    icon: '📚',
    minGrade: 5,
    maxGrade: 11,
    defaultTaskEGE: 'Сформулируйте проблему текста и прокомментируйте её с 2 примерами-иллюстрациями.',
    defaultTaskOGE: 'Напишите сочинение-рассуждение №13.2 по цитате.',
    defaultTaskSchool: 'Ладыженская 5 класс (№105):\nНайдите главные члены предложения (подлежащее и сказуемое).',
    defaultCompetencyEGE: 'ЕГЭ №27 (Сочинение)',
    defaultCompetencyOGE: 'ОГЭ №13.2 (Сочинение)',
    defaultCompetencySchool: 'Учебник Ладыженской (5 класс)',
  },
  physics: {
    id: 'physics',
    name: 'Физика',
    icon: '⚡',
    minGrade: 7,
    maxGrade: 11, // С 7 класса
    defaultTaskEGE: 'Два тела массами $m_1 = 2\\text{ кг}$ и $m_2 = 3\\text{ кг}$ движутся навстречу. Найдите скорость $U$ после столкновения.',
    defaultTaskOGE: 'Какое количество теплоты $Q$ требуется для нагревания $2\\text{ кг}$ воды от $20^\\circ\\text{C}$ до $100^\\circ\\text{C}$?',
    defaultTaskSchool: 'Пёрышкин 7 класс (№42):\nЧеловек проходит $s = 1.2\\text{ км}$ за время $t = 20\\text{ мин}$. Найдите скорость в м/с.',
    defaultCompetencyEGE: 'ЕГЭ №21 (Импульс)',
    defaultCompetencyOGE: 'ОГЭ №23 (Тепловые процессы)',
    defaultCompetencySchool: 'Учебник Пёрышкина (7 класс)',
  },
  chemistry: {
    id: 'chemistry',
    name: 'Химия',
    icon: '🧪',
    minGrade: 8,
    maxGrade: 11, // С 8 класса
    defaultTaskEGE: 'Составьте уравнение окислительно-восстановительной реакции методом электронного баланса.',
    defaultTaskOGE: 'Вычислите массовую долю растворенного вещества в растворе.',
    defaultTaskSchool: 'Габриелян 8 класс (№15):\nЗакончите химическую реакцию и расставьте коэффициенты:\n$$\\text{NaOH} + \\text{HCl} \\rightarrow ?$$',
    defaultCompetencyEGE: 'ЕГЭ №29 (ОВР)',
    defaultCompetencyOGE: 'ОГЭ №21 (Реакции)',
    defaultCompetencySchool: 'Учебник Габриеляна (8 класс)',
  },
  cs: {
    id: 'cs',
    name: 'Информатика',
    icon: '💻',
    minGrade: 5,
    maxGrade: 11,
    defaultTaskEGE: 'Алгоритм функции $F(n)$ задан соотношениями:\n$$F(1) = 1$$\n$$F(n) = n + F(n-1)$$\nЧему равно $F(5)$?',
    defaultTaskOGE: 'Напишите программу на Python (ОГЭ №15.2), определяющую количество чисел, кратных 4.',
    defaultTaskSchool: 'Босова 8 класс (№12):\nСоставьте алгоритм нахождения большего из двух чисел $A$ и $B$.',
    defaultCompetencyEGE: 'ЕГЭ №16 (Рекурсия)',
    defaultCompetencyOGE: 'ОГЭ №15.2 (Программирование)',
    defaultCompetencySchool: 'Учебник Босовой (8 класс)',
  },
};

export const GRADE_DEFAULT_TASKS: Record<number, Record<SubjectType, { task: string; comp: string }>> = {
  5: {
    math: { task: 'Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$', comp: 'Учебник Виленкина (5 класс)' },
    algebra: { task: 'Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$', comp: 'Учебник Виленкина (5 класс)' },
    geometry: { task: 'Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$', comp: 'Учебник Виленкина (5 класс)' },
    physics: { task: 'Введение в физику (5 класс):\nПриведите 3 примера механических явлений в природе.', comp: 'Введение в физику (5 класс)' },
    chemistry: { task: 'Естествознание (5 класс):\nЧто такое вещество и из чего оно состоит?', comp: 'Естествознание (5 класс)' },
    cs: { task: 'Босова 5 класс:\nЧто такое информация и какие органы чувств человек использует для ее восприятия?', comp: 'Учебник Босовой (5 класс)' },
    russian: { task: 'Ладыженская 5 класс (№105):\nНайдите главные члены предложения (подлежащее и сказуемое).', comp: 'Учебник Ладыженской (5 класс)' },
  },
  6: {
    math: { task: 'Мерзляк 6 класс (№120):\nНайдите наименьшее общее кратное (НОК) чисел $28$ и $42$.', comp: 'Учебник Мерзляка (6 класс)' },
    algebra: { task: 'Мерзляк 6 класс (№120):\nНайдите наименьшее общее кратное (НОК) чисел $28$ и $42$.', comp: 'Учебник Мерзляка (6 класс)' },
    geometry: { task: 'Мерзляк 6 класс (№120):\nНайдите наименьшее общее кратное (НОК) чисел $28$ и $42$.', comp: 'Учебник Мерзляка (6 класс)' },
    physics: { task: 'Физика (6 класс):\nИз каких мельчайших частиц состоят все тела в природе?', comp: 'Физика (6 класс)' },
    chemistry: { task: 'Естествознание (6 класс):\nКакие бывают физические и химические явления?', comp: 'Естествознание (6 класс)' },
    cs: { task: 'Босова 6 класс:\nПереведите число $25$ из десятичной системы счисления в двоичную.', comp: 'Учебник Босовой (6 класс)' },
    russian: { task: 'Баранов 6 класс:\nОпределите разряд местоимений в предложении: «Своего спасибо не жалей, а чужого не жди».', comp: 'Учебник Баранова (6 класс)' },
  },
  7: {
    math: { task: 'Макарычев 7 класс (№85):\nПриведите подобные слагаемые: $$3x^2 + 5x - 2x^2 + 4$$', comp: 'Учебник Макарычева (7 класс)' },
    algebra: { task: 'Макарычев 7 класс (№85):\nПриведите подобные слагаемые: $$3x^2 + 5x - 2x^2 + 4$$', comp: 'Учебник Макарычева (7 класс)' },
    geometry: { task: 'Атанасян 7 класс (№105):\nВ равнобедренном треугольнике $ABC$ угол при вершине $B = 80^\\circ$. Найдите углы при основании.', comp: 'Учебник Атанасяна (7 класс)' },
    physics: { task: 'Пёрышкин 7 класс (№42):\nЧеловек проходит $s = 1.2\\text{ км}$ за время $t = 20\\text{ мин}$. Найдите скорость в м/с.', comp: 'Учебник Пёрышкина (7 класс)' },
    chemistry: { task: 'Введение в химию (7 класс):\nЧем отличается чистое вещество от смеси?', comp: 'Химия (7 класс)' },
    cs: { task: 'Семакин 7 класс:\nСколько бит содержит сообщение объемом $2\\text{ Кбайта}$?', comp: 'Учебник Семакина (7 класс)' },
    russian: { task: 'Ладыженская 7 класс:\nНайдите причастия в предложении: «Лес, освещенный лучами солнца, казался сказочным».', comp: 'Учебник Ладыженской (7 класс)' },
  },
  8: {
    math: { task: 'Макарычев 8 класс (№210):\nРешите квадратное уравнение через дискриминант:\n$$x^2 - 5x + 6 = 0$$', comp: 'Учебник Макарычева (8 класс)' },
    algebra: { task: 'Макарычев 8 класс (№210):\nРешите квадратное уравнение через дискриминант:\n$$x^2 - 5x + 6 = 0$$', comp: 'Учебник Макарычева (8 класс)' },
    geometry: { task: 'Атанасян 8 класс:\nНайдите площадь прямоугольного треугольника с катетами $6\\text{ см}$ и $8\\text{ см}$.', comp: 'Учебник Атанасяна (8 класс)' },
    physics: { task: 'Пёрышкин 8 класс:\nКакое количество теплоты требуется для нагревания воды массой $m = 2\\text{ кг}$ на $\\Delta t = 50^\\circ\\text{C}$?', comp: 'Учебник Пёрышкина (8 класс)' },
    chemistry: { task: 'Габриелян 8 класс (№15):\nЗакончите химическую реакцию:\n$$\\text{NaOH} + \\text{HCl} \\rightarrow ?$$', comp: 'Учебник Габриеляна (8 класс)' },
    cs: { task: 'Босова 8 класс (№12):\nСоставьте алгоритм нахождения большего из двух чисел $A$ и $B$.', comp: 'Учебник Босовой (8 класс)' },
    russian: { task: 'Бархударов 8 класс:\nУкажите вид односоставного предложения: «Вечером похолодало».', comp: 'Учебник Бархударова (8 класс)' },
  },
  9: {
    math: { task: 'Макарычев 9 класс:\nПостройте график функции $y = x^2 - 4x + 3$ и найдите наименьшее значение функции.', comp: 'Учебник Макарычева (9 класс)' },
    algebra: { task: 'Макарычев 9 класс:\nПостройте график функции $y = x^2 - 4x + 3$ и найдите наименьшее значение функции.', comp: 'Учебник Макарычева (9 класс)' },
    geometry: { task: 'Атанасян 9 класс:\nНайдите длину окружности, если радиус $R = 5\\text{ см}$.', comp: 'Учебник Атанасяна (9 класс)' },
    physics: { task: 'Пёрышкин 9 класс:\nТело движется с ускорением $a = 2\\text{ м/с}^2$ из состояния покоя. Какой путь проедет тело за $t = 5\\text{ с}$?', comp: 'Учебник Пёрышкина (9 класс)' },
    chemistry: { task: 'Габриелян 9 класс:\nСоставьте полное и сокращенное ионное уравнение реакции между $\\text{Na}_2\\text{CO}_3$ и $\\text{HCl}$.', comp: 'Учебник Габриеляна (9 класс)' },
    cs: { task: 'Поляков 9 класс:\nНапишите программу на Python, определяющую сумму четных чисел от 1 до 100.', comp: 'Учебник Полякова (9 класс)' },
    russian: { task: 'Ладыженская 9 класс (№88):\nНайдите грамматическую основу: «Когда настали сумерки, мы вышли к берегу реки».', comp: 'Учебник Ладыженской (9 класс)' },
  },
  10: {
    math: { task: 'Алимов 10-11 класс:\nРешите показательное уравнение:\n$$2^{x+1} + 2^x = 24$$', comp: 'Учебник Алимова (10 класс)' },
    algebra: { task: 'Алимов 10 класс:\nРешите показательное уравнение:\n$$2^{x+1} + 2^x = 24$$', comp: 'Учебник Алимова (10 класс)' },
    geometry: { task: 'Атанасян 10 класс:\nДаны параллельные плоскости $\\alpha$ и $\\beta$. Расстояние между ними равно $12\\text{ см}$.', comp: 'Учебник Атанасяна (10 класс)' },
    physics: { task: 'Мякишев 10 класс:\nИдеальный газ расширяется при постоянном давлении $p = 10^5\\text{ Па}$ от $V_1 = 1\\text{ л}$ до $V_2 = 4\\text{ л}$. Найдите работу газа.', comp: 'Учебник Мякишева (10 класс)' },
    chemistry: { task: 'Габриелян 10 класс:\nНапишите формулу изомера и гомолога для бутана $\\text{C}_4\\text{H}_{10}$.', comp: 'Учебник Габриеляна (10 класс)' },
    cs: { task: 'Поляков 10 класс:\nНайдите количество единиц в двоичной записи числа $2^{100} - 4$.', comp: 'Учебник Полякова (10 класс)' },
    russian: { task: 'Гольцова 10 класс:\nУкажите предложения, в которых НЕ со всеми словами пишется слитно.', comp: 'Учебник Гольцовой (10 класс)' },
  },
  11: {
    math: { task: 'Алимов 11 класс:\nНайдите точку максимума функции:\n$$y = x^3 - 3x^2 + 5$$', comp: 'Учебник Алимова (11 класс)' },
    algebra: { task: 'Алимов 11 класс:\nНайдите точку максимума функции:\n$$y = x^3 - 3x^2 + 5$$', comp: 'Учебник Алимова (11 класс)' },
    geometry: { task: 'Атанасян 11 класс:\nНайдите объем конуса, если радиус $R = 3\\text{ см}$, а высота $H = 4\\text{ см}$.', comp: 'Учебник Атанасяна (11 класс)' },
    physics: { task: 'Мякишев 11 класс:\nПериод полураспада изотопа равен $8\\text{ дней}$. Сколько процентов ядер распадется за $24\\text{ дня}$?', comp: 'Учебник Мякишева (11 класс)' },
    chemistry: { task: 'Габриелян 11 класс:\nРассчитайте массу осадка, образовавшегося при взаимодействии растворов нитрата серебра и хлорида натрия.', comp: 'Учебник Габриеляна (11 класс)' },
    cs: { task: 'Поляков 11 класс:\nНапишите программу для нахождения максимального элемента в файле чисел.', comp: 'Учебник Полякова (11 класс)' },
    russian: { task: 'Гольцова 11 класс:\nСформулируйте проблему текста и приведите 2 примера-иллюстрации.', comp: 'Учебник Гольцовой (11 класс)' },
  },
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeSubject: SubjectType;
  examType: ExamType;
  schoolSubMode: SchoolSubMode;
  selectedGrade: number;
  currentTaskContext: string;
  currentCompetencyTitle: string;
  pMastery: number;
  microWins: number;
  addMessage: (message: ChatMessage) => void;
  appendStreamingToken: (token: string) => void;
  setIsStreaming: (status: boolean) => void;
  setSubject: (subject: SubjectType) => void;
  setExamType: (exam: ExamType) => void;
  setSchoolSubMode: (mode: SchoolSubMode) => void;
  setSelectedGrade: (grade: number) => void;
  setTaskContext: (task: string, competency: string, mastery: number) => void;
  generateSimilarTask: () => void;
  incrementMicroWin: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      sender: 'assistant',
      text: 'Привет! Я твой AI-репетитор. Готов разгрузить домашку или подтянуть знания? Напиши номер упражнения или задай вопрос!',
      timestamp: '12:00',
    },
  ],
  isStreaming: false,
  activeSubject: 'math',
  examType: 'SCHOOL',
  schoolSubMode: 'HOMEWORK',
  selectedGrade: 5,
  currentTaskContext: SUBJECTS.math.defaultTaskSchool,
  currentCompetencyTitle: SUBJECTS.math.defaultCompetencySchool,
  pMastery: 0.35,
  microWins: 3,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendStreamingToken: (token) =>
    set((state) => {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.sender === 'assistant') {
        const updatedMessages = [...state.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMsg,
          text: lastMsg.text + token,
        };
        return { messages: updatedMessages };
      }
      return state;
    }),

  setIsStreaming: (status) => set({ isStreaming: status }),

  incrementMicroWin: () => set((state) => ({ microWins: state.microWins + 1 })),

  setSubject: (subjectKey) => {
    const state = get();
    const subj = SUBJECTS[subjectKey] || SUBJECTS.math;
    let task = subj.defaultTaskEGE;
    let comp = subj.defaultCompetencyEGE;

    if (state.examType === 'OGE') {
      task = subj.defaultTaskOGE;
      comp = subj.defaultCompetencyOGE;
    } else if (state.examType === 'SCHOOL') {
      const gradeTasks = GRADE_DEFAULT_TASKS[state.selectedGrade] || GRADE_DEFAULT_TASKS[5];
      const gradeSubj = gradeTasks[subjectKey] || gradeTasks.math;
      task = gradeSubj.task;
      comp = gradeSubj.comp;
    }

    set({
      activeSubject: subjectKey,
      currentTaskContext: task,
      currentCompetencyTitle: comp,
      messages: [
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `Предмет: **${subj.name}**. Выбрано: *${comp}*. С чего начнем?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
  },

  setExamType: (exam) => {
    const state = get();
    let subjKey = state.activeSubject;
    
    // Если перешли в 11 класс (ЕГЭ) или 9 класс (ОГЭ), корректируем предмет
    if (exam === 'SCHOOL' && state.selectedGrade >= 7 && subjKey === 'math') {
      subjKey = 'algebra';
    }

    const subj = SUBJECTS[subjKey] || SUBJECTS.math;
    let task = subj.defaultTaskEGE;
    let comp = subj.defaultCompetencyEGE;

    if (exam === 'OGE') {
      task = subj.defaultTaskOGE;
      comp = subj.defaultCompetencyOGE;
    } else if (exam === 'SCHOOL') {
      const gradeTasks = GRADE_DEFAULT_TASKS[state.selectedGrade] || GRADE_DEFAULT_TASKS[5];
      const gradeSubj = gradeTasks[subjKey] || gradeTasks.math;
      task = gradeSubj.task;
      comp = gradeSubj.comp;
    }

    set({
      examType: exam,
      activeSubject: subjKey,
      currentTaskContext: task,
      currentCompetencyTitle: comp,
      messages: [
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `Переключено на раздел **${
            exam === 'SCHOOL'
              ? '🎒 Школьный Репетитор (5–11 кл)'
              : exam === 'OGE'
              ? '📝 ОГЭ (9 кл)'
              : '🎓 ЕГЭ (11 кл)'
          }**. Предмет: **${subj.name}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
  },

  setSchoolSubMode: (mode) => {
    const state = get();
    set({
      schoolSubMode: mode,
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `Активирован под-раздел **${
            mode === 'HOMEWORK' ? '📝 Домашнее задание (По учебникам)' : '🎯 Репетиторство (Уроки по темам)'
          }**. Задайте вопрос или выберите упражнение!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
  },

  // АВТО-КОРРЕКЦИЯ ПРЕДМЕТА ПРИ КЛИКЕ НА КЛАСС (5-11 кл)
  setSelectedGrade: (grade) => {
    const state = get();
    let activeSubjKey = state.activeSubject;

    // Коррекция: если выбрали 7-11 класс, а была "Математика" -> переключаем на "Алгебру"
    if (grade >= 7 && activeSubjKey === 'math') {
      activeSubjKey = 'algebra';
    }
    // Если выбрали 5-6 класс, а была "Алгебра", "Геометрия", "Физика", "Химия" -> переключаем на "Математику"
    if (grade <= 6 && (SUBJECTS[activeSubjKey].minGrade > grade || activeSubjKey === 'algebra' || activeSubjKey === 'geometry')) {
      activeSubjKey = 'math';
    }

    const gradeTasks = GRADE_DEFAULT_TASKS[grade] || GRADE_DEFAULT_TASKS[5];
    const defaultSubjTask = gradeTasks[activeSubjKey] || gradeTasks.math;

    set({
      selectedGrade: grade,
      activeSubject: activeSubjKey,
      currentTaskContext: defaultSubjTask.task,
      currentCompetencyTitle: defaultSubjTask.comp,
      messages: [
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `Выбран **${grade} класс**. Предмет: **${SUBJECTS[activeSubjKey].name}**.\n\nЗагружено задание: *${defaultSubjTask.comp}*. С чего начнем решение?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
  },

  setTaskContext: (task, competency, mastery) =>
    set({
      currentTaskContext: task,
      currentCompetencyTitle: competency,
      pMastery: mastery,
      messages: [
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `Загружено задание: *${competency}*\n\n${task}\n\nС чего начнем решение?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }),

  generateSimilarTask: async () => {
    const state = get();
    const subjKey = state.activeSubject;
    const subjInfo = SUBJECTS[subjKey] || SUBJECTS.math;
    const grade = state.selectedGrade;

    set({ isStreaming: true });

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/competencies/generate-similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjInfo.name,
          grade: grade,
          exam_type: state.examType,
          task_context: state.currentTaskContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка генерации ИИ: ${res.status}`);
      }

      const data = await res.json();
      const newTask = data.generated_task || state.currentTaskContext;

      set({
        currentTaskContext: newTask,
        isStreaming: false,
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: `✨ **ИИ сгенерировал новое аналогичное упражнение (${grade} класс / ${subjInfo.name})!**\n\n${newTask}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      });
    } catch (err) {
      console.error('Error generating similar task:', err);
      set({ isStreaming: false });
    }
  },
}));