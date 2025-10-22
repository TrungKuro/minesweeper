import { Cell } from "@/types/game";

/**
 * Generates a new Minesweeper board with the specified dimensions and mine count.
 *
 * The board is represented as a flat array of Cell objects. Mines are randomly
 * distributed across the board, with the option to exclude a specific cell
 * (typically the first cell clicked by the player).
 *
 * After placing mines, the function calculates the adjacentMines count for each
 * non-mine cell based on the number of mines in the 8 surrounding cells.
 *
 * @param rows - Number of rows in the board
 * @param cols - Number of columns in the board
 * @param mines - Total number of mines to place on the board
 * @param excludeId - Optional cell ID to exclude from mine placement (e.g., "0-0")
 * @returns A flat array of Cell objects representing the game board
 *
 * @example
 * ```ts
 * // Generate a 9x9 beginner board with 10 mines
 * const board = generateBoard(9, 9, 10);
 *
 * // Generate a board excluding the first clicked cell
 * const board = generateBoard(9, 9, 10, "4-5");
 * ```
 */
export function generateBoard(
  rows: number,
  cols: number,
  mines: number,
  excludeId?: string,
): Cell[] {
  // Initialize empty board
  const board: Cell[] = [];

  // Create all cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${r}-${c}`;
      board.push({
        id,
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
  }

  // Get excluded cell indices if excludeId is provided
  const excludedIndices = new Set<number>();
  if (excludeId) {
    const [excludeRow, excludeCol] = excludeId.split("-").map(Number);

    // Add the excluded cell and its 8 neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = excludeRow + dr;
        const nc = excludeCol + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const index = nr * cols + nc;
          excludedIndices.add(index);
        }
      }
    }
  }

  // Get all available indices for mine placement
  const availableIndices: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (!excludedIndices.has(i)) {
      availableIndices.push(i);
    }
  }

  // Randomly place mines
  const mineCount = Math.min(mines, availableIndices.length);
  const shuffled = [...availableIndices];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Place mines in first mineCount positions
  for (let i = 0; i < mineCount; i++) {
    board[shuffled[i]].isMine = true;
  }

  // Calculate adjacent mines for all cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const cell = board[index];

      if (!cell.isMine) {
        let count = 0;

        // Check all 8 neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighborIndex = nr * cols + nc;
              if (board[neighborIndex].isMine) {
                count++;
              }
            }
          }
        }

        cell.adjacentMines = count;
      }
    }
  }

  return board;
}

/**
 * Reveals all connected cells starting from a given cell using flood-fill algorithm.
 *
 * When a cell with 0 adjacent mines is revealed, this function automatically reveals
 * all connected cells that also have 0 adjacent mines, and their immediate neighbors.
 * The flood-fill stops at cells with adjacent mines (numbered cells) or flagged cells.
 *
 * @param board - Current game board as a flat array of cells
 * @param rows - Number of rows in the board
 * @param cols - Number of columns in the board
 * @param startId - The ID of the cell where the flood-fill should start
 * @returns A new board array with the revealed cells updated
 *
 * @example
 * ```ts
 * // Reveal connected cells starting from cell "3-4"
 * const newBoard = revealFlood(currentBoard, 9, 9, "3-4");
 * ```
 */
export function revealFlood(
  board: Cell[],
  rows: number,
  cols: number,
  startId: string,
): Cell[] {
  // Create a new board (immutable update)
  const newBoard = board.map((cell) => ({ ...cell }));

  // Helper to get cell by ID
  const getCellIndex = (cellId: string): number => {
    const [r, c] = cellId.split("-").map(Number);
    return r * cols + c;
  };

  // Helper to get neighbors
  const getNeighbors = (cellId: string): string[] => {
    const [r, c] = cellId.split("-").map(Number);
    const neighbors: string[] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push(`${nr}-${nc}`);
        }
      }
    }

    return neighbors;
  };

  // Iterative flood-fill using a stack
  const stack: string[] = [startId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const currentId = stack.pop()!;

    // Skip if already visited
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const index = getCellIndex(currentId);
    const cell = newBoard[index];

    // Skip if flagged
    if (cell.isFlagged) continue;

    // Skip if it's a mine (shouldn't happen in normal gameplay)
    if (cell.isMine) continue;

    // Reveal the cell (if not already revealed)
    cell.isRevealed = true;

    // If cell has adjacent mines, stop flood-fill here (numbered cell)
    if (cell.adjacentMines > 0) continue;

    // If cell has 0 adjacent mines, add all neighbors to stack
    const neighbors = getNeighbors(currentId);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        stack.push(neighborId);
      }
    }
  }

  return newBoard;
}
