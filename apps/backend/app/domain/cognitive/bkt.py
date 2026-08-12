class BKTEngine:

    @staticmethod
    def update_mastery(
        p_mastery: float,
        p_transit: float,
        p_guess: float,
        p_slip: float,
        is_correct: bool,
    ) -> float:
        if is_correct:
            p_obs = (p_mastery * (1.0 - p_slip)) / (
                p_mastery * (1.0 - p_slip) + (1.0 - p_mastery) * p_guess
            )
        else:
            p_obs = (p_mastery * p_slip) / (
                p_mastery * p_slip + (1.0 - p_mastery) * (1.0 - p_guess)
            )

        p_updated = p_obs + (1.0 - p_obs) * p_transit
        return min(max(p_updated, 0.001), 0.999)


bkt_engine = BKTEngine()
