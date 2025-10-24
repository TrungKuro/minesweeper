import { useReducer, useCallback } from "react";
import {
  GameState,
  GameAction,
  GameActionType,
  GameStatus,
  Cell,
  Difficulty,
  DIFFICULTY_CONFIGS,
} from "@/types/game";
import { generateBoard, revealFlood } from "@/lib/board";

/**
 * Initial game state
 */
const createInitialState = (
  rows: number = 9,
  cols: number = 9,
  mines: number = 10,
  difficulty: Difficulty = Difficulty.BEGINNER,
): GameState => {
  // Create empty board (no mines yet - mines will be placed on first click)
  const board: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
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

  return {
    board,
    rows,
    cols,
    mines,
    status: GameStatus.IDLE,
    flagsPlaced: 0,
    startTime: null,
    endTime: null,
    difficulty,
  };
};

/**
 * Game reducer function
 */
export function gameReducer(
  state: GameState,
  action: GameAction,
  onWin?: (state: GameState) => void,
): GameState {
  switch (action.type) {
    case GameActionType.NEW_GAME: {
      const { rows, cols, mines, difficulty } = action.payload;
      return {
        ...createInitialState(rows, cols, mines, difficulty),
        status: GameStatus.IDLE,
      };
    }

    case GameActionType.REVEAL_CELL: {
      const { cellId } = action.payload;

      // Can't reveal if game is over
      if (state.status === GameStatus.WON || state.status === GameStatus.LOST) {
        return state;
      }

      // Find the cell (only if board exists)
      const cellIndex = state.board.findIndex((c) => c.id === cellId);

      // If board doesn't exist yet, this must be first click
      if (state.board.length === 0 || state.status === GameStatus.IDLE) {
        // First click - generate board excluding this cell
        const newBoard = generateBoard(
          state.rows,
          state.cols,
          state.mines,
          cellId,
        );

        // Start the game
        const updatedState = {
          ...state,
          board: newBoard,
          status: GameStatus.PLAYING,
          startTime: Date.now(),
        };

        // Now reveal the cell
        const targetCell = newBoard.find((c) => c.id === cellId)!;

        if (targetCell.adjacentMines === 0) {
          // Use flood fill
          const revealedBoard = revealFlood(
            newBoard,
            state.rows,
            state.cols,
            cellId,
          );
          return checkWinCondition(
            {
              ...updatedState,
              board: revealedBoard,
            },
            onWin,
          );
        } else {
          // Just reveal the single cell
          const revealedBoard = newBoard.map((c) =>
            c.id === cellId ? { ...c, isRevealed: true } : c,
          );
          return checkWinCondition(
            {
              ...updatedState,
              board: revealedBoard,
            },
            onWin,
          );
        }
      }

      if (cellIndex === -1) return state;

      const cell = state.board[cellIndex];

      // Can't reveal if cell is flagged or already revealed
      if (cell.isFlagged || cell.isRevealed) {
        return state;
      }

      // Regular reveal (not first click)
      if (cell.isMine) {
        // Hit a mine - game over
        const lostBoard = state.board.map((c) =>
          c.id === cellId ? { ...c, isRevealed: true } : c,
        );

        return {
          ...state,
          board: lostBoard,
          status: GameStatus.LOST,
          endTime: Date.now(),
        };
      }

      // Reveal non-mine cell
      if (cell.adjacentMines === 0) {
        // Use flood fill for cells with no adjacent mines
        const revealedBoard = revealFlood(
          state.board,
          state.rows,
          state.cols,
          cellId,
        );
        return checkWinCondition(
          {
            ...state,
            board: revealedBoard,
          },
          onWin,
        );
      } else {
        // Just reveal the single numbered cell
        const revealedBoard = state.board.map((c) =>
          c.id === cellId ? { ...c, isRevealed: true } : c,
        );
        return checkWinCondition(
          {
            ...state,
            board: revealedBoard,
          },
          onWin,
        );
      }
    }

    case GameActionType.TOGGLE_FLAG: {
      const { cellId } = action.payload;

      // Can't flag if game is not started or is over
      if (
        state.status === GameStatus.IDLE ||
        state.status === GameStatus.WON ||
        state.status === GameStatus.LOST
      ) {
        return state;
      }

      const cellIndex = state.board.findIndex((c) => c.id === cellId);
      if (cellIndex === -1) return state;

      const cell = state.board[cellIndex];

      // Can't flag revealed cells
      if (cell.isRevealed) return state;

      // Toggle flag
      const newFlagged = !cell.isFlagged;
      const newBoard = state.board.map((c) =>
        c.id === cellId ? { ...c, isFlagged: newFlagged } : c,
      );

      const newFlagsPlaced = newFlagged
        ? state.flagsPlaced + 1
        : state.flagsPlaced - 1;

      return {
        ...state,
        board: newBoard,
        flagsPlaced: newFlagsPlaced,
      };
    }

    case GameActionType.AUTO_OPEN: {
      const { cellId } = action.payload;

      // Can't auto-open if game is over
      if (
        state.status === GameStatus.WON ||
        state.status === GameStatus.LOST ||
        state.status === GameStatus.IDLE
      ) {
        return state;
      }

      const cellIndex = state.board.findIndex((c) => c.id === cellId);
      if (cellIndex === -1) return state;

      const cell = state.board[cellIndex];

      // Can only auto-open revealed numbered cells
      if (!cell.isRevealed || cell.adjacentMines === 0 || cell.isMine) {
        return state;
      }

      // Get neighbors
      const [r, c] = cellId.split("-").map(Number);
      const neighbors: string[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            neighbors.push(`${nr}-${nc}`);
          }
        }
      }

      // Count flagged neighbors
      const flaggedCount = neighbors.filter((neighborId) => {
        const neighbor = state.board.find((c) => c.id === neighborId);
        return neighbor?.isFlagged;
      }).length;

      // Only auto-open if flags count equals adjacent mines
      if (flaggedCount !== cell.adjacentMines) {
        return state;
      }

      // Reveal all unflagged neighbors
      let newBoard = state.board.map((c) => ({ ...c }));
      let hitMine = false;

      for (const neighborId of neighbors) {
        const neighborIndex = newBoard.findIndex((c) => c.id === neighborId);
        if (neighborIndex === -1) continue;

        const neighbor = newBoard[neighborIndex];

        // Skip if already revealed or flagged
        if (neighbor.isRevealed || neighbor.isFlagged) continue;

        // Reveal the neighbor
        newBoard[neighborIndex] = { ...neighbor, isRevealed: true };

        // Check if we hit a mine
        if (neighbor.isMine) {
          hitMine = true;
        } else if (neighbor.adjacentMines === 0) {
          // Use flood fill for cells with 0 adjacent mines
          newBoard = revealFlood(newBoard, state.rows, state.cols, neighborId);
        }
      }

      // If we hit a mine, game over
      if (hitMine) {
        return {
          ...state,
          board: newBoard,
          status: GameStatus.LOST,
          endTime: Date.now(),
        };
      }

      // Check win condition
      return checkWinCondition(
        {
          ...state,
          board: newBoard,
        },
        onWin,
      );
    }

    case GameActionType.GAME_WON: {
      return {
        ...state,
        status: GameStatus.WON,
        endTime: Date.now(),
      };
    }

    case GameActionType.GAME_LOST: {
      const { cellId } = action.payload;

      // Reveal all mines
      const revealedBoard = state.board.map((c) =>
        c.isMine || c.id === cellId ? { ...c, isRevealed: true } : c,
      );

      return {
        ...state,
        board: revealedBoard,
        status: GameStatus.LOST,
        endTime: Date.now(),
      };
    }

    case GameActionType.RESET_GAME: {
      return createInitialState(
        state.rows,
        state.cols,
        state.mines,
        state.difficulty,
      );
    }

    default:
      return state;
  }
}

/**
 * Check if the player has won the game
 */
function checkWinCondition(
  state: GameState,
  onWin?: (state: GameState) => void,
): GameState {
  if (state.status !== GameStatus.PLAYING) return state;

  // Win condition: all non-mine cells are revealed
  const allNonMinesRevealed = state.board.every(
    (cell) => cell.isMine || cell.isRevealed,
  );

  if (allNonMinesRevealed) {
    const wonState = {
      ...state,
      status: GameStatus.WON,
      endTime: Date.now(),
    };

    // Call the win callback if provided
    if (onWin) {
      onWin(wonState);
    }

    return wonState;
  }

  return state;
}

/**
 * Custom hook for game state management with highscore persistence
 */
export function useGameReducer(
  initialDifficulty: Difficulty = Difficulty.BEGINNER,
  onWinCallback?: (state: GameState) => void,
) {
  const config = DIFFICULTY_CONFIGS[initialDifficulty];
  const initialState = config
    ? createInitialState(
        config.rows,
        config.cols,
        config.mines,
        initialDifficulty,
      )
    : createInitialState(9, 9, 10, initialDifficulty);

  const [state, dispatch] = useReducer(
    (state: GameState, action: GameAction) =>
      gameReducer(state, action, onWinCallback),
    initialState,
  );

  // Start new game
  const startNewGame = useCallback(
    (
      difficulty: Difficulty,
      customConfig?: { rows: number; cols: number; mines: number },
    ) => {
      const config = customConfig || DIFFICULTY_CONFIGS[difficulty];
      if (!config) return;

      dispatch({
        type: GameActionType.NEW_GAME,
        payload: {
          rows: config.rows,
          cols: config.cols,
          mines: config.mines,
          difficulty,
        },
      });
    },
    [],
  );

  // Reveal a cell
  const revealCell = useCallback((cellId: string) => {
    dispatch({
      type: GameActionType.REVEAL_CELL,
      payload: { cellId },
    });
  }, []);

  // Toggle flag on a cell
  const toggleFlag = useCallback((cellId: string) => {
    dispatch({
      type: GameActionType.TOGGLE_FLAG,
      payload: { cellId },
    });
  }, []);

  // Auto-open neighbors of a numbered cell
  const autoOpen = useCallback((cellId: string) => {
    dispatch({
      type: GameActionType.AUTO_OPEN,
      payload: { cellId },
    });
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    dispatch({
      type: GameActionType.RESET_GAME,
    });
  }, []);

  return {
    state,
    dispatch,
    startNewGame,
    revealCell,
    toggleFlag,
    autoOpen,
    resetGame,
  };
}
