from .base import GameEngine


class ChessEngine(GameEngine):
    
    PIECES = {
        "K": "king", "Q": "queen", "R": "rook", 
        "B": "bishop", "N": "knight", "P": "pawn"
    }
    
    def create_initial_state(self) -> dict:
        board = [
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"],
        ]
        
        return {
            "board": board,
            "current_player": 1,
            "moves": [],
            "castling": {"K": True, "Q": True, "k": True, "q": True},
            "en_passant": None,
            "halfmove_clock": 0,
            "fullmove_number": 1
        }
    
    def _is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < 8 and 0 <= col < 8
    
    def _get_player(self, piece: str) -> int:
        if not piece:
            return 0
        return 1 if piece.isupper() else 2
    
    def _parse_move(self, move: dict) -> tuple:
        from_sq = move.get("from", "")
        to_sq = move.get("to", "")
        
        if len(from_sq) == 2 and len(to_sq) == 2:
            from_col = ord(from_sq[0].lower()) - ord('a')
            from_row = 8 - int(from_sq[1])
            to_col = ord(to_sq[0].lower()) - ord('a')
            to_row = 8 - int(to_sq[1])
            return from_row, from_col, to_row, to_col
        
        return None, None, None, None
    
    def _get_basic_moves(self, board: list, row: int, col: int, player: int) -> list:
        piece = board[row][col].upper()
        moves = []
        
        if piece == "P":
            direction = -1 if player == 1 else 1
            start_row = 6 if player == 1 else 1
            
            new_row = row + direction
            if self._is_valid_position(new_row, col) and not board[new_row][col]:
                moves.append((new_row, col))
                if row == start_row:
                    new_row2 = row + 2 * direction
                    if not board[new_row2][col]:
                        moves.append((new_row2, col))
            
            for dc in [-1, 1]:
                new_col = col + dc
                if self._is_valid_position(new_row, new_col):
                    target = board[new_row][new_col]
                    if target and self._get_player(target) != player:
                        moves.append((new_row, new_col))
        
        elif piece == "N":
            deltas = [(-2, -1), (-2, 1), (-1, -2), (-1, 2),
                      (1, -2), (1, 2), (2, -1), (2, 1)]
            for dr, dc in deltas:
                nr, nc = row + dr, col + dc
                if self._is_valid_position(nr, nc):
                    target = board[nr][nc]
                    if not target or self._get_player(target) != player:
                        moves.append((nr, nc))
        
        elif piece == "K":
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = row + dr, col + dc
                    if self._is_valid_position(nr, nc):
                        target = board[nr][nc]
                        if not target or self._get_player(target) != player:
                            moves.append((nr, nc))
        
        elif piece in ["R", "Q"]:
            for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nr, nc = row + dr, col + dc
                while self._is_valid_position(nr, nc):
                    target = board[nr][nc]
                    if not target:
                        moves.append((nr, nc))
                    elif self._get_player(target) != player:
                        moves.append((nr, nc))
                        break
                    else:
                        break
                    nr, nc = nr + dr, nc + dc
        
        if piece in ["B", "Q"]:
            for dr, dc in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
                nr, nc = row + dr, col + dc
                while self._is_valid_position(nr, nc):
                    target = board[nr][nc]
                    if not target:
                        moves.append((nr, nc))
                    elif self._get_player(target) != player:
                        moves.append((nr, nc))
                        break
                    else:
                        break
                    nr, nc = nr + dr, nc + dc
        
        return moves
    
    def _is_in_check(self, board: list, player: int) -> bool:
        king_pos = None
        for r in range(8):
            for c in range(8):
                piece = board[r][c]
                if piece.upper() == "K" and self._get_player(piece) == player:
                    king_pos = (r, c)
                    break
            if king_pos:
                break
        
        if not king_pos:
            return True
        
        opponent = 2 if player == 1 else 1
        for r in range(8):
            for c in range(8):
                piece = board[r][c]
                if self._get_player(piece) == opponent:
                    moves = self._get_basic_moves(board, r, c, opponent)
                    if king_pos in moves:
                        return True
        
        return False
    
    def validate_move(self, state: dict, player: int, move: dict) -> tuple[bool, str]:
        if state["current_player"] != player:
            return False, "Not your turn"
        
        from_row, from_col, to_row, to_col = self._parse_move(move)
        
        if from_row is None:
            return False, "Invalid move format. Use {from: 'e2', to: 'e4'}"
        
        if not self._is_valid_position(from_row, from_col):
            return False, "Invalid from position"
        if not self._is_valid_position(to_row, to_col):
            return False, "Invalid to position"
        
        board = state["board"]
        piece = board[from_row][from_col]
        
        if not piece:
            return False, "No piece at starting position"
        
        if self._get_player(piece) != player:
            return False, "Not your piece"
        
        valid_moves = self._get_basic_moves(board, from_row, from_col, player)
        if (to_row, to_col) not in valid_moves:
            return False, "Invalid move for this piece"
        
        test_board = [row[:] for row in board]
        test_board[to_row][to_col] = piece
        test_board[from_row][from_col] = ""
        
        if self._is_in_check(test_board, player):
            return False, "Move leaves king in check"
        
        return True, ""
    
    def apply_move(self, state: dict, player: int, move: dict) -> dict:
        from_row, from_col, to_row, to_col = self._parse_move(move)
        
        board = [row[:] for row in state["board"]]
        piece = board[from_row][from_col]
        
        board[to_row][to_col] = piece
        board[from_row][from_col] = ""
        
        if piece.upper() == "P":
            promo_row = 0 if player == 1 else 7
            if to_row == promo_row:
                promo = move.get("promotion", "Q")
                board[to_row][to_col] = promo if player == 1 else promo.lower()
        
        notation = f"{chr(ord('a') + from_col)}{8 - from_row}{chr(ord('a') + to_col)}{8 - to_row}"
        
        return {
            "board": board,
            "current_player": 2 if player == 1 else 1,
            "moves": state["moves"] + [notation],
            "castling": state["castling"].copy(),
            "en_passant": None,
            "halfmove_clock": state["halfmove_clock"] + 1,
            "fullmove_number": state["fullmove_number"] + (1 if player == 2 else 0)
        }
    
    def check_winner(self, state: dict) -> int | None:
        current = state["current_player"]
        board = state["board"]
        
        if not self._is_in_check(board, current):
            return None
        
        for r in range(8):
            for c in range(8):
                piece = board[r][c]
                if self._get_player(piece) == current:
                    moves = self._get_basic_moves(board, r, c, current)
                    for to_r, to_c in moves:
                        test_board = [row[:] for row in board]
                        test_board[to_r][to_c] = piece
                        test_board[r][c] = ""
                        if not self._is_in_check(test_board, current):
                            return None
        
        return 2 if current == 1 else 1
    
    def is_game_over(self, state: dict) -> bool:
        if self.check_winner(state) is not None:
            return True
        
        current = state["current_player"]
        board = state["board"]
        
        for r in range(8):
            for c in range(8):
                piece = board[r][c]
                if self._get_player(piece) == current:
                    moves = self._get_basic_moves(board, r, c, current)
                    for to_r, to_c in moves:
                        test_board = [row[:] for row in board]
                        test_board[to_r][to_c] = piece
                        test_board[r][c] = ""
                        if not self._is_in_check(test_board, current):
                            return False
        
        return True
    
    def get_valid_moves(self, state: dict, player: int) -> list[dict]:
        if state["current_player"] != player:
            return []
        
        board = state["board"]
        moves = []
        
        for r in range(8):
            for c in range(8):
                piece = board[r][c]
                if self._get_player(piece) == player:
                    piece_moves = self._get_basic_moves(board, r, c, player)
                    for to_r, to_c in piece_moves:
                        test_board = [row[:] for row in board]
                        test_board[to_r][to_c] = piece
                        test_board[r][c] = ""
                        if not self._is_in_check(test_board, player):
                            from_sq = f"{chr(ord('a') + c)}{8 - r}"
                            to_sq = f"{chr(ord('a') + to_c)}{8 - to_r}"
                            moves.append({"from": from_sq, "to": to_sq})
        
        return moves
