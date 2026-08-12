from fastapi import APIRouter
from pydantic import BaseModel
from app.domain.cognitive.irt import irt_engine

router = APIRouter()


class IRTAssessmentSchema(BaseModel):
    current_theta: float
    responses: list[dict]


@router.post("/update-ability")
async def update_ability(data: IRTAssessmentSchema):
    new_theta = irt_engine.update_theta(data.current_theta, data.responses)
    return {
        "updated_theta": new_theta,
        "estimated_ege_score": int(50 + (new_theta + 3) * 8.33),
    }
