import io
import re
from typing import Any, Dict, List
import fitz  # PyMuPDF


class PDFIngestionService:
    """Профессиональный сервис оцифровки PDF-учебников через PyMuPDF (fitz)."""

    @staticmethod
    def _clean_pdf_raw_text(text: str) -> str:
        if not text:
            return ""

        cleaned = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)
        cleaned = re.sub(r"(\w+)-\s+(\w+)", r"\1\2", cleaned)
        cleaned = re.sub(
            r"Издательство\s+[А-Яа-яA-Za-z]+|МЦНМО|Просвещение|Дрофа|Вентана-Граф",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(r"ГЛАВА\s*\d+|ПАРАГРАФ\s*\d+", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"Рис\.\s*\d+[\.\d]*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
        return cleaned.strip()

    def parse_pdf_textbook(
        self, file_bytes: bytes, author: str, grade: int, subject: str
    ) -> List[Dict[str, Any]]:
        """Оцифровка сотен страниц PDF с сохранением всех номеров упражнений."""
        if not file_bytes.startswith(b"%PDF"):
            return []

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages_text = []

            for page in doc:
                t = page.get_text("text")
                if t:
                    cleaned_t = self._clean_pdf_raw_text(t)
                    if len(cleaned_t) > 15:
                        pages_text.append(cleaned_t)

            doc.close()

            full_text = "\n\n".join(pages_text)
            if not full_text.strip():
                return []

            exercises = []

            # Поиск всех номеров заданий (№12, Упражнение 34, Задача 105, 124.)
            pattern = r"(?:№|УПРАЖНЕНИЕ|Задание|Задача|Вариант|Тест|Т\d+\.\d+|\b\d{1,4}\.)\s*(\d+[a-zа-я\.-]*)"
            matches = list(re.finditer(pattern, full_text, re.IGNORECASE))

            if len(matches) >= 2:
                for i in range(len(matches)):
                    start_idx = matches[i].start()
                    end_idx = (
                        matches[i + 1].start()
                        if i + 1 < len(matches)
                        else len(full_text)
                    )

                    ex_num = matches[i].group(1) or f"{i+1}"
                    ex_text = full_text[start_idx:end_idx].strip()

                    if len(ex_text) < 20 or "site:" in ex_text.lower():
                        continue

                    # Если в одном блоке объединилось несколько номеров
                    if len(ex_text) > 400:
                        sub_parts = re.split(
                            r"(?=\b№\s*\d+|\bЗадание\s*\d+|\bЗадача\s*\d+|\b\d{1,4}\.)",
                            ex_text,
                        )
                        for sub in sub_parts:
                            sub_clean = sub.strip()
                            if len(sub_clean) >= 20:
                                sub_num_match = re.search(
                                    r"(№\s*\d+|\bЗадание\s*\d+|\bЗадача\s*\d+|\b\d{1,4}\.)",
                                    sub_clean,
                                )
                                sub_num = (
                                    sub_num_match.group(1)
                                    if sub_num_match
                                    else f"№{ex_num}"
                                )
                                exercises.append(
                                    {
                                        "exercise_number": sub_num,
                                        "condition_text": sub_clean[:750],
                                        "chapter_title": f"{grade} класс — {author}",
                                    }
                                )
                    else:
                        exercises.append(
                            {
                                "exercise_number": f"№{ex_num}",
                                "condition_text": ex_text[:750],
                                "chapter_title": f"{grade} класс — {author}",
                            }
                        )

            # Постраничный резерв
            if not exercises and len(pages_text) > 0:
                for p_idx, p_text in enumerate(pages_text, start=1):
                    p_cleaned = p_text.strip()
                    if len(p_cleaned) < 20 or "site:" in p_cleaned.lower():
                        continue

                    exercises.append(
                        {
                            "exercise_number": f"Стр. {p_idx}",
                            "condition_text": p_cleaned[:750],
                            "chapter_title": f"Раздел {p_idx} — {author}",
                        }
                    )

            return exercises
        except Exception as e:
            print(f"❌ PyMuPDF Parsing Error: {e}")
            return []


pdf_ingestion_service = PDFIngestionService()
