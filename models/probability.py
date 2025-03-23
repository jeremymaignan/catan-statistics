from dataclasses import dataclass, field
from typing import Set


@dataclass
class Probability:
    rate: int = 0
    proba: float = 0.0
    values: Set[int] = field(default_factory=set)

    @property
    def rate_percentage(self) -> int:
        return int(self.rate * 100 / 36)
