import datetime
from typing import Any, Dict, List


class AnalyticsService:
    """Сервис математического расчета 100% адаптивной аналитики с привязкой задач."""

    # Русские дни недели
    RU_WEEKDAYS = {
        0: "ПН",
        1: "ВТ",
        2: "СР",
        3: "ЧТ",
        4: "ПТ",
        5: "СБ",
        6: "ВС",
    }

    GRADE_TOPICS_MAP = {
        5: [
            {
                "title": "Порядок выполнения арифметических действий",
                "subject": "Математика",
                "base": 30,
                "task_template": "Виленкин 5 класс (№342):\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$",
            },
            {
                "title": "Сложение и вычитание обыкновенных дробей",
                "subject": "Математика",
                "base": 25,
                "task_template": "Виленкин 5 класс (Дроби):\nВычислите значение суммы дробей с одинаковыми знаменателями:\n$$\\frac{5}{12} + \\frac{2}{12}$$",
            },
            {
                "title": "Текстовые задачи на движение и части",
                "subject": "Математика",
                "base": 35,
                "task_template": "Виленкин 5 класс (Задачи на дроби):\nМаша прочитала $35$ страниц книги, что составляет $\\frac{1}{3}$ всей книги. Сколько всего страниц в книге?",
            },
        ],
        6: [
            {
                "title": "Нахождение Наименьшего Общего Кратного (НОК)",
                "subject": "Математика",
                "base": 35,
                "task_template": "Мерзляк 6 класс (№120):\nНайдите наименьшее общее кратное (НОК) чисел $28$ и $42$.",
            },
            {
                "title": "Сложение и вычитание отрицательных чисел",
                "subject": "Математика",
                "base": 30,
                "task_template": "Вычислите значение выражения:\n$$-15 + (-25) - (-10)$$",
            },
            {
                "title": "Основное свойство пропорции",
                "subject": "Математика",
                "base": 25,
                "task_template": "Мерзляк 6 класс (Пропорции):\nНайдите неизвестный член пропорции:\n$$\\frac{x}{12} = \\frac{5}{6}$$",
            },
        ],
        7: [
            {
                "title": "Линейные уравнения с переносом слагаемых",
                "subject": "Алгебра",
                "base": 35,
                "task_template": "Макарычев 7 класс:\nРешите линейное уравнение:\n$$3x + 5 = 20$$",
            },
            {
                "title": "Теорема о сумме углов треугольника",
                "subject": "Геометрия",
                "base": 25,
                "task_template": "Атанасян 7 класс (№105):\nВ равнобедренном треугольнике $ABC$ угол при вершине $B = 80^\\circ$. Найдите углы при основании.",
            },
            {
                "title": "Формулы сокращенного умножения (ФСУ)",
                "subject": "Алгебра",
                "base": 30,
                "task_template": "Макарычев 7 класс (ФСУ):\nРазложите на множители разность квадратов:\n$$x^2 - 49$$",
            },
        ],
        8: [
            {
                "title": "Решение квадратных уравнений через дискриминант",
                "subject": "Алгебра",
                "base": 30,
                "task_template": "Макарычев 8 класс (№210):\nРешите квадратное уравнение через дискриминант:\n$$x^2 - 5x + 6 = 0$$",
            },
            {
                "title": "Теорема Пифагора в прямоугольном треугольнике",
                "subject": "Геометрия",
                "base": 25,
                "task_template": "Атанасян 8 класс:\nВ прямоугольном треугольнике катеты равны $6\\text{ см}$ и $8\\text{ см}$. Найдите гипотенузу.",
            },
            {
                "title": "Свойства арифметического квадратного корня",
                "subject": "Алгебра",
                "base": 30,
                "task_template": "Макарычев 8 класс (Корни):\nУпростите выражение:\n$$\\sqrt{75} - \\sqrt{12}$$",
            },
        ],
        9: [
            {
                "title": "Построение и свойства квадратичной функции (y = ax² + bx + c)",
                "subject": "Алгебра",
                "base": 30,
                "task_template": "Макарычев 9 класс:\nПостройте график функции $y = x^2 - 4x + 3$ и найдите наименьшее значение функции.",
            },
            {
                "title": "Нелинейные системы уравнений второй степени (ОГЭ №20)",
                "subject": "Математика",
                "base": 25,
                "task_template": "Задание №20 (ОГЭ):\nРешите систему уравнений:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$",
            },
            {
                "title": "Теория вероятностей и классическое определение (ОГЭ №10)",
                "subject": "Математика",
                "base": 35,
                "task_template": "Задание №10 (ОГЭ):\nВ случайном эксперименте симметричную монету бросают дважды. Найдите вероятность того, что орел выпадет ровно один раз.",
            },
            {
                "title": "Длина окружности и площадь круга (ОГЭ №16)",
                "subject": "Геометрия",
                "base": 25,
                "task_template": "Атанасян 9 класс (Геометрия):\nНайдите радиус окружности, описанной около прямоугольного треугольника с гипотенузой $10\\text{ см}$.",
            },
        ],
        10: [
            {
                "title": "Показательные уравнения и методы их решения",
                "subject": "Алгебра",
                "base": 30,
                "task_template": "Алимов 10-11 класс:\nРешите показательное уравнение:\n$$2^{x+1} + 2^x = 24$$",
            },
            {
                "title": "Тригонометрические функции числового аргумента",
                "subject": "Математика",
                "base": 25,
                "task_template": "Алимов 10 класс (Тригонометрия):\nУпростите выражение:\n$$\\sin^2(x) + \\cos^2(x) + \\text{tg}^2(x)$$",
            },
            {
                "title": "Стереометрия: параллельность и перпендикулярность плоскостей",
                "subject": "Геометрия",
                "base": 20,
                "task_template": "Атанасян 10 класс:\nДаны параллельные плоскости $\\alpha$ и $\\beta$. Расстояние между ними равно $12\\text{ см}$.",
            },
        ],
        11: [
            {
                "title": "Отбор корней на тригонометрической окружности (№13)",
                "subject": "Математика",
                "base": 20,
                "task_template": "Задание №13 (ЕГЭ):\nа) Решите уравнение: $$2\\sin^2(x) + \\sqrt{3}\\sin(x) = 0$$\nб) Укажите корни на отрезке $[\\pi, \\frac{5\\pi}{2}]$.",
            },
            {
                "title": "Логарифмические неравенства с переменным основанием (№15)",
                "subject": "Алгебра",
                "base": 15,
                "task_template": "Задание №15 (ЕГЭ):\nРешите логарифмическое неравенство:\n$$\\log_3(x + 5) > 2$$",
            },
            {
                "title": "Геометрический метод в задачах с параметром (№18)",
                "subject": "Математика",
                "base": 15,
                "task_template": "Задание №18 (ЕГЭ с параметром):\nНайдите все значения $a$, при которых система имеет 2 решения:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ (x - 4)^2 + (y - 3)^2 = a^2 \\end{cases}$$",
            },
            {
                "title": "Стереометрия: объемы многогранников и тел вращения (№14)",
                "subject": "Геометрия",
                "base": 20,
                "task_template": "Задание №14 (ЕГЭ Стереометрия):\nВ правильной четырехугольной пирамиде $SABCD$ сторона основания $AB = 6$, $SA = 5$. Найдите объем пирамиды.",
            },
        ],
    }

    def get_student_analytics(
        self,
        subject: str = "math",
        grade: int = 5,
        p_mastery: float = 0.0,
    ) -> Dict[str, Any]:
        is_started = p_mastery > 0.05

        if not is_started:
            projected_score = 0
            accuracy_percent = 0
            tasks_solved_total = 0
            streak_days = 0
            study_hours = 0.0
            avg_time = 0.0
            subject_mastery = {
                "math": 0,
                "algebra": 0,
                "geometry": 0,
                "physics": 0,
                "chemistry": 0,
                "cs": 0,
                "russian": 0,
            }
        else:
            projected_score = round(p_mastery * 100)
            accuracy_percent = min(100, max(50, round(p_mastery * 100)))
            tasks_solved_total = max(1, round(p_mastery * 15))
            streak_days = 1
            study_hours = 0.5
            avg_time = 3.2
            subject_mastery = {
                "math": round(p_mastery * 100) if subject == "math" else 0,
                "algebra": (
                    round(p_mastery * 100) if subject == "algebra" else 0
                ),
                "geometry": (
                    round(p_mastery * 100) if subject == "geometry" else 0
                ),
                "physics": (
                    round(p_mastery * 100) if subject == "physics" else 0
                ),
                "chemistry": (
                    round(p_mastery * 100) if subject == "chemistry" else 0
                ),
                "cs": round(p_mastery * 100) if subject == "cs" else 0,
                "russian": (
                    round(p_mastery * 100) if subject == "russian" else 0
                ),
            }

        # 14-дневная тепловая карта СТРОГО С РУССКИМИ ДНЯМИ НЕДЕЛИ (ПН, ВТ, СР, ЧТ, ПТ, СБ, ВС)
        today = datetime.date.today()
        heatmap = []
        for i in range(13, -1, -1):
            day_date = today - datetime.timedelta(days=i)
            count_today = 1 if (i == 0 and is_started) else 0
            ru_day_name = self.RU_WEEKDAYS.get(day_date.weekday(), "ПН")
            heatmap.append(
                {
                    "date": day_date.strftime("%d.%m"),
                    "day_name": ru_day_name,
                    "count": count_today,
                    "intensity": min(3, count_today),
                }
            )

        weak_topics = []
        if is_started:
            grade_topics = self.GRADE_TOPICS_MAP.get(
                grade, self.GRADE_TOPICS_MAP[9 if grade >= 9 else 5]
            )
            for t in grade_topics:
                calculated_mastery = max(
                    15, min(65, round(p_mastery * t["base"] * 1.5))
                )
                weak_topics.append(
                    {
                        "title": t["title"],
                        "subject": t["subject"],
                        "mastery": calculated_mastery,
                        "urgency": (
                            "Высокая" if calculated_mastery < 35 else "Средняя"
                        ),
                        "task_template": t["task_template"],
                    }
                )

        mastered_topics = []
        if projected_score >= 60:
            mastered_topics = [
                {
                    "title": f"Базовые навыки программы {grade} класса",
                    "subject": "Математика",
                    "mastery": 92,
                }
            ]

        return {
            "is_started": is_started,
            "projected_score": projected_score,
            "target_score": 85 if grade >= 10 else 5,
            "p_mastery": p_mastery,
            "tasks_solved_total": tasks_solved_total,
            "accuracy_percent": accuracy_percent,
            "streak_days": streak_days,
            "avg_time_per_task_min": avg_time,
            "total_study_time_hours": study_hours,
            "subject_mastery": subject_mastery,
            "activity_heatmap": heatmap,
            "weak_competencies": weak_topics,
            "mastered_competencies": mastered_topics,
        }


analytics_service = AnalyticsService()
