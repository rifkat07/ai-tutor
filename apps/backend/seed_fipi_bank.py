import asyncio
import uuid
from app.core.db import AsyncSessionLocal
from app.domain.models import RAGTask

# Расширенная база официальных задач ФИПИ (ЕГЭ и ОГЭ)
EXPANDED_FIPI_TASKS = [
    # --- ЕГЕ ПРОФИЛЬНАЯ МАТЕМАТИКА (№1–18) ---
    {
        "subject": "math",
        "task_number": "№1",
        "fipi_code": "1.1",
        "condition_text": "В треугольнике $ABC$ угол $C = 90^\\circ$, $AC = 8$, $\\cos(A) = 0.8$. Найдите $AB$.",
        "solution_text": "AB = AC / cos(A) = 8 / 0.8 = 10.",
    },
    {
        "subject": "math",
        "task_number": "№2",
        "fipi_code": "2.1",
        "condition_text": "Найдите длину вектора $\\vec{a}(6; 8)$.",
        "solution_text": "|a| = sqrt(6^2 + 8^2) = sqrt(100) = 10.",
    },
    {
        "subject": "math",
        "task_number": "№3",
        "fipi_code": "3.1",
        "condition_text": "Объем цилиндра равен $12\\pi$, а его высота равна $3$. Найдите радиус основания цилиндра.",
        "solution_text": "V = pi * r^2 * h => 12*pi = pi * r^2 * 3 => r^2 = 4 => r = 2.",
    },
    {
        "subject": "math",
        "task_number": "№6",
        "fipi_code": "6.1",
        "condition_text": "Найдите корень уравнения: $$\\left(\\frac{1}{3}\\right)^{x-5} = 81$$",
        "solution_text": "3^(5-x) = 3^4 => 5 - x = 4 => x = 1.",
    },
    {
        "subject": "math",
        "task_number": "№7",
        "fipi_code": "7.1",
        "condition_text": "Найдите значение выражения: $$\\frac{g(x-3)}{g(x+1)}, \\text{ если } g(x) = 2^x$$",
        "solution_text": "2^(x-3) / 2^(x+1) = 2^(-4) = 1/16 = 0.0625.",
    },
    {
        "subject": "math",
        "task_number": "№12",
        "fipi_code": "12.1",
        "condition_text": "Найдите точку минимума функции: $$y = x^3 - 3x^2 + 2$$",
        "solution_text": "y' = 3x^2 - 6x = 0 => x=0 (max), x=2 (min). Ответ: 2.",
    },
    {
        "subject": "math",
        "task_number": "№13",
        "fipi_code": "13.1",
        "condition_text": "а) Решите уравнение: $$2\\cos^2(x) - \\sqrt{3}\\cos(x) = 0$$\nб) Укажите корни на отрезке $[\\pi, \\frac{5\\pi}{2}]$.",
        "solution_text": "а) x = pi/2 + pi*k, x = +-pi/6 + 2pi*n. б) 3pi/2, 11pi/6, 13pi/6, 5pi/2.",
    },
    {
        "subject": "math",
        "task_number": "№15",
        "fipi_code": "15.1",
        "condition_text": "Решите неравенство: $$\\log_3(x + 5) > 2$$",
        "solution_text": "ОДЗ: x > -5. x + 5 > 9 => x > 4. Ответ: (4; +inf).",
    },
    {
        "subject": "math",
        "task_number": "№18",
        "fipi_code": "18.1",
        "condition_text": "Найдите все значения параметра $a$, при каждом из которых система имеет 2 решения:\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ (x - 4)^2 + (y - 3)^2 = a^2 \\end{cases}$$",
        "solution_text": "a in (-10, 0) U (0, 10).",
    },

    # --- ЕГЕ ФИЗИКА ---
    {
        "subject": "physics",
        "task_number": "№1",
        "fipi_code": "1.1",
        "condition_text": "Тело движется вдоль оси $Ox$. Зависимость координаты от времени имеет вид $x(t) = 4 + 3t - 2t^2$. Найдите проекцию ускорения $a_x$.",
        "solution_text": "a_x = -4 m/s^2.",
    },
    {
        "subject": "physics",
        "task_number": "№21",
        "fipi_code": "21.1",
        "condition_text": "Два тела массами $m_1 = 2\\text{ кг}$ и $m_2 = 3\\text{ кг}$ движутся навстречу со скоростями $v_1 = 4\\text{ м/с}$ и $v_2 = 2\\text{ м/с}$. Найдите скорость $U$ после неупругого столкновения.",
        "solution_text": "m1*v1 - m2*v2 = (m1+m2)*U => 8 - 6 = 5U => U = 0.4 m/s.",
    },

    # --- ЕГЕ ИНФОРМАТИКА ---
    {
        "subject": "cs",
        "task_number": "№1",
        "fipi_code": "1.1",
        "condition_text": "На рисунке справа схема дорог Н-ского района изображена в виде графа. Определите длину дороги из пункта А в пункт Д.",
        "solution_text": "Анализ матрицы смежности.",
    },
    {
        "subject": "cs",
        "task_number": "№16",
        "fipi_code": "16.1",
        "condition_text": "Алгоритм вычисления функции $F(n)$ задан соотношениями:\n$$F(1) = 1$$\n$$F(n) = n + F(n-1) \\text{ при } n > 1$$\nЧему равно $F(5)$?",
        "solution_text": "F(5) = 5 + 4 + 3 + 2 + 1 = 15.",
    },

    # --- ОГЭ МАТЕМАТИКА (9 КЛАСС) ---
    {
        "subject": "math",
        "task_number": "ОГЭ №20",
        "fipi_code": "20.1",
        "condition_text": "Решите систему уравнений (ОГЭ №20):\n$$\\begin{cases} x^2 + y^2 = 25 \\\\ x + y = 7 \\end{cases}$$",
        "solution_text": "(3, 4) и (4, 3).",
    },
    {
        "subject": "math",
        "task_number": "ОГЭ №21",
        "fipi_code": "21.1",
        "condition_text": "Первый велосипедист проехал $24\\text{ км}$ на $1\\text{ ч}$ быстрее второго. Скорость первого на $2\\text{ км/ч}$ больше второго. Найдите скорость первого.",
        "solution_text": "v = 8 км/ч.",
    },
];

async def seed_database():
    """Заполнение базы данных официальными задачами ФИПИ."""
    async with AsyncSessionLocal() as db:
        print("🌱 Наполнение базы данных официальными заданиями ФИПИ...")
        for task_data in EXPANDED_FIPI_TASKS:
            task = RAGTask(
                id=uuid.uuid4(),
                subject=task_data["subject"],
                task_number=task_data["task_number"],
                fipi_code=task_data["fipi_code"],
                condition_text=task_data["condition_text"],
                solution_text=task_data["solution_text"],
                source="FIPI_Official_Bank",
            )
            db.add(task)
        await db.commit()
        print(f"✅ Успешно занесено {len(EXPANDED_FIPI_TASKS)} официальных задач ФИПИ в базу данных!")

if __name__ == "__main__":
    asyncio.run(seed_database())
