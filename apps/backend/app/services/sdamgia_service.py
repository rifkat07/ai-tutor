import json
import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup
import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models import SdamgiaVariant


class SdamgiaService:
    """Сервис парсинга вариантов СдамГИА/РешуЕГЭ с поддержкой двухканального вывода (SVG для UI + LaTeX для ИИ)."""

    SUBJECT_DOMAINS = {
        "math_ege": ["math-ege", "mathb-ege"],
        "math_oge": ["math-oge"],
        "physics_ege": ["phys-ege"],
        "physics_oge": ["phys-oge"],
        "cs_ege": ["inf-ege"],
        "cs_oge": ["inf-oge"],
        "russian_ege": ["rus-ege"],
        "russian_oge": ["rus-oge"],
        "chemistry_ege": ["chem-ege"],
        "chemistry_oge": ["chem-oge"],
    }

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    def _convert_speech_to_clean_text(self, text: str) -> str:
        """Переводит речевые конструкции в читаемый текст формулы для нейросети."""
        if not text:
            return ""

        t = re.sub(r"[\xa0\u200b\u2009\u3000]", " ", text)
        t = " " + t.strip() + " "

        # Базовые скобки и знаки
        t = re.sub(r"левая\s*квадратная\s*скобка", "[", t, flags=re.IGNORECASE)
        t = re.sub(r"правая\s*квадратная\s*скобка", "]", t, flags=re.IGNORECASE)
        t = re.sub(r"левая\s*круглая\s*скобка", "(", t, flags=re.IGNORECASE)
        t = re.sub(r"правая\s*круглая\s*скобка", ")", t, flags=re.IGNORECASE)
        t = re.sub(r"левая\s*фигурная\s*скобка", "{", t, flags=re.IGNORECASE)
        t = re.sub(r"правая\s*фигурная\s*скобка", "}", t, flags=re.IGNORECASE)

        # Дроби
        for _ in range(5):
            t = re.sub(
                r"дробь\s*:\s*числитель\s*:\s*(.*?)\s*,\s*знаменатель\s*:\s*(.*?)\s*(?:конец\s*дроби|(?=[,;\.\)\]]|$))",
                r"(\1)/(\2)",
                t,
                flags=re.IGNORECASE,
            )

        # Корни
        for _ in range(5):
            t = re.sub(
                r"корень\s*(?:квадратный\s*)?из\s*:\s*начало\s*аргумента\s*:\s*(.*?)\s*конец\s*аргумента",
                r"sqrt(\1)",
                t,
                flags=re.IGNORECASE,
            )
            t = re.sub(
                r"корень\s*(?:квадратный\s*)?из\s*([0-9a-zA-Z\\_]+)",
                r"sqrt(\1)",
                t,
                flags=re.IGNORECASE,
            )

        # Степени
        t = re.sub(r"(?:в\s*степени|степень)\s*:\s*начало\s*аргумента\s*:\s*(.*?)\s*конец\s*аргумента", r"^(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"в\s*степени\s*([0-9a-zA-Z\\_\-+]+)", r"^(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"в\s*кубе", "^3", t, flags=re.IGNORECASE)
        t = re.sub(r"в\s*квадрате", "^2", t, flags=re.IGNORECASE)

        # Тригонометрия
        t = re.sub(r"косинус\s*в\s*квадрате\s*([a-zA-Z0-9_\(\)]*)", r"cos^2(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"синус\s*в\s*квадрате\s*([a-zA-Z0-9_\(\)]*)", r"sin^2(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"тангенс\s*в\s*квадрате\s*([a-zA-Z0-9_\(\)]*)", r"tg^2(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"косинус\s*([a-zA-Z0-9_\(\)]+)", r"cos(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"синус\s*([a-zA-Z0-9_\(\)]+)", r"sin(\1)", t, flags=re.IGNORECASE)
        t = re.sub(r"тангенс\s*([a-zA-Z0-9_\(\)]+)", r"tg(\1)", t, flags=re.IGNORECASE)

        t = re.sub(r"\s+плюс\s+", " + ", t, flags=re.IGNORECASE)
        t = re.sub(r"\s+минус\s+", " - ", t, flags=re.IGNORECASE)
        t = re.sub(r"умножить\s*на", " * ", t, flags=re.IGNORECASE)
        t = re.sub(r"равно", " = ", t, flags=re.IGNORECASE)
        t = re.sub(r"(?<=\s)Пи(?=\s|;|,|\.|\)|\]|\/|\*|\+|-|$)|(?<=\b)Пи(?=\b)", r"pi", t)
        t = re.sub(r"(?<=\s)пи(?=\s|;|,|\.|\)|\]|\/|\*|\+|-|$)|(?<=\b)пи(?=\b)", r"pi", t)

        t = re.sub(r"начало\s*аргумента\s*:\s*|\s*конец\s*аргумента|числитель\s*:\s*|знаменатель\s*:\s*|конец\s*дроби", " ", t, flags=re.IGNORECASE)
        t = re.sub(r"\s+", " ", t)
        return t.strip()

    def _clean_html_content(self, html_content: str, base_url: str = "") -> str:
        """Очищает HTML: сохраняет SVG-формулы для глаз, а в alt записывает формулу для ИИ."""
        if not html_content:
            return ""

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Удаление служебных скриптов, стилей и скрытых фреймов
        for tag in soup.find_all(["script", "style", "iframe"]):
            tag.decompose()

        for el in soup.find_all(
            class_=re.compile(
                r"MathJax_Speech|MathJax_Preview|sr-only|hidden|solution|explanation|answer|report|error|handbook|topic_block|sprav",
                re.I,
            )
        ):
            el.decompose()

        for a in soup.find_all("a"):
            onclick = str(a.get("onclick", "")).lower()
            text = a.get_text().lower()
            href = str(a.get("href", "")).lower()
            if "error" in onclick or "$.get" in onclick or "ошибк" in text or "handbook" in href or "error" in href or "справочник" in text:
                a.decompose()

        for div in soup.find_all(["div", "table", "span"]):
            onclick = str(div.get("onclick", "")).lower()
            if "error" in onclick or "$.get" in onclick or "handbook" in onclick:
                div.decompose()

        # 2. Удаляем методические врезки в русском языке
        for p in soup.find_all(["p", "div"]):
            p_text = p.get_text()
            if (
                "Что проверяется и что нужно знать?" in p_text
                or "Элементы содержания по «Кодификатору»" in p_text
                or "Орфоэпический список ФИПИ" in p_text
            ):
                p.decompose()

        # 3. ФОРМУЛЫ И КАРТИНКИ: сохраняем векторные изображения с читаемым alt для ИИ
        for img in soup.find_all("img"):
            src = img.get("src", "").strip()
            if not src:
                img.decompose()
                continue

            if src.startswith("/"):
                img["src"] = f"{base_url}{src}"
            elif not src.startswith("http"):
                img["src"] = f"{base_url}/{src}"

            raw_alt = img.get("alt", "").strip()
            clean_math_text = self._convert_speech_to_clean_text(raw_alt) if raw_alt else ""

            classes = img.get("class", [])
            if isinstance(classes, str):
                classes = classes.split()

            if "tex" in classes or "formula" in src:
                # Векторная математическая формула
                img["style"] = "vertical-align: -4px; display: inline-block; margin: 0 2px; max-height: 2.3em;"
                img["class"] = "tex inline-block align-middle my-0.5"
                # В alt записываем формулу, чтобы ИИ мог её прочитать!
                img["alt"] = clean_math_text or "формула"
            else:
                # Рисунки, чертежи, графики
                img["style"] = "max-width: 100%; height: auto; border-radius: 8px; margin: 12px auto; display: block; border: 1px solid #e2e8f0;"
                img["alt"] = "чертеж"

        clean_html = str(soup).strip()
        clean_html = re.sub(r"^<div[^>]*>(.*)</div>$", r"\1", clean_html, flags=re.DOTALL)
        clean_html = re.sub(r"<!--.*?-->", "", clean_html)
        clean_html = re.sub(r"\s+", " ", clean_html)

        # Очистка русского языка от методичек
        if "задание 1 требует" in clean_html.lower():
            m = re.search(r"(\(\d+\).*|Прочитайте текст.*|Укажите варианты.*)", clean_html, flags=re.DOTALL | re.IGNORECASE)
            if m:
                clean_html = m.group(1)
        elif "укажите варианты" in clean_html.lower():
            m = re.search(r"(Укажите варианты ответов.*)", clean_html, flags=re.DOTALL | re.IGNORECASE)
            if m:
                clean_html = m.group(1)

        return clean_html.strip()

    async def fetch_variant_online(
        self,
        variant_id: str,
        subject: str = "math",
        exam_type: str = "EGE",
    ) -> Dict[str, Any]:
        clean_id = re.sub(r"\D", "", str(variant_id)).strip()
        if not clean_id:
            clean_id = "5421822"

        exam_key = "oge" if exam_type.upper() == "OGE" else "ege"
        subject_key = f"{subject}_{exam_key}"
        domain_prefixes = self.SUBJECT_DOMAINS.get(
            subject_key, [f"{subject}-{exam_key}"]
        )

        tasks = []
        found_url = ""
        seen_conditions = set()

        for prefix in domain_prefixes:
            base_url = f"https://{prefix}.sdamgia.ru"
            url = f"{base_url}/test?id={clean_id}&print=true"

            try:
                async with httpx.AsyncClient(
                    timeout=25.0, verify=False, follow_redirects=True
                ) as client:
                    res = await client.get(url, headers=self.HEADERS)
                    if res.status_code == 200:
                        soup = BeautifulSoup(res.text, "html.parser")
                        prob_divs = soup.find_all(
                            "div",
                            class_=re.compile(
                                r"prob_maindiv|problem_container|prob_view"
                            ),
                        )

                        if not prob_divs:
                            prob_divs = soup.find_all("div", class_="pbody")

                        for idx, div in enumerate(prob_divs, start=1):
                            num_tag = div.find(class_=re.compile(r"prob_nums|numb"))
                            task_title = (
                                num_tag.get_text(strip=True)
                                if num_tag
                                else f"Задание №{idx}"
                            )

                            pbody = (
                                div.find("div", class_=re.compile(r"pbody|prob_text"))
                                or div
                            )
                            if pbody:
                                cond_html = self._clean_html_content(
                                    str(pbody), base_url=base_url
                                )

                                raw_check = BeautifulSoup(cond_html, "html.parser").get_text(strip=True).lower()
                                if (
                                    raw_check.startswith("решение")
                                    or raw_check.startswith("пояснение")
                                    or "критерии оценивания" in raw_check
                                    or len(raw_check) < 10
                                ):
                                    continue

                                if raw_check not in seen_conditions:
                                    seen_conditions.add(raw_check)
                                    tasks.append(
                                        {
                                            "task_number": f"№{len(tasks) + 1}",
                                            "title": task_title,
                                            "condition": cond_html,
                                            "solution_hint": "Разбор по шагам доступен у AI-Репетитора",
                                        }
                                    )

                        if tasks:
                            found_url = url
                            break
            except Exception as e:
                print(f"⚠️ SdamGIA Fetch {url} error: {e}")

        return {
            "variant_id": clean_id,
            "subject": subject,
            "exam_type": exam_type,
            "title": f"Вариант №{clean_id} (Решу{exam_type})",
            "source_url": (
                found_url
                or f"https://math-{exam_key}.sdamgia.ru/test?id={clean_id}"
            ),
            "tasks_count": len(tasks),
            "tasks": tasks,
        }

    async def get_cached_catalog(
        self,
        db: AsyncSession,
        subject: str = "math",
        exam_type: str = "EGE",
        page: int = 1,
        limit: int = 10,
    ) -> Dict[str, Any]:
        norm_exam = exam_type.upper()
        needed_offset = (page - 1) * limit

        count_stmt = select(func.count(SdamgiaVariant.id)).where(
            SdamgiaVariant.subject == subject,
            SdamgiaVariant.exam_type == norm_exam,
        )
        total_in_db = (await db.execute(count_stmt)).scalar() or 0

        stmt = (
            select(SdamgiaVariant)
            .where(
                SdamgiaVariant.subject == subject,
                SdamgiaVariant.exam_type == norm_exam,
            )
            .offset(needed_offset)
            .limit(limit)
        )
        res = await db.execute(stmt)
        db_items = res.scalars().all()

        variants = []
        for item in db_items:
            variants.append(
                {
                    "id": item.id,
                    "variant_number": item.variant_number,
                    "title": item.title,
                    "url": item.url,
                    "tasks_count": item.tasks_count,
                }
            )

        return {
            "subject": subject,
            "exam_type": exam_type,
            "page": page,
            "limit": limit,
            "has_more": total_in_db > needed_offset + len(db_items),
            "total_count": total_in_db,
            "variants": variants,
        }


sdamgia_service = SdamgiaService()
