/**
 * Represents a single cell in the Minesweeper game board
 */
export interface Cell {
  /** Unique identifier for the cell (e.g., "0-0", "1-2") */
  id: string;
  /** Row index of the cell */
  row: number;
  /** Column index of the cell */
  col: number;
  /** Whether the cell contains a mine */
  isMine: boolean;
  /** Whether the cell has been revealed */
  isRevealed: boolean;
  /** Whether the cell has been flagged by the player */
  isFlagged: boolean;
  /** Number of adjacent mines (0-8) */
  adjacentMines: number;
}

/**
 * Game difficulty levels
 */
export enum Difficulty {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  EXPERT = "EXPERT",
  CUSTOM = "CUSTOM",
}

/**
 * Configuration for each difficulty level
 */
export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
}

/**
 * Difficulty configurations mapping
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig | null> = {
  [Difficulty.BEGINNER]: { rows: 9, cols: 9, mines: 10 },
  [Difficulty.INTERMEDIATE]: { rows: 16, cols: 16, mines: 40 },
  [Difficulty.EXPERT]: { rows: 16, cols: 30, mines: 99 },
  [Difficulty.CUSTOM]: null, // Custom settings are provided by user
};

/**
 * Game status
 */
export enum GameStatus {
  IDLE = "IDLE",
  PLAYING = "PLAYING",
  WON = "WON",
  LOST = "LOST",
}

/**
 * Complete game state
 */
export interface GameState {
  /** Flat array of all cells in the board */
  board: Cell[];
  /** Number of rows in the board */
  rows: number;
  /** Number of columns in the board */
  cols: number;
  /** Total number of mines in the board */
  mines: number;
  /** Current game status */
  status: GameStatus;
  /** Number of flags placed by the player */
  flagsPlaced: number;
  /** Timestamp when the game started (null if not started) */
  startTime: number | null;
  /** Timestamp when the game ended (null if not ended) */
  endTime: number | null;
  /** Current difficulty level */
  difficulty: Difficulty;
}

/**
 * Action types for game state updates
 */
export enum GameActionType {
  NEW_GAME = "NEW_GAME",
  REVEAL_CELL = "REVEAL_CELL",
  TOGGLE_FLAG = "TOGGLE_FLAG",
  REVEAL_FLOOD = "REVEAL_FLOOD",
  GAME_WON = "GAME_WON",
  GAME_LOST = "GAME_LOST",
  RESET_GAME = "RESET_GAME",
}

/**
 * Game actions for reducer pattern
 */
export type GameAction =
  | {
      type: GameActionType.NEW_GAME;
      payload: {
        rows: number;
        cols: number;
        mines: number;
        difficulty: Difficulty;
      };
    }
  | {
      type: GameActionType.REVEAL_CELL;
      payload: {
        cellId: string;
      };
    }
  | {
      type: GameActionType.TOGGLE_FLAG;
      payload: {
        cellId: string;
      };
    }
  | {
      type: GameActionType.REVEAL_FLOOD;
      payload: {
        cellId: string;
      };
    }
  | {
      type: GameActionType.GAME_WON;
    }
  | {
      type: GameActionType.GAME_LOST;
      payload: {
        cellId: string;
      };
    }
  | {
      type: GameActionType.RESET_GAME;
    };
