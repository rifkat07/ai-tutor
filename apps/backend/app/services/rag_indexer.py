from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class RAGIndexerService:

    @staticmethod
    async def get_embedding(text_content: str) -> List[float]:
        return [0.01] * 1536

    async def find_similar_tasks(
        self, 
        query_text: str, 
        subject: str, 
        db: AsyncSession, 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        query_vector = await self.get_embedding(query_text)
        
        sql_query = text("""
            SELECT id, task_number, condition_text, solution_text, fipi_code
            FROM rag_tasks_bank
            WHERE subject = :subject AND is_deprecated = FALSE
            ORDER BY embedding <-> :query_vector
            LIMIT :limit
        """)
        
        result = await db.execute(sql_query, {
            "subject": subject,
            "query_vector": str(query_vector),
            "limit": limit
        })
        
        return [dict(row) for row in result.mappings()]


rag_indexer = RAGIndexerService()
