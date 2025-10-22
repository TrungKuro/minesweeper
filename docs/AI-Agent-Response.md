> Cursor - Agent: _claude-4.5-sonnet_

# Step 0 — Add helper folder & types

- **Goal:**
  - Tạo `src/types/game.ts`
  - Tạo `src/lib/board.ts` (skeleton)
  - Tạo `src/hooks/useGameReducer.ts` (skeleton).

- **Cursor prompt (copy vào chat agent):**

  ```
  Repo context: Next.js + TypeScript. Create file src/types/game.ts with the GameState, Cell, Difficulty, GameAction TS types we discussed (flat board: Cell[]). Keep types strict.

  Also create src/lib/board.ts with exported function signatures:
  - generateBoard(rows:number, cols:number, mines:number, excludeId?:string): Cell[]
  - revealFlood(board:Cell[], rows:number, cols:number, startId:string): Cell[]
  But don't implement logic yet—just exports and JSDoc.
  ```

- ➡️ **Commit:** `feat: add types + board skeleton`

# Response `Step 0`

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

# M1 — Implement core board generation + flood fill (critical)

- **Why first:** logic-heavy; tests validate correctness early.

- **Files to implement:** `src/lib/board.ts` fully, plus unit tests `tests/board.test.ts`.

- **Cursor prompt (implement + test):**

  ```
  Implement in src/lib/board.ts:
  - generateBoard(rows, cols, mines, excludeId?) that:
    * creates rows*cols Cell[] with id `${r}-${c}`
    * when excludeId provided, excludes that cell and its 8 neighbors from mine placement
    * randomly picks mines from allowed indices, sets isMine true
    * computes adjacentMines for all cells
  - revealFlood(board, rows, cols, startId) that returns a new board with iterative flood-fill (stack) revealing cells; don't mutate original.

  Write unit tests in tests/board.test.ts to assert:
  - generateBoard produces exact mine count
  - when excludeId provided, exclude zone has no mine
  - revealFlood reveals correct non-mine region from a start cell with adjacentMines=0.

  Run tests and fix failures.
  ```

- **Tips using Cursor:**
  - Ask Cursor to run tests after implementing:
    - `Run tests` or `npm test`.
    - If failing, request fix: _“Test X failing — show failing trace and patch code.”_

- ➡️ **Commit message:** `feat(board): implement generateBoard + revealFlood + tests`

# Response `M1`

## Tóm tắt những gì đã làm:

1. ✅ **Implemented `generateBoard`** trong `src/lib/board.ts`:
   - Tạo board với `rows * cols` cells
   - Cell ID format: `${r}-${c}`
   - Khi có `excludeId`, loại trừ cell đó và 8 neighbors khỏi mine placement
   - Random placement mines bằng Fisher-Yates shuffle
   - Tính `adjacentMines` cho tất cả cells

2. ✅ **Implemented `revealFlood`** trong `src/lib/board.ts`:
   - Sử dụng iterative flood-fill với stack
   - Không mutate original board (tạo copy mới)
   - Reveal cells liên tục khi `adjacentMines = 0`
   - Stop tại numbered cells
   - Skip flagged cells và mines

3. ✅ **Created comprehensive unit tests** trong `tests/board.test.ts`:
   - Test exact mine count
   - Test exclude zone không có mines
   - Test flood-fill reveals đúng region
   - **18/18 tests passing**

4. ✅ **Setup vitest** với config và test scripts trong package.json

Tất cả code đã clean, không có linter errors!
