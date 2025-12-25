from abc import ABC, abstractmethod
from typing import Any
import json


class GameEngine(ABC):
    
    @abstractmethod
    def create_initial_state(self) -> dict:
        pass
    
    @abstractmethod
    def validate_move(self, state: dict, player: int, move: dict) -> tuple[bool, str]:
        pass
    
    @abstractmethod
    def apply_move(self, state: dict, player: int, move: dict) -> dict:
        pass
    
    @abstractmethod
    def check_winner(self, state: dict) -> int | None:
        pass
    
    @abstractmethod
    def is_game_over(self, state: dict) -> bool:
        pass
    
    @abstractmethod
    def get_valid_moves(self, state: dict, player: int) -> list[dict]:
        pass
    
    def serialize_state(self, state: dict) -> str:
        return json.dumps(state)
    
    def deserialize_state(self, state_str: str) -> dict:
        return json.loads(state_str)
