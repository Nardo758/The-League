from .base import GameEngine

SIZE = 8


class CheckersEngine(GameEngine):
    
    def create_initial_state(self) -> dict:
        board = [[0] * SIZE for _ in range(SIZE)]
        
        for row in range(3):
            for col in range(SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = 2
        
        for row in range(5, 8):
            for col in range(SIZE):
                if (row + col) % 2 == 1:
                    board[row][col] = 1
        
        return {
            "board": board,
            "current_player": 1,
            "moves": [],
            "must_jump_from": None
        }
    
    def _is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < SIZE and 0 <= col < SIZE
    
    def _get_piece_at(self, board: list, row: int, col: int) -> int:
        if not self._is_valid_position(row, col):
            return -1
        return board[row][col]
    
    def _is_king(self, piece: int) -> bool:
        return piece in [3, 4]
    
    def _get_player(self, piece: int) -> int:
        if piece in [1, 3]:
            return 1
        if piece in [2, 4]:
            return 2
        return 0
    
    def _get_jumps(self, board: list, row: int, col: int, player: int) -> list:
        piece = board[row][col]
        jumps = []
        
        if player == 1 or self._is_king(piece):
            directions = [(-1, -1), (-1, 1)]
        else:
            directions = []
        
        if player == 2 or self._is_king(piece):
            directions.extend([(1, -1), (1, 1)])
        
        for dr, dc in directions:
            mid_row, mid_col = row + dr, col + dc
            end_row, end_col = row + 2*dr, col + 2*dc
            
            mid_piece = self._get_piece_at(board, mid_row, mid_col)
            end_piece = self._get_piece_at(board, end_row, end_col)
            
            if (self._get_player(mid_piece) != 0 and 
                self._get_player(mid_piece) != player and 
                end_piece == 0):
                jumps.append({
                    "from_row": row, "from_col": col,
                    "to_row": end_row, "to_col": end_col,
                    "is_jump": True
                })
        
        return jumps
    
    def _get_simple_moves(self, board: list, row: int, col: int, player: int) -> list:
        piece = board[row][col]
        moves = []
        
        if player == 1 or self._is_king(piece):
            directions = [(-1, -1), (-1, 1)]
        else:
            directions = []
        
        if player == 2 or self._is_king(piece):
            directions.extend([(1, -1), (1, 1)])
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            if self._get_piece_at(board, new_row, new_col) == 0:
                moves.append({
                    "from_row": row, "from_col": col,
                    "to_row": new_row, "to_col": new_col,
                    "is_jump": False
                })
        
        return moves
    
    def validate_move(self, state: dict, player: int, move: dict) -> tuple[bool, str]:
        if state["current_player"] != player:
            return False, "Not your turn"
        
        from_row = move.get("from_row")
        from_col = move.get("from_col")
        to_row = move.get("to_row")
        to_col = move.get("to_col")
        
        if None in [from_row, from_col, to_row, to_col]:
            return False, "Move requires from_row, from_col, to_row, to_col"
        
        board = state["board"]
        piece = self._get_piece_at(board, from_row, from_col)
        
        if self._get_player(piece) != player:
            return False, "Not your piece"
        
        if state.get("must_jump_from"):
            if (from_row, from_col) != tuple(state["must_jump_from"]):
                return False, "Must continue jumping with the same piece"
        
        all_jumps = []
        for r in range(SIZE):
            for c in range(SIZE):
                if self._get_player(board[r][c]) == player:
                    all_jumps.extend(self._get_jumps(board, r, c, player))
        
        if all_jumps:
            for j in all_jumps:
                if (j["from_row"] == from_row and j["from_col"] == from_col and
                    j["to_row"] == to_row and j["to_col"] == to_col):
                    return True, ""
            return False, "Must make a jump move"
        
        piece_moves = self._get_simple_moves(board, from_row, from_col, player)
        for m in piece_moves:
            if m["to_row"] == to_row and m["to_col"] == to_col:
                return True, ""
        
        return False, "Invalid move"
    
    def apply_move(self, state: dict, player: int, move: dict) -> dict:
        from_row, from_col = move["from_row"], move["from_col"]
        to_row, to_col = move["to_row"], move["to_col"]
        
        board = [row[:] for row in state["board"]]
        piece = board[from_row][from_col]
        
        board[from_row][from_col] = 0
        board[to_row][to_col] = piece
        
        is_jump = abs(to_row - from_row) == 2
        if is_jump:
            mid_row = (from_row + to_row) // 2
            mid_col = (from_col + to_col) // 2
            board[mid_row][mid_col] = 0
        
        if player == 1 and to_row == 0 and not self._is_king(piece):
            board[to_row][to_col] = 3
        elif player == 2 and to_row == 7 and not self._is_king(piece):
            board[to_row][to_col] = 4
        
        must_jump_from = None
        next_player = player
        
        if is_jump:
            more_jumps = self._get_jumps(board, to_row, to_col, player)
            if more_jumps:
                must_jump_from = [to_row, to_col]
            else:
                next_player = 2 if player == 1 else 1
        else:
            next_player = 2 if player == 1 else 1
        
        return {
            "board": board,
            "current_player": next_player,
            "moves": state["moves"] + [move],
            "must_jump_from": must_jump_from
        }
    
    def check_winner(self, state: dict) -> int | None:
        board = state["board"]
        has_p1 = False
        has_p2 = False
        
        for row in board:
            for cell in row:
                if self._get_player(cell) == 1:
                    has_p1 = True
                elif self._get_player(cell) == 2:
                    has_p2 = True
        
        if not has_p1:
            return 2
        if not has_p2:
            return 1
        
        current = state["current_player"]
        if not self.get_valid_moves(state, current):
            return 2 if current == 1 else 1
        
        return None
    
    def is_game_over(self, state: dict) -> bool:
        return self.check_winner(state) is not None
    
    def get_valid_moves(self, state: dict, player: int) -> list[dict]:
        if state["current_player"] != player:
            return []
        
        board = state["board"]
        
        if state.get("must_jump_from"):
            r, c = state["must_jump_from"]
            return self._get_jumps(board, r, c, player)
        
        all_jumps = []
        for r in range(SIZE):
            for c in range(SIZE):
                if self._get_player(board[r][c]) == player:
                    all_jumps.extend(self._get_jumps(board, r, c, player))
        
        if all_jumps:
            return all_jumps
        
        all_moves = []
        for r in range(SIZE):
            for c in range(SIZE):
                if self._get_player(board[r][c]) == player:
                    all_moves.extend(self._get_simple_moves(board, r, c, player))
        
        return all_moves
