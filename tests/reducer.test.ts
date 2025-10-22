import { describe, it, expect, beforeEach } from "vitest";
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

      expect(newState.status).toBe(GameStatus.PLAYING);
      expect(newState.board.length).toBe(25);
      expect(newState.startTime).not.toBeNull();
      expect(newState.endTime).toBeNull();
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
      expect(newState.board).toEqual([]);
      expect(newState.flagsPlaced).toBe(0);
      expect(newState.startTime).toBeNull();
      expect(newState.endTime).toBeNull();
      expect(newState.rows).toBe(playingState.rows);
      expect(newState.cols).toBe(playingState.cols);
      expect(newState.mines).toBe(playingState.mines);
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
