import { describe, it, expect } from "vitest";
import { generateBoard, revealFlood } from "@/lib/board";
import { Cell } from "@/types/game";

describe("generateBoard", () => {
  it("should create a board with correct dimensions", () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;

    const board = generateBoard(rows, cols, mines);

    expect(board).toHaveLength(rows * cols);

    // Check first and last cells have correct coordinates
    expect(board[0]).toMatchObject({ id: "0-0", row: 0, col: 0 });
    expect(board[board.length - 1]).toMatchObject({
      id: "8-8",
      row: 8,
      col: 8,
    });
  });

  it("should produce exact mine count", () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;

    const board = generateBoard(rows, cols, mines);

    const mineCount = board.filter((cell) => cell.isMine).length;
    expect(mineCount).toBe(mines);
  });

  it("should produce exact mine count for different configurations", () => {
    const testCases = [
      { rows: 16, cols: 16, mines: 40 },
      { rows: 16, cols: 30, mines: 99 },
      { rows: 5, cols: 5, mines: 5 },
    ];

    for (const { rows, cols, mines } of testCases) {
      const board = generateBoard(rows, cols, mines);
      const mineCount = board.filter((cell) => cell.isMine).length;
      expect(mineCount).toBe(mines);
    }
  });

  it("should initialize all cells with correct default values", () => {
    const board = generateBoard(5, 5, 3);

    for (const cell of board) {
      expect(cell.isRevealed).toBe(false);
      expect(cell.isFlagged).toBe(false);
      expect(cell.id).toMatch(/^\d+-\d+$/);
      expect(typeof cell.adjacentMines).toBe("number");
      expect(cell.adjacentMines).toBeGreaterThanOrEqual(0);
      expect(cell.adjacentMines).toBeLessThanOrEqual(8);
    }
  });

  it("should calculate adjacentMines correctly", () => {
    // Create a small board and manually verify adjacent mine counts
    const board = generateBoard(3, 3, 0); // No mines initially

    // Manually place a mine in the center
    board[4].isMine = true; // Cell 1-1 (center)

    // Recalculate adjacent mines manually
    const recalculatedBoard = generateBoard(3, 3, 0);
    recalculatedBoard[4].isMine = true;

    // Better test: verify adjacentMines calculation is correct for any board
    const testBoard = generateBoard(9, 9, 10);
    for (const cell of testBoard) {
      if (!cell.isMine) {
        // Count adjacent mines manually
        let count = 0;
        const r = cell.row;
        const c = cell.col;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
              const neighborIdx = nr * 9 + nc;
              if (testBoard[neighborIdx].isMine) {
                count++;
              }
            }
          }
        }
        expect(cell.adjacentMines).toBe(count);
      }
    }
  });

  describe("excludeId parameter", () => {
    it("should exclude the specified cell from mine placement", () => {
      const rows = 5;
      const cols = 5;
      const mines = 10;
      const excludeId = "2-2"; // Center cell

      // Run multiple times to ensure it's consistent
      for (let i = 0; i < 10; i++) {
        const board = generateBoard(rows, cols, mines, excludeId);
        const excludedCell = board.find((cell) => cell.id === excludeId);

        expect(excludedCell).toBeDefined();
        expect(excludedCell!.isMine).toBe(false);
      }
    });

    it("should exclude the 8 neighbors from mine placement", () => {
      const rows = 5;
      const cols = 5;
      const mines = 15; // More mines to increase probability
      const excludeId = "2-2"; // Center cell

      // Run multiple times to ensure it's consistent
      for (let i = 0; i < 10; i++) {
        const board = generateBoard(rows, cols, mines, excludeId);

        // Get the excluded cell coordinates
        const [excludeRow, excludeCol] = excludeId.split("-").map(Number);

        // Check the excluded cell and all 8 neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = excludeRow + dr;
            const nc = excludeCol + dc;

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const cellId = `${nr}-${nc}`;
              const cell = board.find((c) => c.id === cellId);

              expect(cell).toBeDefined();
              expect(cell!.isMine).toBe(false);
            }
          }
        }
      }
    });

    it("should exclude cells at board edge", () => {
      const rows = 5;
      const cols = 5;
      const mines = 10;
      const excludeId = "0-0"; // Top-left corner

      for (let i = 0; i < 5; i++) {
        const board = generateBoard(rows, cols, mines, excludeId);

        // Corner cell has only 3 neighbors: (0,1), (1,0), (1,1)
        const excludedZone = ["0-0", "0-1", "1-0", "1-1"];

        for (const cellId of excludedZone) {
          const cell = board.find((c) => c.id === cellId);
          expect(cell!.isMine).toBe(false);
        }
      }
    });

    it("should still produce exact mine count when excludeId is provided", () => {
      const rows = 9;
      const cols = 9;
      const mines = 10;
      const excludeId = "4-4";

      const board = generateBoard(rows, cols, mines, excludeId);

      const mineCount = board.filter((cell) => cell.isMine).length;
      expect(mineCount).toBe(mines);
    });

    it("should handle case where mine count exceeds available cells", () => {
      const rows = 3;
      const cols = 3;
      const mines = 20; // More than total cells
      const excludeId = "1-1"; // Center, excludes all 9 cells

      const board = generateBoard(rows, cols, mines, excludeId);

      // Should place 0 mines since all cells are excluded
      const mineCount = board.filter((cell) => cell.isMine).length;
      expect(mineCount).toBe(0);
    });
  });
});

describe("revealFlood", () => {
  it("should not mutate the original board", () => {
    const board = generateBoard(5, 5, 3);
    const originalBoard = board.map((cell) => ({ ...cell }));

    revealFlood(board, 5, 5, "0-0");

    // Original board should be unchanged
    expect(board).toEqual(originalBoard);
  });

  it("should reveal the starting cell", () => {
    const board = generateBoard(5, 5, 0); // No mines
    const startId = "2-2";

    const newBoard = revealFlood(board, 5, 5, startId);

    const revealedCell = newBoard.find((cell) => cell.id === startId);
    expect(revealedCell!.isRevealed).toBe(true);
  });

  it("should reveal all cells in a mine-free region", () => {
    // Create a board with no mines
    const board = generateBoard(5, 5, 0);

    const newBoard = revealFlood(board, 5, 5, "0-0");

    // All cells should be revealed since there are no mines
    const revealedCount = newBoard.filter((cell) => cell.isRevealed).length;
    expect(revealedCount).toBe(25);
  });

  it("should stop at cells with adjacent mines", () => {
    // Create a small controlled board
    const rows = 5;
    const cols = 5;
    const board: Cell[] = [];

    // Initialize all cells
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

    // Place a mine at position 2-2
    board[12].isMine = true; // row 2, col 2

    // Calculate adjacent mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const cell = board[index];

        if (!cell.isMine) {
          let count = 0;

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

    // Start flood fill from corner (0-0)
    const newBoard = revealFlood(board, rows, cols, "0-0");

    // Cells adjacent to the mine should be revealed but not cells beyond
    const cell_1_1 = newBoard.find((c) => c.id === "1-1");
    const cell_0_0 = newBoard.find((c) => c.id === "0-0");

    expect(cell_0_0!.isRevealed).toBe(true);
    expect(cell_1_1!.isRevealed).toBe(true);
    expect(cell_1_1!.adjacentMines).toBe(1);

    // The mine itself should not be revealed
    const mineCell = newBoard.find((c) => c.id === "2-2");
    expect(mineCell!.isRevealed).toBe(false);
  });

  it("should not reveal flagged cells", () => {
    const board = generateBoard(5, 5, 0);

    // Flag a cell
    board[5].isFlagged = true; // Cell 1-0

    const newBoard = revealFlood(board, 5, 5, "0-0");

    // Flagged cell should not be revealed
    const flaggedCell = newBoard.find((cell) => cell.id === "1-0");
    expect(flaggedCell!.isRevealed).toBe(false);
    expect(flaggedCell!.isFlagged).toBe(true);
  });

  it("should not reveal mine cells", () => {
    const board = generateBoard(5, 5, 1);

    // Find a cell with adjacentMines = 0 to start flood fill
    const startCell = board.find(
      (cell) => !cell.isMine && cell.adjacentMines === 0,
    );

    if (startCell) {
      const newBoard = revealFlood(board, 5, 5, startCell.id);

      // No mines should be revealed
      const revealedMines = newBoard.filter(
        (cell) => cell.isMine && cell.isRevealed,
      ).length;
      expect(revealedMines).toBe(0);
    }
  });

  it("should reveal correct non-mine region from a start cell with adjacentMines=0", () => {
    // Create a board with mines only in one corner
    const rows = 8;
    const cols = 8;
    const board: Cell[] = [];

    // Initialize all cells
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

    // Place mines in top-right corner
    board[7].isMine = true; // 0-7
    board[15].isMine = true; // 1-7

    // Calculate adjacent mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const cell = board[index];

        if (!cell.isMine) {
          let count = 0;

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

    // Start from bottom-left corner which should have adjacentMines = 0
    const startCell = board.find((c) => c.id === "7-0");
    expect(startCell!.adjacentMines).toBe(0);

    const newBoard = revealFlood(board, rows, cols, "7-0");

    // Count revealed cells
    const revealedCount = newBoard.filter((cell) => cell.isRevealed).length;

    // Most of the board should be revealed except the mines and some cells near them
    expect(revealedCount).toBeGreaterThan(50);

    // Mines should not be revealed
    const revealedMines = newBoard.filter(
      (cell) => cell.isMine && cell.isRevealed,
    ).length;
    expect(revealedMines).toBe(0);

    // Start cell should be revealed
    const revealedStartCell = newBoard.find((c) => c.id === "7-0");
    expect(revealedStartCell!.isRevealed).toBe(true);
  });

  it("should handle already revealed cells gracefully", () => {
    const board = generateBoard(5, 5, 0);

    // Reveal some cells manually
    board[0].isRevealed = true;
    board[1].isRevealed = true;

    const newBoard = revealFlood(board, 5, 5, "0-0");

    // Should still work and reveal all cells
    const revealedCount = newBoard.filter((cell) => cell.isRevealed).length;
    expect(revealedCount).toBe(25);
  });
});
