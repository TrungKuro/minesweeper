> Cursor - Agent: _claude-4.5-sonnet_

# Step 0 — Add helper folder & types

- Goal:
  - Tạo `src/types/game.ts`
  - Tạo `src/lib/board.ts` (skeleton)
  - Tạo `src/hooks/useGameReducer.ts` (skeleton).

- Cursor prompt (copy vào chat agent):

  ```
  Repo context: Next.js + TypeScript. Create file src/types/game.ts with the GameState, Cell, Difficulty, GameAction TS types we discussed (flat board: Cell[]). Keep types strict.

  Also create src/lib/board.ts with exported function signatures:
  - generateBoard(rows:number, cols:number, mines:number, excludeId?:string): Cell[]
  - revealFlood(board:Cell[], rows:number, cols:number, startId:string): Cell[]
  But don't implement logic yet—just exports and JSDoc.
  ```

- → Commit: feat: add types + board skeleton

# Response Step 0

I'll create the type definitions and function signatures as requested. Let me start by creating the types file with strict TypeScript types for the Minesweeper game.

> [2 tools called]
> game.ts
> board.ts

Now let me check for any linting errors in the files I just created:

> [1 tool called]
> No linter errors found

Perfect! I've successfully created both files:

## ✅ Created Files

### 1. **`src/types/game.ts`** - Strict TypeScript type definitions

This file includes:

- **`Cell`** interface with all properties for a board cell:
  - `id`, `row`, `col` for positioning
  - `isMine`, `isRevealed`, `isFlagged` for state
  - `adjacentMines` for the mine count

- **`Difficulty`** enum with BEGINNER, INTERMEDIATE, EXPERT, and CUSTOM levels

- **`DifficultyConfig`** interface and `DIFFICULTY_CONFIGS` mapping for preset board configurations

- **`GameStatus`** enum (IDLE, PLAYING, WON, LOST)

- **`GameState`** interface with:
  - Flat `board: Cell[]` array
  - Board dimensions (`rows`, `cols`, `mines`)
  - Game status and timing info
  - Flag counter

- **`GameAction`** discriminated union type with strict typing for each action:
  - NEW_GAME, REVEAL_CELL, TOGGLE_FLAG, REVEAL_FLOOD, GAME_WON, GAME_LOST, RESET_GAME

### 2. **`src/lib/board.ts`** - Function signatures with JSDoc

- **`generateBoard(rows, cols, mines, excludeId?)`** - Creates a new board with mines placed randomly
- **`revealFlood(board, rows, cols, startId)`** - Flood-fill algorithm for revealing connected cells

Both functions have detailed JSDoc comments explaining their purpose, parameters, return values, and include usage examples. The implementations throw "Not implemented" errors as requested, ready for you to fill in the logic later.

All types are strict with no linter errors! 🎯
