import { describe, it, expect, beforeEach, vi } from "vitest";
import { gameReducer } from "@/hooks/useGameReducer";
import {
  GameState,
  GameStatus,
  GameActionType,
  Difficulty,
  Cell,
} from "@/types/game";

describe("gameReducer", () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = {
      board: [],
      rows: 5,
      cols: 5,
      mines: 3,
      status: GameStatus.IDLE,
      flagsPlaced: 0,
      startTime: null,
      endTime: null,
      difficulty: Difficulty.BEGINNER,
    };
  });

  describe("NEW_GAME", () => {
    it("should initialize a new game with correct configuration", () => {
      const action = {
        type: GameActionType.NEW_GAME,
        payload: {
          rows: 9,
          cols: 9,
          mines: 10,
          difficulty: Difficulty.BEGINNER,
        },
      } as const;

      const newState = gameReducer(initialState, action);

      expect(newState.rows).toBe(9);
      expect(newState.cols).toBe(9);
      expect(newState.mines).toBe(10);
      expect(newState.status).toBe(GameStatus.IDLE);
      expect(newState.flagsPlaced).toBe(0);
      expect(newState.startTime).toBeNull();
      expect(newState.endTime).toBeNull();
      expect(newState.difficulty).toBe(Difficulty.BEGINNER);
    });

    it("should reset the game state", () => {
      const playingState: GameState = {
        ...initialState,
        status: GameStatus.PLAYING,
        flagsPlaced: 5,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.NEW_GAME,
        payload: {
          rows: 5,
          cols: 5,
          mines: 3,
          difficulty: Difficulty.BEGINNER,
        },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.IDLE);
      expect(newState.flagsPlaced).toBe(0);
      expect(newState.startTime).toBeNull();
    });
  });

  describe("REVEAL_CELL - First Click", () => {
    it("should generate board and start game on first click", () => {
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(initialState, action);

      // With 5x5 board and only 3 mines, might win immediately if lucky
      // Just check that game started
      expect(newState.board.length).toBe(25);
      expect(newState.startTime).not.toBeNull();
      expect([GameStatus.PLAYING, GameStatus.WON]).toContain(newState.status);
    });

    it("should exclude first clicked cell and neighbors from mines", () => {
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      // Run multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const newState = gameReducer(initialState, action);

        // Center cell and its 8 neighbors should not have mines
        const excludedZone = [
          "1-1",
          "1-2",
          "1-3",
          "2-1",
          "2-2",
          "2-3",
          "3-1",
          "3-2",
          "3-3",
        ];

        for (const cellId of excludedZone) {
          const cell = newState.board.find((c) => c.id === cellId);
          expect(cell?.isMine).toBe(false);
        }
      }
    });

    it("should reveal the first clicked cell", () => {
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(initialState, action);

      const clickedCell = newState.board.find((c) => c.id === "2-2");
      expect(clickedCell?.isRevealed).toBe(true);
    });

    it("should use flood fill if first cell has 0 adjacent mines", () => {
      // Create a state with a small board and few mines
      const smallState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 1,
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(smallState, action);

      // Should reveal multiple cells via flood fill
      const revealedCount = newState.board.filter((c) => c.isRevealed).length;
      expect(revealedCount).toBeGreaterThan(1);
    });
  });

  describe("REVEAL_CELL - Regular Reveal", () => {
    it("should reveal a single numbered cell", () => {
      // Create a controlled board
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: r === 2 && c === 2 ? 1 : 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      const cell = newState.board.find((c) => c.id === "2-2");
      expect(cell?.isRevealed).toBe(true);
    });

    it("should trigger LOST status when revealing a mine", () => {
      // Create a board with a mine
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: r === 2 && c === 2,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.LOST);
      expect(newState.endTime).not.toBeNull();

      const mine = newState.board.find((c) => c.id === "2-2");
      expect(mine?.isRevealed).toBe(true);
    });

    it("should not reveal if cell is already revealed", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: r === 2 && c === 2,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      // State should remain unchanged
      expect(newState).toEqual(playingState);
    });

    it("should not reveal if cell is flagged", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: r === 2 && c === 2,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      const cell = newState.board.find((c) => c.id === "2-2");
      expect(cell?.isRevealed).toBe(false);
      expect(cell?.isFlagged).toBe(true);
    });

    it("should not reveal if game is won", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const wonState: GameState = {
        ...initialState,
        board,
        status: GameStatus.WON,
        startTime: Date.now(),
        endTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(wonState, action);

      expect(newState).toEqual(wonState);
    });

    it("should not reveal if game is lost", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const lostState: GameState = {
        ...initialState,
        board,
        status: GameStatus.LOST,
        startTime: Date.now(),
        endTime: Date.now(),
      };

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(lostState, action);

      expect(newState).toEqual(lostState);
    });
  });

  describe("TOGGLE_FLAG", () => {
    it("should toggle flag on an unrevealed cell", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.TOGGLE_FLAG,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      const cell = newState.board.find((c) => c.id === "2-2");
      expect(cell?.isFlagged).toBe(true);
      expect(newState.flagsPlaced).toBe(1);
    });

    it("should unflag a flagged cell", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: r === 2 && c === 2,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.TOGGLE_FLAG,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      const cell = newState.board.find((c) => c.id === "2-2");
      expect(cell?.isFlagged).toBe(false);
      expect(newState.flagsPlaced).toBe(0);
    });

    it("should not flag revealed cells", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: r === 2 && c === 2,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.TOGGLE_FLAG,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      const cell = newState.board.find((c) => c.id === "2-2");
      expect(cell?.isFlagged).toBe(false);
      expect(newState.flagsPlaced).toBe(0);
    });

    it("should not flag if game is idle", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const idleState: GameState = {
        ...initialState,
        board,
        status: GameStatus.IDLE,
      };

      const action = {
        type: GameActionType.TOGGLE_FLAG,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(idleState, action);

      expect(newState).toEqual(idleState);
    });
  });

  describe("Win Detection Logic", () => {
    it("should detect win when all non-mine cells are revealed", () => {
      // Create a small 3x3 board with 1 mine
      const board: Cell[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const isMine = r === 2 && c === 2;
          const isLastCell = r === 0 && c === 0;
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine,
            isRevealed: !isMine && !isLastCell, // All non-mines revealed except one
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      // Reveal the last cell to trigger win
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.WON);
      expect(newState.endTime).not.toBeNull();
    });

    it("should detect win after revealing last safe cell", () => {
      // Create a board where only one cell is left unrevealed
      const board: Cell[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const isMine = r === 2 && c === 2;
          const isLastCell = r === 0 && c === 0;
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine,
            isRevealed: !isMine && !isLastCell,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      // Reveal the last cell
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.WON);
      const lastCell = newState.board.find((c) => c.id === "0-0");
      expect(lastCell?.isRevealed).toBe(true);
    });

    it("should not win if any non-mine cell is unrevealed", () => {
      // Create a board with some unrevealed cells
      const board: Cell[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const isMine = r === 2 && c === 2;
          const revealed = r === 0 && c === 0;
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine,
            isRevealed: revealed,
            isFlagged: false,
            adjacentMines: isMine ? 0 : 1, // Set adjacentMines to prevent flood fill
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      // Reveal a cell but not all
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "0-1" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.PLAYING);
      expect(newState.endTime).toBeNull();
    });

    it("should win with multiple mines if all non-mines revealed", () => {
      // Create a 4x4 board with 3 mines
      const board: Cell[] = [];
      const minePositions = ["0-0", "1-1", "2-2"];

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const id = `${r}-${c}`;
          const isMine = minePositions.includes(id);
          const isLastCell = id === "3-3";
          board.push({
            id,
            row: r,
            col: c,
            isMine,
            isRevealed: !isMine && !isLastCell, // All non-mines revealed except last
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 4,
        cols: 4,
        mines: 3,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      // Reveal the last cell to trigger win
      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "3-3" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.WON);
    });

    it("should call onWin callback when game is won", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const isMine = r === 2 && c === 2;
          const isLastCell = r === 0 && c === 0;
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine,
            isRevealed: !isMine && !isLastCell,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const onWin = vi.fn();

      const action = {
        type: GameActionType.REVEAL_CELL,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(playingState, action, onWin);

      expect(newState.status).toBe(GameStatus.WON);
      expect(onWin).toHaveBeenCalledTimes(1);
      expect(onWin).toHaveBeenCalledWith(
        expect.objectContaining({
          status: GameStatus.WON,
          endTime: expect.any(Number),
        }),
      );
    });
  });

  describe("RESET_GAME", () => {
    it("should reset game to initial state", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: true,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 5,
      };

      const action = {
        type: GameActionType.RESET_GAME,
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.IDLE);
      expect(newState.board.length).toBe(playingState.rows * playingState.cols);
      expect(newState.flagsPlaced).toBe(0);
      expect(newState.startTime).toBeNull();
      expect(newState.endTime).toBeNull();
      expect(newState.rows).toBe(playingState.rows);
      expect(newState.cols).toBe(playingState.cols);
      expect(newState.mines).toBe(playingState.mines);

      // All cells should be unrevealed and have no mines (mines placed on first click)
      expect(newState.board.every((c) => !c.isRevealed && !c.isMine)).toBe(
        true,
      );
    });
  });

  describe("AUTO_OPEN", () => {
    it("should auto-open safe neighbors when flags equal adjacentMines", () => {
      // Create a controlled 5x5 board
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const id = `${r}-${c}`;
          // Place a mine at 1-1
          const isMine = id === "1-1";
          board.push({
            id,
            row: r,
            col: c,
            isMine,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      // Calculate adjacentMines for all cells
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const index = r * 5 + c;
          const cell = board[index];
          if (!cell.isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                  const neighborIdx = nr * 5 + nc;
                  if (board[neighborIdx].isMine) {
                    count++;
                  }
                }
              }
            }
            cell.adjacentMines = count;
          }
        }
      }

      // Reveal cell 0-0 (has adjacentMines=1, neighbor to mine)
      board[0].isRevealed = true;

      // Flag the mine at 1-1
      board[6].isFlagged = true; // index 6 is 1-1

      const playingState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should reveal safe neighbors (0-1, 1-0)
      const cell_0_1 = newState.board.find((c) => c.id === "0-1");
      const cell_1_0 = newState.board.find((c) => c.id === "1-0");

      expect(cell_0_1?.isRevealed).toBe(true);
      expect(cell_1_0?.isRevealed).toBe(true);

      // Mine should still be flagged and not revealed
      const mine = newState.board.find((c) => c.id === "1-1");
      expect(mine?.isFlagged).toBe(true);
      expect(mine?.isRevealed).toBe(false);

      // Game should still be playing (not lost)
      expect(newState.status).toBe(GameStatus.PLAYING);
    });

    it("should cause loss when wrong flags placed", () => {
      // Create a controlled 5x5 board
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const id = `${r}-${c}`;
          // Place a mine at 1-1
          const isMine = id === "1-1";
          board.push({
            id,
            row: r,
            col: c,
            isMine,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      // Calculate adjacentMines
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const index = r * 5 + c;
          const cell = board[index];
          if (!cell.isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                  const neighborIdx = nr * 5 + nc;
                  if (board[neighborIdx].isMine) {
                    count++;
                  }
                }
              }
            }
            cell.adjacentMines = count;
          }
        }
      }

      // Reveal cell 0-0 (has adjacentMines=1)
      board[0].isRevealed = true;

      // Flag WRONG cell (0-1 instead of 1-1)
      board[1].isFlagged = true; // 0-1

      const playingState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "0-0" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should hit the mine and lose
      expect(newState.status).toBe(GameStatus.LOST);
      expect(newState.endTime).not.toBeNull();

      // The mine should be revealed
      const mine = newState.board.find((c) => c.id === "1-1");
      expect(mine?.isRevealed).toBe(true);
    });

    it("should not auto-open if flags count doesn't match adjacentMines", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: r === 2 && c === 2,
            isFlagged: false,
            adjacentMines: 2, // Need 2 flags
          });
        }
      }

      // Only flag 1 neighbor
      board[6].isFlagged = true;

      const playingState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 2,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should not reveal any neighbors
      expect(newState).toEqual(playingState);
    });

    it("should not auto-open unrevealed cells", () => {
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          board.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            isMine: false,
            isRevealed: false, // Cell not revealed
            isFlagged: false,
            adjacentMines: 1,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "2-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should not change state
      expect(newState).toEqual(playingState);
    });

    it("should use flood fill for neighbors with adjacentMines=0", () => {
      // Create a board with mines in two corners to prevent instant win
      const board: Cell[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const id = `${r}-${c}`;
          const isMine = id === "0-0" || id === "4-4";
          board.push({
            id,
            row: r,
            col: c,
            isMine,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      // Calculate adjacentMines
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const index = r * 5 + c;
          const cell = board[index];
          if (!cell.isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                  const neighborIdx = nr * 5 + nc;
                  if (board[neighborIdx].isMine) {
                    count++;
                  }
                }
              }
            }
            cell.adjacentMines = count;
          }
        }
      }

      // Reveal cell 0-1 (has adjacentMines=1)
      board[1].isRevealed = true;

      // Flag the mine at 0-0
      board[0].isFlagged = true;

      const playingState: GameState = {
        ...initialState,
        rows: 5,
        cols: 5,
        mines: 2,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "0-1" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should flood fill and reveal many cells
      const revealedCount = newState.board.filter(
        (c) => c.isRevealed && !c.isMine,
      ).length;

      expect(revealedCount).toBeGreaterThan(3);
      // May or may not win depending on flood fill extent
      expect([GameStatus.PLAYING, GameStatus.WON]).toContain(newState.status);
    });

    it("should check win condition after auto-open", () => {
      // Create a tiny board where auto-open wins the game
      const board: Cell[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = `${r}-${c}`;
          const isMine = id === "2-2";
          board.push({
            id,
            row: r,
            col: c,
            isMine,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      // Calculate adjacentMines
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const index = r * 3 + c;
          const cell = board[index];
          if (!cell.isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                  const neighborIdx = nr * 3 + nc;
                  if (board[neighborIdx].isMine) {
                    count++;
                  }
                }
              }
            }
            cell.adjacentMines = count;
          }
        }
      }

      // Reveal most cells except the last one (1-1)
      for (let i = 0; i < board.length; i++) {
        if (board[i].id !== "1-1" && board[i].id !== "2-2") {
          board[i].isRevealed = true;
        }
      }

      // Reveal cell 1-2 (neighbor to mine, adjacentMines=1)
      board[5].isRevealed = true;

      // Flag the mine
      board[8].isFlagged = true;

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 1,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
        flagsPlaced: 1,
      };

      const action = {
        type: GameActionType.AUTO_OPEN,
        payload: { cellId: "1-2" },
      } as const;

      const newState = gameReducer(playingState, action);

      // Should reveal last cell and win
      expect(newState.status).toBe(GameStatus.WON);
      expect(newState.endTime).not.toBeNull();
    });
  });

  describe("GAME_LOST", () => {
    it("should reveal all mines and set status to LOST", () => {
      const board: Cell[] = [];
      const minePositions = ["0-0", "1-1", "2-2"];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = `${r}-${c}`;
          board.push({
            id,
            row: r,
            col: c,
            isMine: minePositions.includes(id),
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          });
        }
      }

      const playingState: GameState = {
        ...initialState,
        rows: 3,
        cols: 3,
        mines: 3,
        board,
        status: GameStatus.PLAYING,
        startTime: Date.now(),
      };

      const action = {
        type: GameActionType.GAME_LOST,
        payload: { cellId: "1-1" },
      } as const;

      const newState = gameReducer(playingState, action);

      expect(newState.status).toBe(GameStatus.LOST);
      expect(newState.endTime).not.toBeNull();

      // All mines should be revealed
      const mines = newState.board.filter((c) => c.isMine);
      expect(mines.every((m) => m.isRevealed)).toBe(true);
    });
  });
});
