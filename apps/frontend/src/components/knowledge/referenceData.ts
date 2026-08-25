export interface ReferenceItem {
  id: string;
  title: string;
  grades: number[];
  keywords: string;
  formulas: string[];
  notes?: string;
  gridItems?: { n: string; v: string }[];
}

export const SQUARE_TABLE: { n: string; v: string }[] = [
  { n: '11²', v: '121' },
  { n: '12²', v: '144' },
  { n: '13²', v: '169' },
  { n: '14²', v: '196' },
  { n: '15²', v: '225' },
  { n: '16²', v: '256' },
  { n: '17²', v: '289' },
  { n: '18²', v: '324' },
  { n: '19²', v: '361' },
  { n: '20²', v: '400' },
  { n: '21²', v: '441' },
  { n: '22²', v: '484' },
  { n: '23²', v: '529' },
  { n: '24²', v: '576' },
  { n: '25²', v: '625' },
  { n: '26²', v: '676' },
  { n: '27²', v: '729' },
  { n: '28²', v: '784' },
  { n: '29²', v: '841' },
  { n: '30²', v: '900' },
];

export const POWERS_OF_TWO: { n: string; v: string }[] = [
  { n: '2⁰', v: '1' },
  { n: '2¹', v: '2' },
  { n: '2²', v: '4' },
  { n: '2³', v: '8' },
  { n: '2⁴', v: '16' },
  { n: '2⁵', v: '32' },
  { n: '2⁶', v: '64' },
  { n: '2⁷', v: '128' },
  { n: '2⁸', v: '256' },
  { n: '2⁹', v: '512' },
  { n: '2¹⁰', v: '1024' },
  { n: '2¹¹', v: '2048' },
  { n: '2¹²', v: '4096' },
  { n: '2¹³', v: '8192' },
  { n: '2¹⁴', v: '16384' },
  { n: '2¹⁶', v: '65536' },
];

export const REFERENCE_DATA: Record<string, ReferenceItem[]> = {
  math: [
    {
      id: 'math_fractions',
      title: '1. Арифметика, Дроби и Пропорции (5–6 кл)',
      grades: [5, 6],
      keywords: 'дроби порядок арифметика нок нод пропорции проценты модуль',
      formulas: [
        '$$\\frac{a}{c} \\pm \\frac{b}{c} = \\frac{a \\pm b}{c}, \\quad \\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}, \\quad \\frac{a}{b} : \\frac{c}{d} = \\frac{ad}{bc}$$',
        '$$\\frac{a}{b} = \\frac{c}{d} \\iff ad = bc \\quad (\\text{Основное свойство пропорции})$$',
      ],
      notes: '• НОК и НОД: a · b = НОД(a, b) · НОК(a, b)\n• Проценты: p% от A = A · (p / 100)\n• Модуль: |x| ≥ 0',
    },
    {
      id: 'math_fsu',
      title: '2. Формулы сокращенного умножения (ФСУ) и Степени (7–8 кл)',
      grades: [7, 8],
      keywords: 'фсу степени корни умножение сокращенное формулы',
      formulas: [
        '$$(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\quad a^2 - b^2 = (a - b)(a + b)$$',
        '$$(a \\pm b)^3 = a^3 \\pm 3a^2b + 3ab^2 \\pm b^3$$',
        '$$a^n \\cdot a^m = a^{n+m}, \\quad \\frac{a^n}{a^m} = a^{n-m}, \\quad (a^n)^m = a^{nm}, \\quad a^{-n} = \\frac{1}{a^n}$$',
      ],
    },
    {
      id: 'math_quad',
      title: '3. Квадратные уравнения, Дискриминант и Виет (8–9 кл)',
      grades: [8, 9, 10, 11],
      keywords: 'квадратные уравнения дискриминант виет корни',
      formulas: [
        '$$ax^2 + bx + c = 0, \\quad D = b^2 - 4ac, \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}$$',
        '$$x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a} \\quad (\\text{Теорема Виета})$$',
      ],
      notes: 'Разложение на множители: ax² + bx + c = a(x - x₁)(x - x₂)',
    },
    {
      id: 'math_progressions',
      title: '4. Прогрессии и Теория Вероятностей (ОГЭ №10, №14)',
      grades: [9, 10, 11],
      keywords: 'прогрессии вероятность огэ арифметическая геометрическая',
      formulas: [
        '$$a_n = a_1 + d(n-1), \\quad S_n = \\frac{a_1 + a_n}{2} \\cdot n = \\frac{2a_1 + d(n-1)}{2} \\cdot n$$',
        '$$b_n = b_1 \\cdot q^{n-1}, \\quad S_n = \\frac{b_1(q^n - 1)}{q - 1}, \\quad P(A) = \\frac{m}{n}$$',
      ],
    },
    {
      id: 'math_logs',
      title: '5. Все свойства Логарифмов и Рационализация (ЕГЭ №15)',
      grades: [10, 11],
      keywords: 'логарифмы свойства рационализация егэ основание',
      formulas: [
        '$$\\log_a(xy) = \\log_a x + \\log_a y, \\quad \\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y$$',
        '$$\\log_a(x^k) = k\\log_a x, \\quad \\log_{a^p} x = \\frac{1}{p}\\log_a x, \\quad a^{\\log_a b} = b$$',
        '$$\\log_a f - \\log_a g \\iff (a - 1)(f - g) \\quad (\\text{Метод рационализации})$$',
      ],
    },
    {
      id: 'math_trig',
      title: '6. Тригонометрия и Формулы Двойного Угла (ЕГЭ №13)',
      grades: [10, 11],
      keywords: 'тригонометрия sin cos tg ctg двойной угол круг',
      formulas: [
        '$$\\sin^2 x + \\cos^2 x = 1, \\quad \\text{tg }x \\cdot \\text{ctg }x = 1, \\quad 1 + \\text{tg}^2 x = \\frac{1}{\\cos^2 x}$$',
        '$$\\sin(2x) = 2\\sin x \\cos x, \\quad \\cos(2x) = \\cos^2 x - \\sin^2 x = 2\\cos^2 x - 1$$',
        '$$\\sin^2 x = \\frac{1 - \\cos 2x}{2}, \\quad \\cos^2 x = \\frac{1 + \\cos 2x}{2} \\quad (\\text{Понижение степени})$$',
      ],
    },
    {
      id: 'math_diff',
      title: '7. Таблица Производных и Матанализ (ЕГЭ №8, №12)',
      grades: [10, 11],
      keywords: 'производные таблица первообразная матан касательная',
      formulas: [
        '$$(x^n)\' = n x^{n-1}, \\quad (\\sin x)\' = \\cos x, \\quad (\\cos x)\' = -\\sin x, \\quad (e^x)\' = e^x, \\quad (\\ln x)\' = \\frac{1}{x}$$',
        '$$(uv)\' = u\'v + uv\', \\quad \\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}, \\quad y = f(x_0) + f\'(x_0)(x - x_0)$$',
      ],
    },
  ],

  geometry: [
    {
      id: 'geom_triangle_area',
      title: '1. Все формулы площади треугольника и Теорема Пифагора',
      grades: [7, 8, 9, 10, 11],
      keywords: 'треугольник площадь герон пифагор прямоугольный синус косинус',
      formulas: [
        '$$S = \\frac{1}{2}ah = \\frac{1}{2}ab\\sin\\gamma = \\sqrt{p(p-a)(p-b)(p-c)} = pr = \\frac{abc}{4R}$$',
        '$$c^2 = a^2 + b^2, \\quad h_c = \\frac{ab}{c} = \\sqrt{a_c b_c}, \\quad m_c = \\frac{c}{2} = R$$',
      ],
    },
    {
      id: 'geom_theorems',
      title: '2. Теоремы Синусов, Косинусов и Площади фигур',
      grades: [8, 9, 10, 11],
      keywords: 'синусов косинусов трапеция ромб параллелограмм круг окружность',
      formulas: [
        '$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R, \\quad c^2 = a^2 + b^2 - 2ab\\cos C$$',
        '$$S_{\\text{трап}} = \\frac{a+b}{2} h, \\quad S_{\\text{ромб}} = \\frac{1}{2}d_1 d_2 = ah, \\quad S_{\\text{круга}} = \\pi R^2, \\quad C = 2\\pi R$$',
      ],
    },
    {
      id: 'geom_stereometry',
      title: '3. Стереометрия: Объемы и Площади тел (ЕГЭ №3, №14)',
      grades: [10, 11],
      keywords: 'стереометрия объем призма пирамида конус цилиндр шар сфера тела',
      formulas: [
        '$$V_{\\text{призмы}} = S_{\\text{осн}}h, \\quad V_{\\text{пирамиды}} = \\frac{1}{3}S_{\\text{осн}}h, \\quad d^2 = a^2 + b^2 + c^2$$',
        '$$V_{\\text{цилиндра}} = \\pi R^2 h, \\quad S_{\\text{бок}}^{\\text{цил}} = 2\\pi Rh, \\quad V_{\\text{конуса}} = \\frac{1}{3}\\pi R^2 h$$',
        '$$V_{\\text{шара}} = \\frac{4}{3}\\pi R^3, \\quad S_{\\text{сферы}} = 4\\pi R^2$$',
      ],
    },
    {
      id: 'geom_vectors',
      title: '4. Векторы на плоскости и в пространстве (ЕГЭ №2)',
      grades: [9, 10, 11],
      keywords: 'векторы скалярное произведение координаты длина угол',
      formulas: [
        '$$|\\vec{a}| = \\sqrt{x^2 + y^2 + z^2}, \\quad \\vec{a} \\cdot \\vec{b} = x_1 x_2 + y_1 y_2 + z_1 z_2 = |\\vec{a}||\\vec{b}|\\cos\\alpha$$',
      ],
      notes: '• Перпендикулярность: a · b = 0\n• Коллинеарность: x₁/x₂ = y₁/y₂ = z₁/z₂',
    },
  ],

  physics: [
    {
      id: 'phys_mechanics',
      title: '1. Механика, Динамика и Законы сохранения',
      grades: [7, 8, 9, 10, 11],
      keywords: 'механика кинематика ньютон импульс энергия работа маятник',
      formulas: [
        '$$s = v_0 t + \\frac{at^2}{2} = \\frac{v^2 - v_0^2}{2a}, \\quad F = ma, \\quad F_{\\text{тр}} = \\mu N, \\quad F_{\\text{упр}} = -kx$$',
        '$$p = mv, \\quad A = Fs\\cos\\alpha, \\quad E_k = \\frac{mv^2}{2}, \\quad E_p = mgh = \\frac{kx^2}{2}$$',
        '$$T = 2\\pi\\sqrt{\\frac{l}{g}} \\quad (\\text{Математический}), \\quad T = 2\\pi\\sqrt{\\frac{m}{k}} \\quad (\\text{Пружинный})$$',
      ],
    },
    {
      id: 'phys_thermo',
      title: '2. Молекулярная физика и Термодинамика',
      grades: [8, 10, 11],
      keywords: 'мкт термодинамика газ менделеев карно кпд теплота',
      formulas: [
        '$$pV = \\nu RT = \\frac{m}{M}RT, \\quad p = nkT, \\quad U = \\frac{3}{2}\\nu RT, \\quad A = p\\Delta V, \\quad Q = \\Delta U + A$$',
        '$$\\eta = \\frac{Q_1 - Q_2}{Q_1} = \\frac{T_1 - T_2}{T_1} \\quad (\\text{Карно}), \\quad Q = cm\\Delta t = \\lambda m = Lm$$',
      ],
    },
    {
      id: 'phys_electro',
      title: '3. Электродинамика, Магнетизм и Оптика',
      grades: [8, 9, 10, 11],
      keywords: 'электричество ток ом кулон мощность конденсатор линза оптика',
      formulas: [
        '$$F = k\\frac{|q_1 q_2|}{r^2}, \\quad I = \\frac{U}{R} = \\frac{\\mathcal{E}}{R + r}, \\quad P = UI = I^2R, \\quad C = \\frac{\\varepsilon\\varepsilon_0 S}{d}$$',
        '$$F_A = IBL\\sin\\alpha, \\quad F_L = qvB\\sin\\alpha, \\quad T = 2\\pi\\sqrt{LC}, \\quad \\pm\\frac{1}{F} = \\frac{1}{d} \\pm \\frac{1}{f}$$',
      ],
    },
  ],

  chemistry: [
    {
      id: 'chem_formulas',
      title: '1. Расчетные формулы химии',
      grades: [8, 9, 10, 11],
      keywords: 'расчет молярная масса количество концентрация плотность',
      formulas: [
        '$$n = \\frac{m}{M} = \\frac{V}{V_m} = \\frac{N}{N_A} \\quad (V_m = 22.4\\text{ л/моль}), \\quad w = \\frac{m_{\\text{в-ва}}}{m_{\\text{р-ра}}} \\cdot 100\\%$$',
      ],
    },
    {
      id: 'chem_metals',
      title: '2. Электрохимический ряд напряжений металлов',
      grades: [8, 9, 10, 11],
      keywords: 'ряд активности металлы бекетов кислоты соли',
      formulas: [
        '$$\\text{Li} \\to \\text{K} \\to \\text{Ba} \\to \\text{Ca} \\to \\text{Na} \\to \\text{Mg} \\to \\text{Al} \\to \\text{Zn} \\to \\text{Fe} \\to \\text{Pb} \\to [\\text{H}_2] \\to \\text{Cu} \\to \\text{Ag} \\to \\text{Au}$$',
      ],
      notes: '• Металлы левее H₂ вытесняют водород из кислот\n• Каждый металл вытесняет правее стоящие из солей',
    },
    {
      id: 'chem_organics',
      title: '3. Органическая химия: Гомологические ряды',
      grades: [10, 11],
      keywords: 'органика алканы алкены спирты кислоты эфиры',
      formulas: [
        '$$\\text{Алканы: } C_n H_{2n+2}, \\quad \\text{Алкены: } C_n H_{2n}, \\quad \\text{Алкины: } C_n H_{2n-2}$$',
        '$$\\text{Спирты: } C_n H_{2n+1}OH, \\quad \\text{Кислоты: } R-COOH$$',
      ],
    },
  ],

  cs: [
    {
      id: 'cs_units',
      title: '1. Степени двойки и Единицы измерения информации',
      grades: [5, 6, 7, 8, 9, 10, 11],
      keywords: 'степени двойки байты биты',
      formulas: [
        '$$1\\text{ Байт} = 8\\text{ бит}, \\quad 1\\text{ КБ} = 1024\\text{ Байт}, \\quad 1\\text{ МБ} = 1024\\text{ КБ}, \\quad 1\\text{ ГБ} = 1024\\text{ МБ}$$',
      ],
    },
    {
      id: 'cs_coding',
      title: '2. Формулы кодирования данных (КЕГЭ №7, №11)',
      grades: [8, 9, 10, 11],
      keywords: 'формулы кегэ кодирование звук графика скорость',
      formulas: [
        '$$I = K \\cdot i, \\quad N = 2^i \\quad (\\text{Текст/Цвет}), \\quad I = f \\cdot i \\cdot t \\cdot k \\quad (\\text{Звук}), \\quad Q = v \\cdot t \\quad (\\text{Передача})$$',
        '$$N = M^L \\quad (\\text{Комбинаторика})$$',
      ],
    },
    {
      id: 'cs_python',
      title: '3. Шпаргалка методов Python для КЕГЭ',
      grades: [8, 9, 10, 11],
      keywords: 'python питон функции itertools split replace sys',
      formulas: [
        '$$\\text{bin}(x)[2:], \\quad \\text{int}(\'1010\', 2), \\quad s.\\text{count}(\'A\'), \\quad s.\\text{replace}(\'1\', \'2\'), \\quad s[::-1]$$',
      ],
      notes: '• from itertools import product, permutations\n• import sys; sys.setrecursionlimit(3000)',
    },
  ],

  russian: [
    {
      id: 'rus_n_nn',
      title: '1. Правописание Н и НН во всех частях речи (ЕГЭ №15)',
      grades: [5, 6, 7, 8, 9, 10, 11],
      keywords: 'н нн причастия прилагательные суффиксы исключения',
      formulas: [
        '$$\\text{Прил. -ОНН-, -ЕНН-} \\implies \\text{НН} \\quad (\\text{искл: ветреный})$$',
        '$$\\text{Прил. -ИН-, -АН-, -ЯН-} \\implies \\text{Н} \\quad (\\text{искл: стеклянный, оловянный, деревянный})$$',
        '$$\\text{Причастия: приставка, завис. слово, -ОВА-/-ЕВА-} \\implies \\text{НН}, \\quad \\text{Краткие} \\implies \\text{Н}$$',
      ],
    },
    {
      id: 'rus_roots',
      title: '2. Корни с чередованием гласных (ЕГЭ №9)',
      grades: [5, 6, 7, 8, 9, 10, 11],
      keywords: 'чередование корни гар гор лаг лож раст ращ рос кас кос',
      formulas: [
        '$$\\text{Ударение: } \\text{гАр/гОр, клАн/клОн, твАр/твОр} \\quad (\\text{без удар. О}), \\quad \\text{зАр/зОр} \\quad (\\text{без удар. А})$$',
        '$$\\text{Суффикс А: } \\text{лАг/лОж, кАс/кОс, бЕр/бИр, пЕр/пИр, тЕр/тИр, мЕр/мИр, стЕл/стИл}$$',
        '$$\\text{Согласная: } \\text{рАст/рАщ/рОс} \\quad (\\text{искл: росток, отрасль, ростовщик}), \\quad \\text{скАк/скОч}$$',
      ],
    },
    {
      id: 'rus_verbs',
      title: '3. Спряжение глаголов и суффиксы причастий (ЕГЭ №12)',
      grades: [5, 6, 7, 8, 9, 10, 11],
      keywords: 'спряжение глаголов исключения гнать дышать брить стелить',
      formulas: [
        '$$\\text{II Спр. (-ИТЬ): Все на -ИТЬ (кроме брить, стелить)} + 7\\text{ на -ЕТЬ} + 4\\text{ на -АТЬ} \\implies \\text{-ишь, -ит, -ат/-ят}$$',
        '$$\\text{I Спр.: Все остальные} \\implies \\text{-ешь, -ет, -ем, -ете, -ут/-ют}$$',
      ],
    },
  ],
};