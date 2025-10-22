> Prompt (Chat-GPT):
>
> Tôi dùng IDE Cursor, chỉ tôi step-by-step dùng với AI-agent để hoàn thiện project.

# 📶 `Step by Step`

Tuyệt — mình sẽ hướng dẫn **bước-dịch-bước** (step-by-step) để bạn dùng **IDE Cursor + AI agent** hoàn thiện project Minesweeper (theo spec Pro bạn đã chọn). Mình viết theo lộ trình thực tế: thiết lập repo → M1..M5 → test → deploy. Ở mỗi bước mình đưa **lệnh cụ thể**, **những prompt mẫu** bạn copy-paste cho AI-agent trong Cursor, và **mẹo dùng AI** để phát triển nhanh, debug, refactor, viết test và viết README/case study.

Mình giả định bạn đã cài Node.js, git, và có tài khoản Vercel. Nếu thiếu, chạy lệnh cài trước (npm, git).

---

## Tổng quan milestone (tốc độ làm)

1. M1 — Setup + basic board (playable)
2. M2 — Flags, timer, difficulty, persistence
3. M3 — Pro features (leaderboard, custom, chording)
4. M4 — UI polish + animations + sounds
5. M5 — Tests, accessibility, deploy, docs

Mỗi milestone tương ứng với một branch git. Dùng Cursor AI để tạo file, chạy tests, sửa lỗi, refactor, viết docs.

---

## A. Init project & git (local)

1. Tạo project Next.js + TS:

```
npx create-next-app@latest minesweeper --typescript
cd minesweeper
```

2. Init git:

```bash
git init
git add .
git commit -m "chore: init nextjs typescript project"
```

3. Cài dev deps cơ bản:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion zustand
npm install clsx
# testing
npm install -D jest @types/jest vitest @testing-library/react @testing-library/jest-dom
```

(hoặc dùng pnpm/yarn nếu thích)

4. Mở project bằng Cursor (hoặc mở folder trong Cursor).

---

## B. Cấu trúc branch + work flow với Cursor AI

- `main` — production ready
- `feat/m1-board` — M1
- `feat/m2-gameplay` — M2
- `feat/m3-pro` — M3
- `feat/m4-polish` — M4
- `chore/tests-and-deploy` — M5

Luồng làm: tạo feature branch → ask Cursor AI to generate files/implement → run local dev → iterate → commit & push → open PR (Cursor can help draft PR).

---

## C. Cách dùng AI-agent (Cursor) hiệu quả — pattern chuẩn

1. **Chunking**: chia task thành units nhỏ (create file, implement function, write tests, run tests, fix).
2. **Prompt style**: cho context ngắn, file path, và test/requirement rõ ràng. Ví dụ: “Implement `generateBoard` to place mines excluding firstClickId; write unit tests to validate mine count and exclusion.”
3. **Iterate fast**: ask agent to run tests (Cursor tích hợp runner), fix failing tests, repeat.
4. **Refactor request**: “Refactor this function to O(n) memory and add comments + TS types.”
5. **Review & explain**: ask “Explain why you did X” để hiểu trade-offs.

---

## D. Step-by-step chi tiết (mỗi step kèm prompt mẫu)

### Step 0 — Add helper folder & types

**Goal:** tạo `src/types/game.ts`, `src/lib/board.ts` (skeleton) và `src/hooks/useGameReducer.ts` (skeleton).

**Cursor prompt (copy vào chat agent):**

```
Repo context: Next.js + TypeScript. Create file src/types/game.ts with the GameState, Cell, Difficulty, GameAction TS types we discussed (flat board: Cell[]). Keep types strict.

Also create src/lib/board.ts with exported function signatures:
- generateBoard(rows:number, cols:number, mines:number, excludeId?:string): Cell[]
- revealFlood(board:Cell[], rows:number, cols:number, startId:string): Cell[]
But don't implement logic yet—just exports and JSDoc.
```

→ Commit: `feat: add types + board skeleton`

---

### M1 — Implement core board generation + flood fill (critical)

**Why first:** logic-heavy; tests validate correctness early.

**Files to implement:** `src/lib/board.ts` fully, plus unit tests `tests/board.test.ts`.

**Cursor prompt (implement + test):**

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

**Tips using Cursor:**

- Ask Cursor to run tests after implementing: `Run tests` or `npm test`. If failing, request fix: “Test X failing — show failing trace and patch code.”

**Commit message:** `feat(board): implement generateBoard + revealFlood + tests`

---

### M1b — Hook `useGameReducer` skeleton → integrate board

**Goal:** reducer with INIT, FIRST_CLICK, REVEAL, TOGGLE_FLAG, TICK, RESET.

**Cursor prompt:**

```
Implement src/hooks/useGameReducer.ts using useReducer with types from src/types/game.ts and functions from src/lib/board.ts.
- FIRST_CLICK should call generateBoard(rows,cols,mines, excludeId)
- REVEAL should call revealFlood or handle mine (set exploded)
- TICK increments timerSeconds only when started and not finished.

Also write tests reducer.test.ts for win detection logic (simulate small board).
```

**Dev-run:** start dev server `npm run dev`, open UI later.

**Commit:** `feat(game): implement useGameReducer + tests`

---

### M2 — Gameplay UX: flags, timer, difficulty, localStorage highscores

**Tasks:**

- Implement `useTimer` hook and wire to reducer `state.started` & `actions.tick`
- Implement `useLocalStorage` helper and `lib/storage.ts` keys
- Implement UI components: `Header`, `Board`, `Cell` basic (no animation)
- Keyboard & long-press behavior (use `useLongPress`)

**Cursor prompts (UI + storage):**

```
Create components:
- src/components/Header/Header.tsx: shows timer, mine counter, difficulty dropdown, restart button.
- src/components/Board/Board.tsx: renders grid from state.board and Cell components.
- src/components/Board/Cell.tsx: minimal visuals; handles onClick => reveal; onContextMenu => toggleFlag (preventDefault). Use React.memo to avoid re-renders.

Implement src/hooks/useLocalStorage.ts.

Wire highscore persistence: when reducer transitions to won, call saveHighscore(difficulty, {name: 'Anonymous', time: state.timerSeconds, date: new Date().toISOString()}) and store in localStorage key minesweeper:highscores.
```

**Test prompts:**

- Ask Cursor to run manual play checks: simulate clicks, flags. Use unit tests or E2E with Playwright/Cypress later.

**Commit:** `feat(ui): basic header, board, cell; persistence highscores`

---

### M3 — Pro features: custom board, leaderboard, chording (auto-open)

**Tasks & prompts:**

- Implement chording (`AUTO_OPEN`) in reducer: if revealed cell's adjacentMines === flaggedNeighbors then reveal unflagged neighbors.
- Leaderboard UI drawer + name input on win.
- Custom board modal.

**Cursor prompt for AUTO_OPEN:**

```
Implement AUTO_OPEN reducer action: given an id of a revealed numbered cell, count flagged neighbors; if equal to adjacentMines, reveal all unflagged neighbors (they may cause a mine explode). Use revealFlood for neighbors that are zero. Return updated board and finished/won state if applicable.
Add unit tests covering:
- Auto-open reveals safe neighbors
- Auto-open causes loss when wrong flags placed
```

**Commit:** `feat(game): auto-open (chording) + leaderboard UI`

---

### M4 — Visual polish & animations

**Tasks:**

- Integrate Framer Motion into Cell reveal animation
- Modern glossy theme via Tailwind tokens; make responsive
- Add sounds (optional) with toggle in settings

**Cursor prompt (animation):**

```
Refactor src/components/Board/Cell.tsx to use Framer Motion for reveal animations:
- When revealed change: animate scale from 0.95 -> 1 and fade-in
- When flagged toggle: flip animation
Also add Tailwind classes for modern glossy card; create theme tokens in src/styles/globals.css
```

**Accessibility passes:** Ask Cursor to run axe-core (if set) and propose fixes.

**Commit:** `feat(ui): animations + theme polish`

---

### M5 — Tests, CI, Deploy, README

**Tasks:**

- Write unit tests (board + reducer) and E2E tests (Playwright/Cypress) for main flows.
- Setup GitHub Actions (or Vercel) to run tests on PR.
- Deploy to Vercel.

**Cursor prompts:**

```
1) Create GitHub Actions workflow .github/workflows/ci.yml to:
- Install dependencies
- Run lint, tests
2) Create Playwright tests for flows: reveal cell, place flag, win flow.
3) Provide Vercel deployment steps (connect repo, set build command `npm run build`).
4) Generate README.md with:
- TL;DR
- How to run locally
- Architecture + state machine description (short)
- What I learned (postmortem bullets)
```

**Commands to run locally before pushing:**

```bash
npm run build
npm run test
```

**Commit:** `chore(ci): add tests and CI workflow` then push and open PR.

---

## E. Example prompts you can paste in Cursor (VN + EN versions)

### Create file + implement function (EN):

```
Context: Next.js TypeScript project. Implement function generateBoard in src/lib/board.ts.
Requirements:
- Accept rows, cols, mines, excludeId?
- Return Cell[] with ids `${r}-${c}` and proper fields
- If excludeId provided, exclude that cell and its neighbors from mine placement
- Compute adjacentMines for all cells
Write TS code with JSDoc and unit tests in tests/board.test.ts verifying mine count and exclusion.
```

### Sửa lỗi failing test (VN):

```
Test failing: tests/board.test.ts -> generateBoard excludes first click, assertion shows a mine in excluded area. Hiểu log lỗi và sửa hàm generateBoard. Giải thích nguyên nhân ngắn gọn rồi sửa code.
```

### Refactor for perf:

```
Refactor revealFlood to be iterative and O(n) time, avoid recursion; keep same behavior. Add comments and type annotations.
```

### Write README excerpt:

```
Write README section "What I learned building Minesweeper" (bulleted, 6 items) focusing on algorithms, perf, accessibility, testing, trade-offs.
```

---

## F. Debugging workflow with Cursor (best practice)

1. Run dev server: `npm run dev`. Open browser.
2. When bug appears, copy failing stack trace and ask Cursor:
   - “There is an error X at file Y line Z — explain why and propose a fix.”

3. For logic bugs, create a failing unit test that reproduces bug and ask agent to fix code until test passes.
4. Use `git add -p` to stage meaningful commits.

---

## G. PR checklist template (use when opening PR)

- [ ] Build passes (`npm run build`)
- [ ] Unit tests passed
- [ ] E2E tests for main flows
- [ ] Accessibility: keyboard + screen reader basic check
- [ ] README / Changelog updated
- [ ] Demo link (if deployed)

---

## H. Deployment (Vercel) quick steps

1. Push branch to GitHub:

```bash
git checkout -b feat/m1-board
git push -u origin feat/m1-board
```

2. Connect repo on Vercel UI, set framework to Next.js, build `npm run build`, publish.
3. Add environment variables (none needed for localStorage-only).
4. Once deployed, copy live link into README and PR.

---

## I. Final tips — hire/recruiter impact

- Add a short video (10–20s) demoing the game interaction in repo README.
- Include a “How to try” with one-click Vercel link and keyboard controls.
- Add `?replay=true` or shareable score text (copy result) on win modal to show polish.
- Keep code modular: utilities in `lib/`, hooks in `hooks/`, UI small components.

---
