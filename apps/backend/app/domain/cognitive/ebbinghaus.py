import math
from datetime import datetime, timezone


class EbbinghausEngine:

    @staticmethod
    def calculate_retention(
        last_practiced_at: datetime, stability_days: float = 7.0
    ) -> float:
        now = datetime.now(timezone.utc)
        time_delta_days = (now - last_practiced_at).total_seconds() / 86400.0
        if time_delta_days <= 0:
            return 1.0
        return math.exp(-time_delta_days / max(stability_days, 0.1))


ebbinghaus_engine = EbbinghausEngine()
