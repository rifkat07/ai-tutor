from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.domain.models import Competency
from app.services.theory_service import dynamic_theory_service
from app.services.task_generator import task_generator_service
from app.services.fipi_evaluator import fipi_evaluator_service
from app.services.essay_evaluator import essay_evaluator_service
from app.domain.sympy_engine.verifier import math_verifier
from app.domain.sympy_engine.advanced_verifier import advanced_math_verifier
from app.domain.cognitive.recommendation_engine import recommendation_engine
from app.services.analytics_service import analytics_service

router = APIRouter()


class EssayEvaluationRequest(BaseModel):
    task_context: str
    essay_text: str
    exam_type: str = "EGE"


@router.post("/essay-evaluate")
async def evaluate_essay_endpoint(data: EssayEvaluationRequest):
    """Экспертная проверка сочинений ЕГЭ/ОГЭ по 12 критериям ФИПИ."""
    return await essay_evaluator_service.evaluate_essay(
        task_context=data.task_context,
        essay_text=data.essay_text,
        exam_type=data.exam_type,
    )


class TheoryRequestSchema(BaseModel):
    subject: str
    competency_title: str
    task_context: str


class CheatsheetRequestSchema(BaseModel):
    subject: str
    grade: int
    exam_type: str
    task_context: str
    competency_title: str


class SimilarTaskRequestSchema(BaseModel):
    subject: str
    grade: int
    exam_type: str
    task_context: str


class AnswerVerifySchema(BaseModel):
    task_context: str
    student_answer: str


class FipiEvaluationRequest(BaseModel):
    subject: str
    task_context: str
    student_solution: str
    exam_type: str = "EGE"


@router.get("/graph")
async def get_knowledge_graph_endpoint(
    subject: str = Query("math"),
    grade: int = Query(5),
    mastery: float = Query(0.35),
):
    """100% Мультипредметный генератор сети Графа Знаний под выбранный предмет и класс."""
    subj = subject.lower().strip()

    # =========================================================================
    # 1. РУССКИЙ ЯЗЫК (5–11 КЛАССЫ)
    # =========================================================================
    if subj == "russian":
        if grade <= 6:
            nodes = [
                {"id": "r1", "title": "Фонетика и звуко-буквенный анализ", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Определите количество букв и звуков в слове: «вьюга»."},
                {"id": "r2", "title": "Состав слова (Корень, Приставка, Суффикс)", "level": 1, "status": "mastered", "mastery": 90, "x": 240, "y": 120, "task": "Выделите корень и приставку в слове: «перелесок»."},
                {"id": "r3", "title": "Главные члены предложения (Основа)", "level": 2, "status": "in_progress", "mastery": 65, "x": 240, "y": 240, "task": "Ладыженская 5 класс:\nНайдите подлежащее и сказуемое в предложении: «Наступили долгожданные каникулы»."},
                {"id": "r4", "title": "Безударные проверяемые гласные в корне", "level": 2, "status": "in_progress", "mastery": 70, "x": 420, "y": 120, "task": "Подберите проверочное слово к слову: «морской»."},
                {"id": "r5", "title": "Второстепенные члены предложения", "level": 3, "status": "weak", "mastery": 35, "x": 420, "y": 240, "task": "Определите дополнение и обстоятельство в предложении: «Мы быстро шли по лесной тропинке»."},
                {"id": "r6", "title": "Однородные члены и запятые между ними", "level": 3, "status": "weak", "mastery": 25, "x": 600, "y": 180, "task": "Расставьте знаки препинания: «В саду росли яблоки груши и сливы»."},
                {"id": "r7", "title": "Сложное предложение и союзная связь", "level": 4, "status": "locked", "mastery": 10, "x": 780, "y": 180, "task": "Найдите грамматические основы: «Солнце село, и наступила прохлада»."},
            ]
            edges = [
                {"from": "r1", "to": "r2"},
                {"from": "r2", "to": "r4"},
                {"from": "r1", "to": "r3"},
                {"from": "r3", "to": "r5"},
                {"from": "r4", "to": "r6"},
                {"from": "r5", "to": "r6"},
                {"from": "r6", "to": "r7"},
            ]
        elif grade <= 9:
            nodes = [
                {"id": "r1", "title": "Морфологический анализ частей речи", "level": 1, "status": "mastered", "mastery": 90, "x": 80, "y": 180, "task": "Определите разряд местоимения в предложении: «Кто стучится в дверь?»."},
                {"id": "r2", "title": "Причастия и причастный оборот", "level": 2, "status": "mastered", "mastery": 80, "x": 240, "y": 100, "task": "Найдите причастный оборот и расставьте знаки: «Листья опавшие с деревьев шуршали под ногами»."},
                {"id": "r3", "title": "Деепричастия и деепричастный оборот", "level": 2, "status": "in_progress", "mastery": 60, "x": 240, "y": 260, "task": "Найдите деепричастие: «Улыбаясь, он подошел к друзьям»."},
                {"id": "r4", "title": "Правописание -Н- и -НН- в суффиксах", "level": 3, "status": "in_progress", "mastery": 50, "x": 440, "y": 100, "task": "Вставьте Н или НН: «жаре...ый картофель», «поджаре...ая рыба»."},
                {"id": "r5", "title": "Сложноподчиненные предложения (СПП)", "level": 3, "status": "weak", "mastery": 30, "x": 440, "y": 260, "task": "Определите тип придаточного: «Мы знали, что скоро начнется дождь»."},
                {"id": "r6", "title": "ОГЭ №2–5: Синтаксический и пунктуационный анализ", "level": 4, "status": "weak", "mastery": 25, "x": 640, "y": 180, "task": "Укажите цифры, на месте которых должны стоять запятые в предложении."},
                {"id": "r7", "title": "ОГЭ №13.2 / 13.3: Сочинение-рассуждение", "level": 5, "status": "locked", "mastery": 15, "x": 840, "y": 180, "task": "Напишите сочинение-рассуждение на тему «Что такое доброта?» с двумя примерами-аргументами."},
            ]
            edges = [
                {"from": "r1", "to": "r2"},
                {"from": "r1", "to": "r3"},
                {"from": "r2", "to": "r4"},
                {"from": "r3", "to": "r5"},
                {"from": "r4", "to": "r6"},
                {"from": "r5", "to": "r6"},
                {"from": "r6", "to": "r7"},
            ]
        else:
            # 10–11 КЛАССЫ (ЕГЭ РУССКИЙ ЯЗЫК)
            nodes = [
                {"id": "r1", "title": "ЕГЭ №9: Корни с чередованием (гар/гор, лаг/лож)", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Укажите варианты ответов, в которых во всех словах одного ряда содержится безударная чередующаяся гласная."},
                {"id": "r2", "title": "ЕГЭ №10–12: Приставки и суффиксы глаголов/причастий", "level": 2, "status": "in_progress", "mastery": 70, "x": 260, "y": 100, "task": "Укажите варианты, где на месте пропуска пишется буква И: «стел..шь, завис..мый»."},
                {"id": "r3", "title": "ЕГЭ №8: Синтаксические нормы и ошибки", "level": 2, "status": "mastered", "mastery": 85, "x": 260, "y": 260, "task": "Установите соответствие между грамматическими ошибками и предложениями."},
                {"id": "r4", "title": "ЕГЭ №16–21: Пунктуация в простом и сложном предложении", "level": 3, "status": "in_progress", "mastery": 55, "x": 480, "y": 100, "task": "Расставьте знаки препинания: «Офицер раненный в руку продолжал командовать ротой»."},
                {"id": "r5", "title": "ЕГЭ №22–26: Анализ текста и средства выразительности", "level": 3, "status": "in_progress", "mastery": 60, "x": 480, "y": 260, "task": "Определите средство выразительности: «золотые руки», «река времени»."},
                {"id": "r6", "title": "ЕГЭ №27: Сочинение по критериям ФИПИ (К1–К12)", "level": 4, "status": "weak", "mastery": 20, "x": 720, "y": 180, "task": "Сформулируйте проблему текста, прокомментируйте её с двумя примерами-иллюстрациями, отразите позицию автора и обоснуйте собственное мнение."},
            ]
            edges = [
                {"from": "r1", "to": "r2"},
                {"from": "r1", "to": "r3"},
                {"from": "r2", "to": "r4"},
                {"from": "r3", "to": "r5"},
                {"from": "r4", "to": "r6"},
                {"from": "r5", "to": "r6"},
            ]

    # =========================================================================
    # 2. ФИЗИКА (7–11 КЛАССЫ)
    # =========================================================================
    elif subj == "physics":
        if grade <= 8:
            nodes = [
                {"id": "p1", "title": "Механическое движение и скорость (v = s/t)", "level": 1, "status": "mastered", "mastery": 90, "x": 80, "y": 180, "task": "Пёрышкин 7 класс:\nЧеловек проходит 1.2 км за 20 мин. Найдите скорость в м/с."},
                {"id": "p2", "title": "Масса тела и плотность вещества (ρ = m/V)", "level": 2, "status": "mastered", "mastery": 80, "x": 240, "y": 120, "task": "Найдите массу мраморной плиты объемом 0.5 м³, если плотность мрамора 2700 кг/м³."},
                {"id": "p3", "title": "Силы в природе: Тяжести, Упругости (mg, kx)", "level": 2, "status": "in_progress", "mastery": 65, "x": 240, "y": 240, "task": "Определите силу упругости пружины жесткостью 100 Н/м при удлинении 5 см."},
                {"id": "p4", "title": "Давление твердых тел и жидкостей (p = F/S, ρgh)", "level": 3, "status": "in_progress", "mastery": 50, "x": 420, "y": 180, "task": "Какое гидростатическое давление оказывает столб воды высотой 10 м?"},
                {"id": "p5", "title": "Тепловые процессы и нагревание (Q = cmΔt)", "level": 3, "status": "weak", "mastery": 30, "x": 600, "y": 120, "task": "Пёрышкин 8 класс:\nКакое количество теплоты нужно для нагрева 2 кг воды на 50°C?"},
                {"id": "p6", "title": "Электрический ток и Закон Ома (I = U/R)", "level": 4, "status": "weak", "mastery": 20, "x": 600, "y": 240, "task": "Какова сила тока в проводнике сопротивлением 10 Ом при напряжении 220 В?"},
                {"id": "p7", "title": "Работа и мощность электрического тока (P = UI)", "level": 5, "status": "locked", "mastery": 10, "x": 780, "y": 180, "task": "Найдите мощность электрического чайника, потребляющего ток 5 А при напряжении 220 В."},
            ]
            edges = [
                {"from": "p1", "to": "p2"},
                {"from": "p1", "to": "p3"},
                {"from": "p2", "to": "p4"},
                {"from": "p3", "to": "p4"},
                {"from": "p4", "to": "p5"},
                {"from": "p4", "to": "p6"},
                {"from": "p6", "to": "p7"},
            ]
        else:
            # 9–11 КЛАССЫ (ЕГЭ ФИЗИКА)
            nodes = [
                {"id": "p1", "title": "Кинематика: Равноускоренное движение", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Тело начинает движение с ускорением 2 м/с². Найдите путь за 5 секунд."},
                {"id": "p2", "title": "Динамика: Законы Ньютона и силы", "level": 2, "status": "mastered", "mastery": 85, "x": 260, "y": 100, "task": "Брусок скользит по наклонной плоскости под углом 30°. Найдите силу трения."},
                {"id": "p3", "title": "Законы сохранения: Импульс и Энергия (ЗСИ, ЗСЭ)", "level": 2, "status": "in_progress", "mastery": 65, "x": 260, "y": 260, "task": "ЕГЭ №21:\nДва тела массами 2 кг и 3 кг движутся навстречу со скоростями 4 м/с и 2 м/с."},
                {"id": "p4", "title": "МКТ и Изопроцессы в газах (pV = νRT)", "level": 3, "status": "in_progress", "mastery": 55, "x": 480, "y": 100, "task": "Идеальный газ расширяется изобарно при p = 10⁵ Па от 1 л до 4 л. Найдите работу газа."},
                {"id": "p5", "title": "Электростатика и Цепи постоянного тока", "level": 3, "status": "weak", "mastery": 35, "x": 480, "y": 260, "task": "Найдите эквивалентное сопротивление цепи при параллельном соединении резисторов."},
                {"id": "p6", "title": "Магнитное поле и Закон Фарадея (ЭДС)", "level": 4, "status": "weak", "mastery": 25, "x": 680, "y": 180, "task": "Проводник длиной 0.5 м движется в магнитном поле индукцией 0.2 Тл со скоростью 10 м/с."},
                {"id": "p7", "title": "Оптика и Квантовая физика (Фотоэффект)", "level": 5, "status": "locked", "mastery": 10, "x": 860, "y": 180, "task": "Найдите максимальную кинетическую энергию фотоэлектронов при облучении светом с частотой ν."},
            ]
            edges = [
                {"from": "p1", "to": "p2"},
                {"from": "p2", "to": "p3"},
                {"from": "p2", "to": "p4"},
                {"from": "p3", "to": "p5"},
                {"from": "p4", "to": "p5"},
                {"from": "p5", "to": "p6"},
                {"from": "p6", "to": "p7"},
            ]

    # =========================================================================
    # 3. ИНФОРМАТИКА (5–11 КЛАССЫ)
    # =========================================================================
    elif subj in ("cs", "inf"):
        nodes = [
            {"id": "c1", "title": "Кодирование информации и алфавит (I = K·i)", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Семакин 7 класс:\nСколько бит содержит сообщение объемом 2 Кбайта?"},
            {"id": "c2", "title": "Системы счисления (2, 8, 16-ричные)", "level": 2, "status": "mastered", "mastery": 85, "x": 260, "y": 100, "task": "Босова:\nПереведите число 25 из десятичной системы в двоичную."},
            {"id": "c3", "title": "КЕГЭ №2: Логические функции и таблицы истинности", "level": 2, "status": "in_progress", "mastery": 60, "x": 260, "y": 260, "task": "Постройте таблицу истинности для выражения f = (x <= y) and (y <= z) or (w == 1)."},
            {"id": "c4", "title": "Python: Ветвления, Циклы и Списки", "level": 3, "status": "in_progress", "mastery": 70, "x": 460, "y": 100, "task": "Поляков 9 класс:\nНапишите программу на Python, находящую сумму нечетных чисел от 1 до 150."},
            {"id": "c5", "title": "КЕГЭ №8: Комбинаторика и библиотека itertools", "level": 3, "status": "weak", "mastery": 35, "x": 460, "y": 260, "task": "Сколько 5-буквенных слов можно составить из букв слова ВИШНЯ, если буква Ш встречается не более 1 раза?"},
            {"id": "c6", "title": "КЕГЭ №14: Позиционные системы счисления", "level": 4, "status": "weak", "mastery": 25, "x": 660, "y": 180, "task": "Значение выражения 4¹² + 2³⁰ - 32 записали в 4-ричной системе. Сколько цифр 3 в этой записи?"},
            {"id": "c7", "title": "КЕГЭ №17 / 24: Анализ числовых последовательностей и строк", "level": 5, "status": "locked", "mastery": 10, "x": 860, "y": 180, "task": "Напишите программу для нахождения самой длинной цепочки одинаковых символов в текстовом файле."},
        ]
        edges = [
            {"from": "c1", "to": "c2"},
            {"from": "c1", "to": "c3"},
            {"from": "c2", "to": "c4"},
            {"from": "c3", "to": "c4"},
            {"from": "c4", "to": "c5"},
            {"from": "c4", "to": "c6"},
            {"from": "c5", "to": "c7"},
            {"from": "c6", "to": "c7"},
        ]

    # =========================================================================
    # 4. ХИМИЯ (8–11 КЛАССЫ)
    # =========================================================================
    elif subj in ("chemistry", "chem"):
        nodes = [
            {"id": "ch1", "title": "Строение атома и Периодический закон", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Определите число протонов, нейтронов и электронов в атоме натрия (Na)."},
            {"id": "ch2", "title": "Химическая связь и кристаллическая решетка", "level": 2, "status": "mastered", "mastery": 80, "x": 260, "y": 100, "task": "Определите тип химической связи в молекулах: NaCl, H₂O, O₂."},
            {"id": "ch3", "title": "Классы неорганических веществ (Оксиды, Кислоты, Соли)", "level": 2, "status": "in_progress", "mastery": 65, "x": 260, "y": 260, "task": "Габриелян 8 класс:\nЗакончите уравнение реакции: NaOH + HCl -> ?"},
            {"id": "ch4", "title": "Реакции ионного обмена (РИО) и осадки", "level": 3, "status": "weak", "mastery": 35, "x": 480, "y": 100, "task": "Составьте полное и сокращенное ионное уравнение: Na₂CO₃ + 2HCl -> 2NaCl + H₂O + CO₂."},
            {"id": "ch5", "title": "Окислительно-восстановительные реакции (ОВР)", "level": 3, "status": "weak", "mastery": 25, "x": 480, "y": 260, "task": "ЕГЭ №29:\nСоставьте уравнение ОВР методом электронного баланса."},
            {"id": "ch6", "title": "Молярные расчеты и массовая доля (w = m/M·100%)", "level": 4, "status": "weak", "mastery": 20, "x": 680, "y": 180, "task": "Вычислите массовую долю растворенного вещества в 200 г 15%-го раствора."},
            {"id": "ch7", "title": "Органическая химия и Изомерия", "level": 5, "status": "locked", "mastery": 10, "x": 860, "y": 180, "task": "Напишите структурные формулы двух изомеров бутана C₄H₁₀."},
        ]
        edges = [
            {"from": "ch1", "to": "ch2"},
            {"from": "ch1", "to": "ch3"},
            {"from": "ch2", "to": "ch4"},
            {"from": "ch3", "to": "ch4"},
            {"from": "ch3", "to": "ch5"},
            {"from": "ch4", "to": "ch6"},
            {"from": "ch5", "to": "ch6"},
            {"from": "ch6", "to": "ch7"},
        ]

    # =========================================================================
    # 5. ГЕОМЕТРИЯ (7–11 КЛАССЫ)
    # =========================================================================
    elif subj == "geometry":
        if grade <= 9:
            nodes = [
                {"id": "g1", "title": "Смежные и вертикальные углы", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Один из смежных углов равен 65°. Найдите второй угол."},
                {"id": "g2", "title": "Признаки равенства треугольников", "level": 2, "status": "mastered", "mastery": 85, "x": 260, "y": 100, "task": "Сформулируйте первый признак равенства треугольников (по двум сторонам и углу между ними)."},
                {"id": "g3", "title": "Равнобедренный треугольник и его свойства", "level": 2, "status": "in_progress", "mastery": 70, "x": 260, "y": 260, "task": "Атанасян 7 класс:\nВ равнобедренном треугольнике ABC угол при вершине B = 80°. Найдите углы A и C."},
                {"id": "g4", "title": "Параллельные прямые и секущая", "level": 3, "status": "in_progress", "mastery": 60, "x": 480, "y": 100, "task": "Найдите накрест лежащие углы при параллельных прямых a и b."},
                {"id": "g5", "title": "Теорема Пифагора и Прямоугольный треугольник", "level": 3, "status": "in_progress", "mastery": 55, "x": 480, "y": 260, "task": "В прямоугольном треугольнике катеты равны 6 и 8. Найдите гипотенузу."},
                {"id": "g6", "title": "Площади плоских фигур (Треугольник, Трапеция, Ромб)", "level": 4, "status": "weak", "mastery": 30, "x": 680, "y": 180, "task": "Найдите площадь трапеции с основаниями 5 см и 9 см и высотой 4 см."},
                {"id": "g7", "title": "ОГЭ №15–19: Окружности, касательные и вписанные углы", "level": 5, "status": "locked", "mastery": 15, "x": 860, "y": 180, "task": "Найдите величину вписанного угла, опирающегося на дугу 70°."},
            ]
            edges = [
                {"from": "g1", "to": "g2"},
                {"from": "g1", "to": "g3"},
                {"from": "g2", "to": "g4"},
                {"from": "g3", "to": "g4"},
                {"from": "g3", "to": "g5"},
                {"from": "g4", "to": "g6"},
                {"from": "g5", "to": "g6"},
                {"from": "g6", "to": "g7"},
            ]
        else:
            nodes = [
                {"id": "g1", "title": "Планиметрия: Теоремы синусов и косинусов", "level": 1, "status": "mastered", "mastery": 90, "x": 80, "y": 180, "task": "В треугольнике стороны равны 5 и 8, угол между ними 60°. Найдите третью сторону."},
                {"id": "g2", "title": "Аксиомы стереометрии и взаимное расположение прямых", "level": 2, "status": "mastered", "mastery": 80, "x": 260, "y": 100, "task": "Атанасян 10 класс:\nДаны скрещивающиеся прямые a и b. Каково расстояние между ними?"},
                {"id": "g3", "title": "Перпендикулярность прямой и плоскости", "level": 2, "status": "in_progress", "mastery": 60, "x": 260, "y": 260, "task": "Сформулируйте теорему о трех перпендикулярах."},
                {"id": "g4", "title": "Многогранники: Призма и Пирамида (S, V)", "level": 3, "status": "in_progress", "mastery": 50, "x": 480, "y": 100, "task": "В правильной четырехугольной пирамиде сторона основания 6, высота 4. Найдите объем."},
                {"id": "g5", "title": "Тела вращения: Цилиндр, Конус, Шар", "level": 3, "status": "weak", "mastery": 35, "x": 480, "y": 260, "task": "Найдите объем конуса с радиусом основания 3 см и высотой 4 см."},
                {"id": "g6", "title": "ЕГЭ №14: Стереометрическая задача (Сечения и углы)", "level": 4, "status": "weak", "mastery": 20, "x": 680, "y": 180, "task": "ЕГЭ №14:\nПостройте сечение пирамиды плоскостью и найдите угол между плоскостями."},
                {"id": "g7", "title": "ЕГЭ №17: Сложная планиметрия (Окружности и подобие)", "level": 5, "status": "locked", "mastery": 10, "x": 860, "y": 180, "task": "В треугольнике проведены высоты. Докажите подобие образованных треугольников."},
            ]
            edges = [
                {"from": "g1", "to": "g2"},
                {"from": "g1", "to": "g3"},
                {"from": "g2", "to": "g4"},
                {"from": "g3", "to": "g4"},
                {"from": "g3", "to": "g5"},
                {"from": "g4", "to": "g6"},
                {"from": "g5", "to": "g6"},
                {"from": "g6", "to": "g7"},
            ]

    # =========================================================================
    # 6. МАТЕМАТИКА / АЛГЕБРА (ПО УМОЛЧАНИЮ)
    # =========================================================================
    else:
        if grade <= 6:
            nodes = [
                {"id": "m1", "title": "Натуральные числа и разряды", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Найдите сумму чисел: 254 + 389"},
                {"id": "m2", "title": "Сложение и вычитание в столбик", "level": 1, "status": "mastered", "mastery": 90, "x": 220, "y": 120, "task": "Вычислите: 1250 - 485"},
                {"id": "m3", "title": "Умножение и деление уголком", "level": 2, "status": "mastered", "mastery": 85, "x": 220, "y": 240, "task": "Вычислите: 124 * 15 + 3600 : 18"},
                {"id": "m4", "title": "Порядок действий и скобки", "level": 2, "status": "in_progress", "mastery": 65, "x": 380, "y": 180, "task": "Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$"},
                {"id": "m5", "title": "Обыкновенные дроби (Понятие)", "level": 3, "status": "in_progress", "mastery": 55, "x": 520, "y": 120, "task": "Какую часть часа составляют 25 минут?"},
                {"id": "m6", "title": "Сложение дробей с равными знаменателями", "level": 3, "status": "weak", "mastery": 30, "x": 520, "y": 240, "task": "Вычислите: $$\\frac{3}{11} + \\frac{5}{11}$$"},
                {"id": "m7", "title": "Смешанные числа и перевод в неправильную дробь", "level": 4, "status": "weak", "mastery": 25, "x": 680, "y": 180, "task": "Выделите целую часть из дроби: $$\\frac{29}{6}$$"},
                {"id": "m8", "title": "Периметр и площадь прямоугольника (P, S)", "level": 4, "status": "locked", "mastery": 10, "x": 820, "y": 180, "task": "Найдите площадь прямоугольника со сторонами 12 см и 8 см."},
            ]
            edges = [
                {"from": "m1", "to": "m2"},
                {"from": "m1", "to": "m3"},
                {"from": "m2", "to": "m4"},
                {"from": "m3", "to": "m4"},
                {"from": "m4", "to": "m5"},
                {"from": "m4", "to": "m6"},
                {"from": "m5", "to": "m7"},
                {"from": "m6", "to": "m7"},
                {"from": "m7", "to": "m8"},
            ]
        elif grade <= 9:
            nodes = [
                {"id": "m1", "title": "Линейные уравнения", "level": 1, "status": "mastered", "mastery": 90, "x": 80, "y": 180, "task": "Решите уравнение: 4x + 3x = 77"},
                {"id": "m2", "title": "Формулы сокращенного умножения (ФСУ)", "level": 2, "status": "mastered", "mastery": 85, "x": 240, "y": 120, "task": "Раскройте скобки: (x - 3)^2"},
                {"id": "m3", "title": "Квадратные корни и иррациональность", "level": 2, "status": "in_progress", "mastery": 60, "x": 240, "y": 240, "task": "Упростите выражение: $$\\sqrt{72} - \\sqrt{18}$$"},
                {"id": "m4", "title": "Квадратные уравнения (Дискриминант D)", "level": 3, "status": "in_progress", "mastery": 50, "x": 420, "y": 180, "task": "Макарычев 8 класс:\n$$x^2 - 5x + 6 = 0$$"},
                {"id": "m5", "title": "Теорема Виета и разложение на множители", "level": 3, "status": "weak", "mastery": 35, "x": 580, "y": 120, "task": "Найдите корни по теореме Виета: $$x^2 - 7x + 10 = 0$$"},
                {"id": "m6", "title": "Дробно-рациональные уравнения и ОДЗ", "level": 4, "status": "weak", "mastery": 20, "x": 580, "y": 240, "task": "Решите уравнение: $$\\frac{x+2}{x-1} = 4$$"},
                {"id": "m7", "title": "ОГЭ №20: Нелинейные системы уравнений", "level": 4, "status": "locked", "mastery": 10, "x": 760, "y": 180, "task": "Решите систему уравнений:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$"},
                {"id": "m8", "title": "Теорема Пифагора и Планиметрия ОГЭ", "level": 3, "status": "in_progress", "mastery": 70, "x": 420, "y": 320, "task": "В прямоугольном треугольнике катеты равны 6 и 8. Найдите гипотенузу."},
            ]
            edges = [
                {"from": "m1", "to": "m2"},
                {"from": "m1", "to": "m3"},
                {"from": "m2", "to": "m4"},
                {"from": "m3", "to": "m4"},
                {"from": "m4", "to": "m5"},
                {"from": "m4", "to": "m6"},
                {"from": "m5", "to": "m7"},
                {"from": "m6", "to": "m7"},
                {"from": "m3", "to": "m8"},
            ]
        else:
            nodes = [
                {"id": "m1", "title": "Базовая алгебра и многочлены", "level": 1, "status": "mastered", "mastery": 95, "x": 80, "y": 180, "task": "Разложите на множители: x^3 - 4x"},
                {"id": "m2", "title": "Тригонометрический круг и формулы", "level": 2, "status": "in_progress", "mastery": 65, "x": 260, "y": 100, "task": "Вычислите: $$\\sin(2x) = 2\\sin x \\cos x$$"},
                {"id": "m3", "title": "Показательные уравнения и степени", "level": 2, "status": "mastered", "mastery": 80, "x": 260, "y": 260, "task": "Решите: $$2^{x+1} + 2^x = 24$$"},
                {"id": "m4", "title": "ЕГЭ №13: Тригонометрические уравнения", "level": 3, "status": "in_progress", "mastery": 45, "x": 460, "y": 100, "task": "а) Решите уравнение: $$2\\sin^2 x + \\sqrt{3}\\sin x = 0$$\nб) Укажите корни на отрезке $[\\pi, 2.5\\pi]$."},
                {"id": "m5", "title": "Логарифмические уравнения и свойства", "level": 3, "status": "in_progress", "mastery": 55, "x": 460, "y": 260, "task": "Решите: $$\\log_3(x + 5) = 2$$"},
                {"id": "m6", "title": "ЕГЭ №15: Логарифмические неравенства и ОДЗ", "level": 4, "status": "weak", "mastery": 25, "x": 660, "y": 260, "task": "Решите неравенство: $$\\log_3(x + 5) > 2$$"},
                {"id": "m7", "title": "Производная функции и исследование (ЕГЭ №12)", "level": 3, "status": "in_progress", "mastery": 40, "x": 460, "y": 380, "task": "Найдите точку максимума: $$y = x^3 - 3x^2 + 5$$"},
                {"id": "m8", "title": "ЕГЭ №18: Уравнения и системы с ПАРАМЕТРОМ", "level": 5, "status": "weak", "mastery": 15, "x": 860, "y": 180, "task": "Найдите все значения $a$, при которых система имеет 2 решения:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ (x - 4)^2 + (y - 3)^2 = a^2 \\end{cases}$$"},
            ]
            edges = [
                {"from": "m1", "to": "m2"},
                {"from": "m1", "to": "m3"},
                {"from": "m2", "to": "m4"},
                {"from": "m3", "to": "m5"},
                {"from": "m5", "to": "m6"},
                {"from": "m4", "to": "m8"},
                {"from": "m6", "to": "m8"},
                {"from": "m3", "to": "m7"},
            ]

    return {
        "subject": subject,
        "grade": grade,
        "total_nodes": len(nodes),
        "nodes": nodes,
        "edges": edges,
    }


@router.get("/analytics")
async def get_analytics_endpoint(
    subject: str = Query("math"),
    grade: int = Query(5),
    mastery: float = Query(0.0),
):
    """Честная аналитика успеваемости ученика на основе реальных занятий."""
    return analytics_service.get_student_analytics(
        subject=subject, grade=grade, p_mastery=mastery
    )


@router.get("/recommendations")
async def get_next_recommendation(
    subject: str = Query("math"),
    grade: int = Query(5),
    mastery: float = Query(0.35),
):
    return recommendation_engine.get_next_best_action(
        subject=subject, current_mastery=mastery, grade=grade
    )


@router.get("/")
async def get_competencies(
    subject: str = "math", db: AsyncSession = Depends(get_db)
):
    stmt = select(Competency).where(Competency.subject == subject)
    result = await db.execute(stmt)
    competencies = result.scalars().all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "fipi_code": c.fipi_code,
            "difficulty": c.difficulty_level,
        }
        for c in competencies
    ]


@router.post("/theory")
async def get_dynamic_task_theory(data: TheoryRequestSchema):
    return await dynamic_theory_service.generate_task_theory(
        subject=data.subject,
        task_context=data.task_context,
        competency_title=data.competency_title,
    )


@router.post("/cheatsheet")
async def get_dynamic_cheatsheet_endpoint(data: CheatsheetRequestSchema):
    """100% Динамическая ИИ-генерация конспекта А4 под любую задачу."""
    return await dynamic_theory_service.generate_cheatsheet_a4(
        subject=data.subject,
        grade=data.grade,
        exam_type=data.exam_type,
        task_context=data.task_context,
        competency_title=data.competency_title,
    )


@router.post("/generate-similar")
async def generate_similar_task_endpoint(data: SimilarTaskRequestSchema):
    generated_text = await task_generator_service.generate_similar_task(
        subject=data.subject,
        grade=data.grade,
        exam_type=data.exam_type,
        task_context=data.task_context,
    )
    return {"generated_task": generated_text}


@router.post("/verify-answer")
async def verify_answer_endpoint(data: AnswerVerifySchema):
    """Каскадная символьная верификация ответа (Базовый + Продвинутый верификатор)."""
    is_correct = math_verifier.verify_final_answer(
        data.task_context, data.student_answer
    )

    if not is_correct:
        ans = data.student_answer.strip()
        task = data.task_context.strip()

        if any(b in ans for b in ("[", "]", "(", ")")):
            int_res = advanced_math_verifier.verify_inequality(task, ans)
            if int_res.get("is_correct"):
                is_correct = True

        if not is_correct and ("{" in ans or ";" in ans or "," in ans):
            set_res = advanced_math_verifier.verify_solution_set(task, ans)
            if set_res.get("is_correct"):
                is_correct = True

        if not is_correct and any(
            w in task.lower() for w in ("производн", "найдите f'", "diff")
        ):
            if advanced_math_verifier.verify_derivative(task, ans):
                is_correct = True

        if not is_correct and any(
            u in ans.lower()
            for u in ("см", "мм", "м", "км", "кг", "г", "мин", "сек", "с", "ч")
        ):
            if advanced_math_verifier.verify_quantity(task, ans):
                is_correct = True

    return {"is_correct": is_correct, "student_answer": data.student_answer}


@router.post("/fipi-evaluate")
async def evaluate_fipi_solution_endpoint(data: FipiEvaluationRequest):
    return await fipi_evaluator_service.evaluate_solution(
        subject=data.subject,
        task_context=data.task_context,
        student_solution=data.student_solution,
        exam_type=data.exam_type,
    )
