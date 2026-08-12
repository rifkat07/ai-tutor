import os
import re
import urllib.parse
from typing import List, Tuple
import requests
import urllib3
from bs4 import BeautifulSoup

# Отключаем предупреждения SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_PROJECT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
PDF_DATABASE_DIR = os.path.join(BASE_PROJECT_DIR, "database_pdf_materials")

# Порог свежести и классов
MIN_ALLOWED_YEAR = 2020  # Год >= 2020
MIN_ALLOWED_GRADE = 5  # Классы только с 5 по 11!

# РАЗРЕШЕННЫЕ КЛЮЧЕВЫЕ СЛОВА НАШИХ 7 ПРЕДМЕТОВ
ALLOWED_SUBJECT_KEYWORDS = [
    "математ",
    "алгебр",
    "геометр",
    "физик",
    "хими",
    "информ",
    "кегэ",
    "русск",
    "граммат",
    "сочин",
    "ященко",
    "поляков",
    "демидов",
    "габриел",
    "дощинск",
    "атанас",
    "мерзляк",
    "виленкин",
    "макарыч",
    "перышкин",
    "первышкин",
    "ладыженск",
    "босов",
    "рудзитис",
]

# ИСКЛЮЧАЕМЫЕ ЧУЖИЕ ПРЕДМЕТЫ
FORBIDDEN_KEYWORDS = [
    "биолог",
    "истори",
    "обществозн",
    "географ",
    "англ",
    "немецк",
    "француз",
    "испан",
    "литератур",
    "астроном",
    "окружающий",
    "экологи",
    "право",
    "экономик",
]

# ИСКЛЮЧАЕМАЯ НАЧАЛЬНАЯ ШКОЛА (1-4 КЛАССЫ)
FORBIDDEN_GRADES = [
    "1 класс",
    "2 класс",
    "3 класс",
    "4 класс",
    "1-4 класс",
    "1-3 класс",
    "1 кл",
    "2 кл",
    "3 кл",
    "4 кл",
    "для дошкольников",
    "начальная школа",
]

# ТОЧНЫЕ АНГЛОЯЗЫЧНЫЕ URL СЛАГИ SO.11KLASOV.NET
TARGET_SOURCES = [
    {
        "category": "shkolnye_uchebniki/matematika",
        "urls": ["https://so.11klasov.net/mathematics/"],
    },
    {
        "category": "shkolnye_uchebniki/algebra",
        "urls": ["https://so.11klasov.net/algebra/"],
    },
    {
        "category": "shkolnye_uchebniki/geometriya",
        "urls": ["https://so.11klasov.net/geometry/"],
    },
    {
        "category": "shkolnye_uchebniki/fizika",
        "urls": ["https://so.11klasov.net/physics/"],
    },
    {
        "category": "shkolnye_uchebniki/himiya",
        "urls": ["https://so.11klasov.net/chemistry/"],
    },
    {
        "category": "shkolnye_uchebniki/informatika",
        "urls": ["https://so.11klasov.net/computer-science/"],
    },
    {
        "category": "shkolnye_uchebniki/russian",
        "urls": ["https://so.11klasov.net/russian-language/"],
    },
    {"category": "ege", "urls": ["https://so.11klasov.net/ege/"]},
    {"category": "oge", "urls": ["https://so.11klasov.net/giaoge/"]},
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def is_grade_valid(title_text: str) -> bool:
    """Отклоняет начальную школу (1–4 классы)."""
    t_lower = title_text.lower()
    if any(fg in t_lower for fg in FORBIDDEN_GRADES):
        if not any(
            g in t_lower
            for g in [
                "5 кл",
                "6 кл",
                "7 кл",
                "8 кл",
                "9 кл",
                "10 кл",
                "11 кл",
                "5-",
                "5–",
                "5 класс",
            ]
        ):
            return False
    return True


def is_subject_relevant(text: str) -> bool:
    t_lower = text.lower()
    if any(bad in t_lower for bad in FORBIDDEN_KEYWORDS):
        if not any(good in t_lower for good in ALLOWED_SUBJECT_KEYWORDS):
            return False
    return True


def is_book_year_valid(
    title_text: str, soup: BeautifulSoup
) -> tuple[bool, int]:
    title_lower = title_text.lower()

    title_years = [
        int(y) for y in re.findall(r"\b(19\d\d|20\d\d)\b", title_lower)
    ]
    if title_years:
        max_title_year = max(title_years)
        if max_title_year < MIN_ALLOWED_YEAR:
            return False, max_title_year

    full_text = f"{title_text} {soup.get_text()[:1500]}".lower()
    year_match = re.search(
        r"год(?: издания)?:\s*(\d{4})", full_text, re.IGNORECASE
    )
    if year_match:
        year = int(year_match.group(1))
        return (year >= MIN_ALLOWED_YEAR), year

    all_found = [
        int(y) for y in re.findall(r"\b(19\d\d|20\d\d)\b", full_text[:1500])
    ]
    if not all_found:
        return False, 0

    max_year = max(all_found)
    if max_year < MIN_ALLOWED_YEAR:
        return False, max_year

    return True, max_year


def sanitize_filename(name: str) -> str:
    cleaned = re.sub(r'[\\/*?:"<>|]', "_", name).strip()
    if len(cleaned) > 70:
        cleaned = cleaned[:70].strip()
    return cleaned if cleaned.lower().endswith(".pdf") else f"{cleaned}.pdf"


def download_pdf_file(
    url: str, save_path: str, referer_url: str = None
) -> bool:
    save_path = os.path.normpath(save_path)
    if os.path.exists(save_path) and os.path.getsize(save_path) > 10000:
        try:
            with open(save_path, "rb") as check_f:
                if check_f.read(4) == b"%PDF":
                    print(
                        f"    ⏩ Уже скачано: {os.path.basename(save_path)}"
                    )
                    return True
        except Exception:
            pass

    req_headers = HEADERS.copy()
    if referer_url:
        req_headers["Referer"] = referer_url

    try:
        res = requests.get(
            url, headers=req_headers, stream=True, timeout=40, verify=False
        )
        if res.status_code == 200:
            content = res.content

            if content.startswith(b"%PDF"):
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                with open(save_path, "wb") as f:
                    f.write(content)

                size_mb = round(os.path.getsize(save_path) / (1024 * 1024), 2)
                print(
                    f"    ✅ СКАЧАН PDF: {os.path.basename(save_path)} ({size_mb} МБ)"
                )
                return True
            else:
                if b"href=" in content:
                    soup = BeautifulSoup(content, "html.parser")
                    for a in soup.find_all("a", href=True):
                        href = a["href"]
                        if "do=download" in href or ".pdf" in href.lower():
                            real_url = urllib.parse.urljoin(url, href)
                            if real_url != url:
                                return download_pdf_file(
                                    real_url, save_path, referer_url=url
                                )
    except Exception as e:
        print(f"    ⚠️ Ошибка скачивания {url}: {e}")
    return False


def crawl_source(category_folder: str, urls_list: List[str]):
    target_folder = os.path.join(PDF_DATABASE_DIR, category_folder)
    os.makedirs(target_folder, exist_ok=True)

    print(f"\n📂 [СКАНИРОВАНИЕ] Раздел: {category_folder}")

    for base_category_url in urls_list:
        page_num = 1
        while True:
            page_url = (
                f"{base_category_url}page/{page_num}/"
                if page_num > 1
                else base_category_url
            )
            print(f"  ──► Страница {page_num}: {page_url}")

            try:
                res = requests.get(
                    page_url, headers=HEADERS, timeout=20, verify=False
                )
                if res.status_code != 200:
                    break

                soup = BeautifulSoup(res.text, "html.parser")
                book_urls = set()
                for a in soup.find_all("a", href=True):
                    href = a["href"]
                    if ".html" in href and "11klasov" in href:
                        book_urls.add(href)

                if not book_urls:
                    break

                existing_files = (
                    os.listdir(target_folder)
                    if os.path.exists(target_folder)
                    else []
                )

                print(
                    f"  └─► Найдено {len(book_urls)} книг. Фильтрация..."
                )

                for book_url in book_urls:
                    book_id = os.path.basename(book_url).replace(".html", "")

                    if any(book_id in f for f in existing_files):
                        print(f"  ⏩ УЖЕ В БАЗЕ (Пропуск): {book_id}")
                        continue

                    try:
                        b_res = requests.get(
                            book_url, headers=HEADERS, timeout=15, verify=False
                        )
                        if b_res.status_code != 200:
                            continue

                        b_soup = BeautifulSoup(b_res.text, "html.parser")
                        book_title = b_soup.find("h1")
                        title_text = (
                            book_title.get_text(strip=True)
                            if book_title
                            else book_id
                        )

                        # 1. ФИЛЬТР КЛАССА: Пропускаем начальную школу (1–4 классы)
                        if not is_grade_valid(title_text):
                            print(
                                f"  ⏭️ Отклонено (Начальная школа 1-4 кл): {title_text[:50]}..."
                            )
                            continue

                        # 2. ФИЛЬТР ПРЕДМЕТА: Пропускаем Литературу, Географию
                        if not is_subject_relevant(title_text):
                            print(
                                f"  ⏭️ Отклонено (чужой предмет): {title_text[:50]}..."
                            )
                            continue

                        # 3. ФИЛЬТР ГОДА: Пропускаем книги < 2020
                        is_valid, detected_year = is_book_year_valid(
                            title_text, b_soup
                        )
                        if not is_valid:
                            print(
                                f"  ⏭️ Отклонено (Старый год {detected_year} < {MIN_ALLOWED_YEAR}): {title_text[:50]}..."
                            )
                            continue

                        print(
                            f"  📥 ОДОБРЕНО [{detected_year} г.]: {title_text[:50]}..."
                        )

                        for download_link in b_soup.find_all("a", href=True):
                            href = download_link["href"]
                            link_text = download_link.get_text(
                                strip=True
                            ).lower()

                            if (
                                "скачать" in link_text
                                or "do=download" in href
                                or ".pdf" in href.lower()
                            ):
                                full_download_url = urllib.parse.urljoin(
                                    book_url, href
                                )
                                clean_filename = sanitize_filename(
                                    f"{title_text}_{book_id}"
                                )
                                save_path = os.path.join(
                                    target_folder, clean_filename
                                )

                                if download_pdf_file(
                                    full_download_url,
                                    save_path,
                                    referer_url=book_url,
                                ):
                                    break
                    except Exception as ex:
                        print(f"    ⚠️ Ошибка книги {book_url}: {ex}")

                page_num += 1

            except Exception as e:
                print(f"❌ Ошибка страницы {page_url}: {e}")
                break


def main():
    print("=" * 70)
    print(
        f"🚀 СТРОГИЙ ЗАГРУЗЧИК УЧЕБНИКОВ (СТРОГО 5–11 КЛАССЫ, ГОД >= {MIN_ALLOWED_YEAR})"
    )
    print(f"Папка сохранения: {PDF_DATABASE_DIR}")
    print("=" * 70)

    for source in TARGET_SOURCES:
        crawl_source(source["category"], source["urls"])

    print("\n" + "=" * 70)
    print("🎉 ВСЕ МАТЕРИАЛЫ СТРОГО 5–11 КЛАССОВ СКАЧАНЫ!")
    print("=" * 70)


if __name__ == "__main__":
    main()
