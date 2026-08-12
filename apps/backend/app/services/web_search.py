import asyncio
import urllib.parse
from typing import Any, Dict, List
from bs4 import BeautifulSoup
import httpx


class WebSearchService:
    """Резистентный сервис поиска с паузами и авто-повторами при сбоях."""

    def __init__(self):
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

    async def search_educational_web(self, query: str) -> List[Dict[str, str]]:
        """Поиск в сети с авто-повторами при разрыве соединения."""
        encoded_query = urllib.parse.quote(f"ЕГЭ ОГЭ {query}")
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"

        # 3 попытки подключения с авто-повтором
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(15.0, connect=5.0),
                    headers=self.headers,
                    follow_redirects=True,
                ) as client:
                    res = await client.get(url)
                    if res.status_code == 200:
                        soup = BeautifulSoup(res.text, "html.parser")
                        results = []

                        for result in soup.find_all("div", class_="result"):
                            title_tag = result.find("a", class_="result__a")
                            snippet_tag = result.find("a", class_="result__snippet")

                            if title_tag and snippet_tag:
                                title = title_tag.get_text(strip=True)
                                snippet = snippet_tag.get_text(strip=True)
                                link = title_tag.get("href", "")

                                results.append(
                                    {
                                        "title": title,
                                        "snippet": snippet,
                                        "link": link,
                                    }
                                )

                            if len(results) >= 3:
                                break

                        if results:
                            return results

            except Exception as e:
                # Пауза перед повторной попыткой
                await asyncio.sleep(1.0)

        # Резервный блок материалов на случай полной блокировки
        return [
            {
                "title": f"Учебный материал по теме ({query})",
                "snippet": f"Официальные упражнения и правила по теме {query}. Оцифровано для работы с AI-Tutor.",
                "link": "https://fipi.ru/",
            }
        ]


web_search_service = WebSearchService()
