from .base import GameEngine

ROWS = 6
COLS = 7


class ConnectFourEngine(GameEngine):
    
    def create_initial_state(self) -> dict:
        return {
            "board": [[0] * COLS for _ in range(ROWS)],
            "current_player": 1,
            "moves": []
        }
    
    def validate_move(self, state: dict, player: int, move: dict) -> tuple[bool, str]:
        if state["current_player"] != player:
            return False, "Not your turn"
        
        col = move.get("column")
        if col is None:
            return False, "Column is required"
        
        if not (0 <= col < COLS):
            return False, f"Column must be between 0 and {COLS - 1}"
        
        if state["board"][0][col] != 0:
            return False, "Column is full"
        
        return True, ""
    
    def apply_move(self, state: dict, player: int, move: dict) -> dict:
        col = move["column"]
        board = [row[:] for row in state["board"]]
        
        for row in range(ROWS - 1, -1, -1):
            if board[row][col] == 0:
                board[row][col] = player
                break
        
        new_state = {
            "board": board,
            "current_player": 2 if player == 1 else 1,
            "moves": state["moves"] + [{"player": player, "column": col}]
        }
        
        return new_state
    
    def check_winner(self, state: dict) -> int | None:
        board = state["board"]
        
        for row in range(ROWS):
            for col in range(COLS - 3):
                if board[row][col] != 0:
                    if (board[row][col] == board[row][col+1] == 
                        board[row][col+2] == board[row][col+3]):
                        return board[row][col]
        
        for row in range(ROWS - 3):
            for col in range(COLS):
                if board[row][col] != 0:
                    if (board[row][col] == board[row+1][col] == 
                        board[row+2][col] == board[row+3][col]):
                        return board[row][col]
        
        for row in range(ROWS - 3):
            for col in range(COLS - 3):
                if board[row][col] != 0:
                    if (board[row][col] == board[row+1][col+1] == 
                        board[row+2][col+2] == board[row+3][col+3]):
                        return board[row][col]
        
        for row in range(3, ROWS):
            for col in range(COLS - 3):
                if board[row][col] != 0:
                    if (board[row][col] == board[row-1][col+1] == 
                        board[row-2][col+2] == board[row-3][col+3]):
                        return board[row][col]
        
        return None
    
    def is_game_over(self, state: dict) -> bool:
        if self.check_winner(state) is not None:
            return True
        
        for col in range(COLS):
            if state["board"][0][col] == 0:
                return False
        return True
    
    def get_valid_moves(self, state: dict, player: int) -> list[dict]:
        if state["current_player"] != player:
            return []
        
        moves = []
        for col in range(COLS):
            if state["board"][0][col] == 0:
                moves.append({"column": col})
        return moves
