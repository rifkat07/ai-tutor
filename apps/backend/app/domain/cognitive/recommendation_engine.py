from typing import Any, Dict, List, Optional


def format_points_word(n: int) -> str:
    """Грамматически правильное склонение слова 'балл' в русском языке."""
    abs_n = abs(n) % 100
    last_digit = abs_n % 10

    if 11 <= abs_n <= 19:
        return "баллов"
    if last_digit == 1:
        return "балл"
    if 2 <= last_digit <= 4:
        return "балла"
    return "баллов"


class RecommendationEngine:
    """Интеллектуальный рекомендательный движок с учетом успеваемости и строгой фильтрацией по классу."""

    KNOWLEDGE_GRAPH = {
        "math": [
            # 5 КЛАСС
            {
                "id": "order_of_operations_5",
                "title": "Порядок действий: Умножение и Деление перед Сложением",
                "grade": 5,
                "exam_weight": 2,
                "default_mastery": 0.40,
                "prerequisites": [],
                "task_template": "Виленкин 5 класс:\nНайдите значение выражения:\n$$124 \\cdot 15 + 3600 : 18 - 450$$",
                "bottleneck_hint": "Главный фундамент 5 класса: гарантирует уверенный прирост к оценкам",
            },
            {
                "id": "linear_equations_5",
                "title": "Простые уравнения на приведение подобных слагаемых",
                "grade": 5,
                "exam_weight": 2,
                "default_mastery": 0.30,
                "prerequisites": ["order_of_operations_5"],
                "task_template": "Виленкин 5 класс:\nРешите уравнение:\n$$4x + 3x = 77$$",
                "bottleneck_hint": "База 5 класса: фундамент для уравнений средней школы",
            },
            {
                "id": "fractions_sum_5",
                "title": "Сложение и вычитание обыкновенных дробей",
                "grade": 5,
                "exam_weight": 2,
                "default_mastery": 0.25,
                "prerequisites": ["order_of_operations_5"],
                "task_template": "Вычислите значение:\n$$\\frac{5}{12} + \\frac{2}{12}$$",
                "bottleneck_hint": "Ключевой навык для работы с дробями в 5–6 классах",
            },

            # 6 КЛАСС
            {
                "id": "lcm_gcd_6",
                "title": "Нахождение Наименьшего Общего Кратного (НОК)",
                "grade": 6,
                "exam_weight": 2,
                "default_mastery": 0.35,
                "prerequisites": [],
                "task_template": "Мерзляк 6 класс:\nНайдите НОК чисел $28$ и $42$.",
                "bottleneck_hint": "Необходимо для сложения дробей с разными знаменателями",
            },
            {
                "id": "negative_numbers_6",
                "title": "Сложение и вычитание отрицательных чисел",
                "grade": 6,
                "exam_weight": 2,
                "default_mastery": 0.30,
                "prerequisites": [],
                "task_template": "Вычислите:\n$$-15 + (-25) - (-10)$$",
                "bottleneck_hint": "Устраняет типичные ошибки со знаками минуса",
            },

            # 7 КЛАСС
            {
                "id": "linear_eq_7",
                "title": "Линейные уравнения с переносом слагаемых",
                "grade": 7,
                "exam_weight": 3,
                "default_mastery": 0.35,
                "prerequisites": [],
                "task_template": "Макарычев 7 класс:\nРешите уравнение:\n$$3x + 5 = 20$$",
                "bottleneck_hint": "Ключевая тема алгебры 7 класса",
            },
            {
                "id": "triangle_angles_7",
                "title": "Теорема о сумме углов равнобедренного треугольника",
                "grade": 7,
                "exam_weight": 3,
                "default_mastery": 0.25,
                "prerequisites": [],
                "task_template": "Атанасян 7 класс:\nВ равнобедренном треугольнике $\\angle B = 80^\\circ$. Найдите углы при основании.",
                "bottleneck_hint": "Основа всей планиметрии 7–9 классов",
            },

            # 8 КЛАСС
            {
                "id": "discriminant_8",
                "title": "Решение квадратных уравнений через дискриминант",
                "grade": 8,
                "exam_weight": 3,
                "default_mastery": 0.30,
                "prerequisites": [],
                "task_template": "Макарычев 8 класс:\nРешите уравнение через дискриминант:\n$$x^2 - 5x + 6 = 0$$",
                "bottleneck_hint": "Главная тема курса алгебры 8 класса",
            },

            # 9 КЛАСС (ОГЭ)
            {
                "id": "oge_systems_20",
                "title": "ОГЭ Задание №20: Нелинейные системы уравнений",
                "grade": 9,
                "exam_weight": 3,
                "default_mastery": 0.25,
                "prerequisites": [],
                "task_template": "ОГЭ №20:\nРешите систему уравнений:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$",
                "bottleneck_hint": "Приносит +2 первичных балла во 2-й части ОГЭ",
            },

            # 10–11 КЛАССЫ (ЕГЭ)
            {
                "id": "trig_factorization_10",
                "title": "Вынесение общего множителя в тригонометрии (ЕГЭ №13)",
                "grade": 10,
                "exam_weight": 3,
                "default_mastery": 0.35,
                "prerequisites": [],
                "task_template": "Решите уравнение: $$2\\sin^2(x) + \\sqrt{3}\\sin(x) = 0$$",
                "bottleneck_hint": "Базовый навык для получения 2 баллов в Задании №13 ЕГЭ",
            },
            {
                "id": "parameter_circles_11",
                "title": "Геометрический метод решения задач с параметром (ЕГЭ №18)",
                "grade": 11,
                "exam_weight": 4,
                "default_mastery": 0.15,
                "prerequisites": ["trig_factorization_10"],
                "task_template": "Найдите все значения параметра $a$, при которых система имеет 2 решения:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ (x - 4)^2 + (y - 3)^2 = a^2 \\end{cases}$$",
                "bottleneck_hint": "Ключ к решению сложнейшего Задания №18 (+4 первичных балла)",
            },
        ],
        "physics": [
            {
                "id": "speed_calc_7",
                "title": "Расчет скорости и пути при равномерном движении",
                "grade": 7,
                "exam_weight": 2,
                "default_mastery": 0.40,
                "prerequisites": [],
                "task_template": "Пёрышкин 7 класс:\nЧеловек проходит $s = 1.2\\text{ км}$ за $t = 20\\text{ мин}$. Найдите скорость в м/с.",
                "bottleneck_hint": "Фундамент кинематики и механики",
            },
            {
                "id": "momentum_9",
                "title": "Закон сохранения импульса в проекциях (ЕГЭ №21)",
                "grade": 9,
                "exam_weight": 3,
                "default_mastery": 0.25,
                "prerequisites": [],
                "task_template": "Два тела массами $m_1 = 2\\text{ кг}$ и $m_2 = 3\\text{ кг}$ движутся навстречу. Найдите скорость после удара.",
                "bottleneck_hint": "Дает уверенный прирост баллов во 2-й части ЕГЭ",
            },
        ],
        "russian": [
            {
                "id": "subject_predicate_5",
                "title": "Синтаксис: Нахождение подлежащего и сказуемого",
                "grade": 5,
                "exam_weight": 2,
                "default_mastery": 0.40,
                "prerequisites": [],
                "task_template": "Ладыженская 5 класс:\nНайдите главные члены предложения:\n«Осенью лесные поляны усыпаны золотистыми листьями».",
                "bottleneck_hint": "База для пунктуации в сложных предложениях ОГЭ и ЕГЭ",
            }
        ],
    }

    def get_next_best_action(
        self,
        subject: str,
        current_mastery: float = 0.35,
        grade: int = 5,
        recent_mistakes_count: int = 0,
    ) -> Dict[str, Any]:
        """Динамический расчет рекомендации на основе успеваемости и класса ученика."""
        nodes = self.KNOWLEDGE_GRAPH.get(
            subject, self.KNOWLEDGE_GRAPH["math"]
        )

        # 1. СТРОГАЯ ФИЛЬТРАЦИЯ: Темы только текущего класса ученика (или фундаментальные ниже)
        grade_nodes = [n for n in nodes if n["grade"] <= grade]
        if not grade_nodes:
            grade_nodes = [
                n for n in nodes if n["grade"] == min(x["grade"] for x in nodes)
            ]

        candidates = []
        for node in grade_nodes:
            base_mastery = node.get("default_mastery", 0.35)
            # Индивидуальный расчет вероятности владения темой
            effective_mastery = min(
                0.95, max(0.1, (base_mastery + current_mastery) / 2)
            )

            # Расчет потенциального прироста баллов к прогнозу
            raw_gain = node["exam_weight"] * (1.0 - effective_mastery) * 3.5
            potential_gain = max(2, round(raw_gain))

            # Бонус приоритета, если по теме были ошибки
            priority_score = potential_gain + (recent_mistakes_count * 0.5)

            points_word = format_points_word(potential_gain)

            candidates.append(
                {
                    "node_id": node["id"],
                    "title": node["title"],
                    "grade": node["grade"],
                    "potential_score_gain": potential_gain,
                    "score_gain_label": f"+{potential_gain} {points_word} к прогнозу!",
                    "current_mastery_percent": int(effective_mastery * 100),
                    "bottleneck_reason": node["bottleneck_hint"],
                    "recommended_task": node["task_template"],
                    "_priority": priority_score,
                }
            )

        # Сортируем по максимальной пользе для ученика
        candidates.sort(key=lambda x: x["_priority"], reverse=True)
        primary_action = candidates[0] if candidates else None

        return {
            "primary_recommendation": primary_action,
            "alternative_boosts": candidates[1:3] if len(candidates) > 1 else [],
        }


recommendation_engine = RecommendationEngine()
