from enum import Enum


class ScaffoldingLevel(int, Enum):
    LEVEL_3_FULL_GUIDE = 3
    LEVEL_2_PLAN_REQUEST = 2
    LEVEL_1_SUBTLE_HINT = 1
    LEVEL_0_EXAM_MODE = 0


class ScaffoldingManager:

    @staticmethod
    def get_level(p_mastery: float) -> ScaffoldingLevel:
        if p_mastery < 0.4:
            return ScaffoldingLevel.LEVEL_3_FULL_GUIDE
        elif p_mastery < 0.7:
            return ScaffoldingLevel.LEVEL_2_PLAN_REQUEST
        elif p_mastery < 0.9:
            return ScaffoldingLevel.LEVEL_1_SUBTLE_HINT
        return ScaffoldingLevel.LEVEL_0_EXAM_MODE


scaffolding_manager = ScaffoldingManager()
