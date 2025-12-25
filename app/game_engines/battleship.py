from .base import GameEngine
import random

SIZE = 10
SHIPS = [5, 4, 3, 3, 2]


class BattleshipEngine(GameEngine):
    
    def create_initial_state(self) -> dict:
        return {
            "boards": {
                "1": {"ships": [], "hits": [], "misses": []},
                "2": {"ships": [], "hits": [], "misses": []}
            },
            "current_player": 1,
            "phase": "setup",
            "moves": [],
            "ships_placed": {"1": False, "2": False}
        }
    
    def _is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < SIZE and 0 <= col < SIZE
    
    def _can_place_ship(self, board: dict, ship_positions: list) -> bool:
        existing = set()
        for ship in board["ships"]:
            for pos in ship["positions"]:
                existing.add((pos[0], pos[1]))
        
        for pos in ship_positions:
            if not self._is_valid_position(pos[0], pos[1]):
                return False
            if (pos[0], pos[1]) in existing:
                return False
        
        return True
    
    def _generate_ship_positions(self, row: int, col: int, length: int, horizontal: bool) -> list:
        positions = []
        for i in range(length):
            if horizontal:
                positions.append([row, col + i])
            else:
                positions.append([row + i, col])
        return positions
    
    def validate_move(self, state: dict, player: int, move: dict) -> tuple[bool, str]:
        phase = state["phase"]
        
        if phase == "setup":
            if move.get("action") == "place_ship":
                row = move.get("row")
                col = move.get("col")
                length = move.get("length")
                horizontal = move.get("horizontal", True)
                
                if None in [row, col, length]:
                    return False, "Ship placement requires row, col, length"
                
                board = state["boards"][str(player)]
                placed_lengths = [len(s["positions"]) for s in board["ships"]]
                
                available = SHIPS.copy()
                for l in placed_lengths:
                    if l in available:
                        available.remove(l)
                
                if length not in available:
                    return False, f"Invalid ship length. Available: {available}"
                
                positions = self._generate_ship_positions(row, col, length, horizontal)
                if not self._can_place_ship(board, positions):
                    return False, "Invalid ship position"
                
                return True, ""
            
            elif move.get("action") == "random_setup":
                return True, ""
            
            return False, "During setup, use action: place_ship or random_setup"
        
        elif phase == "playing":
            if state["current_player"] != player:
                return False, "Not your turn"
            
            row = move.get("row")
            col = move.get("col")
            
            if None in [row, col]:
                return False, "Attack requires row and col"
            
            if not self._is_valid_position(row, col):
                return False, "Invalid position"
            
            opponent = "2" if player == 1 else "1"
            opp_board = state["boards"][opponent]
            
            if [row, col] in opp_board["hits"] or [row, col] in opp_board["misses"]:
                return False, "Already attacked this position"
            
            return True, ""
        
        return False, "Game is over"
    
    def _random_place_ships(self, board: dict) -> dict:
        new_board = {"ships": [], "hits": [], "misses": []}
        
        for length in SHIPS:
            placed = False
            attempts = 0
            while not placed and attempts < 100:
                row = random.randint(0, SIZE - 1)
                col = random.randint(0, SIZE - 1)
                horizontal = random.choice([True, False])
                
                positions = self._generate_ship_positions(row, col, length, horizontal)
                if self._can_place_ship(new_board, positions):
                    new_board["ships"].append({"positions": positions, "sunk": False})
                    placed = True
                attempts += 1
        
        return new_board
    
    def apply_move(self, state: dict, player: int, move: dict) -> dict:
        phase = state["phase"]
        boards = {k: {
            "ships": [{"positions": [p[:] for p in s["positions"]], "sunk": s["sunk"]} 
                      for s in v["ships"]],
            "hits": [h[:] for h in v["hits"]],
            "misses": [m[:] for m in v["misses"]]
        } for k, v in state["boards"].items()}
        
        ships_placed = state["ships_placed"].copy()
        new_phase = phase
        current_player = state["current_player"]
        moves = state["moves"][:]
        
        if phase == "setup":
            if move.get("action") == "random_setup":
                boards[str(player)] = self._random_place_ships(boards[str(player)])
                ships_placed[str(player)] = True
            else:
                row, col = move["row"], move["col"]
                length = move["length"]
                horizontal = move.get("horizontal", True)
                
                positions = self._generate_ship_positions(row, col, length, horizontal)
                boards[str(player)]["ships"].append({"positions": positions, "sunk": False})
                
                if len(boards[str(player)]["ships"]) == len(SHIPS):
                    ships_placed[str(player)] = True
            
            if ships_placed["1"] and ships_placed["2"]:
                new_phase = "playing"
                current_player = 1
        
        elif phase == "playing":
            row, col = move["row"], move["col"]
            opponent = "2" if player == 1 else "1"
            
            hit = False
            for ship in boards[opponent]["ships"]:
                if [row, col] in ship["positions"]:
                    hit = True
                    boards[opponent]["hits"].append([row, col])
                    
                    all_hit = all(
                        pos in boards[opponent]["hits"] 
                        for pos in ship["positions"]
                    )
                    if all_hit:
                        ship["sunk"] = True
                    break
            
            if not hit:
                boards[opponent]["misses"].append([row, col])
            
            moves.append({"player": player, "row": row, "col": col, "hit": hit})
            
            all_sunk = all(s["sunk"] for s in boards[opponent]["ships"])
            if all_sunk:
                new_phase = "finished"
            else:
                current_player = 2 if player == 1 else 1
        
        return {
            "boards": boards,
            "current_player": current_player,
            "phase": new_phase,
            "moves": moves,
            "ships_placed": ships_placed
        }
    
    def check_winner(self, state: dict) -> int | None:
        if state["phase"] != "finished":
            return None
        
        for player in ["1", "2"]:
            all_sunk = all(s["sunk"] for s in state["boards"][player]["ships"])
            if all_sunk:
                return 2 if player == "1" else 1
        
        return None
    
    def is_game_over(self, state: dict) -> bool:
        return state["phase"] == "finished"
    
    def get_valid_moves(self, state: dict, player: int) -> list[dict]:
        if state["phase"] == "setup":
            if state["ships_placed"][str(player)]:
                return []
            return [{"action": "random_setup"}]
        
        if state["phase"] != "playing" or state["current_player"] != player:
            return []
        
        opponent = "2" if player == 1 else "1"
        opp_board = state["boards"][opponent]
        attacked = set(tuple(p) for p in opp_board["hits"] + opp_board["misses"])
        
        moves = []
        for r in range(SIZE):
            for c in range(SIZE):
                if (r, c) not in attacked:
                    moves.append({"row": r, "col": c})
        
        return moves
    
    def get_player_view(self, state: dict, player: int) -> dict:
        my_board = state["boards"][str(player)]
        opponent = "2" if player == 1 else "1"
        opp_board = state["boards"][opponent]
        
        return {
            "my_ships": my_board["ships"],
            "my_hits_taken": my_board["hits"],
            "my_misses_taken": my_board["misses"],
            "my_attacks_hit": opp_board["hits"],
            "my_attacks_missed": opp_board["misses"],
            "phase": state["phase"],
            "current_player": state["current_player"],
            "is_my_turn": state["current_player"] == player and state["phase"] == "playing"
        }
