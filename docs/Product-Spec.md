# 🔑 `Product Spec`

Tốt — **Minesweeper** là một lựa chọn “logic-heavy + UX chứng minh cẩn thận”.

Trước khi viết spec chi tiết, cần chốt **version scope**. Tôi hỏi 3 câu ngắn để xác định mức “độ xịn” bạn muốn build:

---

### Q1 — Về dữ liệu & persist

Bạn muốn game **tự reset mỗi lần mở web** hay có **lưu lại** (localStorage) điểm cao, setting, lần chơi gần nhất?
Chọn 1:
`A = Không lưu gì`
`B = Lưu highscore`
`C = Lưu full game state (resume)`

---

### Q2 — Về feature mức nâng cao

Bạn có muốn thêm:

- Flag counter + timer
- Difficulty preset (Beginner / Intermediate / Advanced)
- Custom board size
- Auto-open ô xung quanh khi đủ flag
- Leaderboard local
- Chơi lại nhanh (quick restart)

Chọn Gói:
`Lite = chỉ basic + timer + flag`
`Standard = Lite + difficulty presets + auto-open`
`Pro = Standard + custom + leaderboard`

---

### Q3 — Về UX/Presentation

Bạn muốn style định hướng:
`Minimal clean (Apple-ish)`
`Retro pixel (Windows XP nostalgia)`
`Modern glossy (animation mượt nhẹ)`

---

Trả lời theo format sau (copy dán và chỉnh):

```
Q1: A / B / C
Q2: Lite / Standard / Pro
Q3: Minimal / Retro / Modern
```

Sau khi bạn trả lời, tôi sẽ:

1. Định nghĩa **Spec chuẩn production**
2. Vẽ **state machine / data model**
3. Đưa ra **milestone code** để bạn build đúng hướng

Chờ bạn trả lời 3 dòng theo format trên.

---

Tuyệt — bạn đã chọn: **Minesweeper** với:

- `Q1: B (Lưu highscore)`
- `Q2: Pro`
- `Q3: Modern`

> Dưới đây là spec production-ready (đủ chi tiết để bạn bắt tay code luôn):
> → spec
> → data model/state machine
> → UI & interaction
> → kỹ thuật + testing
> → milestone triển khai (task-by-task)

# 1 — Product Spec (tóm tắt)

- Board: grid NxM, số mine = preset theo difficulty hoặc custom.
- Difficulty: Beginner / Intermediate / Advanced + Custom (rows, cols, mines).
- Gameplay basics: reveal ô, flag/unflag (right-click / long-press / keyboard), auto-open neighbours khi ô có số = số flag xung quanh.
- UI elements: header (timer, mine counter, difficulty dropdown, restart), board, modal (win/lose + stats), settings panel (sound on/off, animations on/off), leaderboard local.
- Persist: highscore per difficulty stored in `localStorage` (time + date + name optional). Settings persisted.
- Accessibility: keyboard support, ARIA labels, focus outlines.
- Mobile: responsive grid, long-press for flag, detect touch.
- Polish: modern neumorphism/glossy card, small particle/sound on win, smooth animations using Framer Motion (or CSS transitions).

# 2 — Data model & localStorage schema

## In-memory state (TS types)

```ts
type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number; // 0..8
  exploded?: boolean; // true if mine caused lose
};

type GameState = {
  board: Cell[][];
  rows: number;
  cols: number;
  mines: number;
  started: boolean;
  finished: boolean;
  won: boolean;
  flagsPlaced: number;
  timerSeconds: number;
  firstClickPos?: {row:number, col:number};
  difficulty: "beginner"|"intermediate"|"advanced"|"custom";
  settings: {
    sound: boolean;
    animations: boolean;
    longPressFlagMs: number;
  };
};
```

## localStorage keys (schema)

```json
{
  "minesweeper:settings": "{...}", // JSON.stringify(settings)
  "minesweeper:highscores": "{...}", // { beginner: [{name,time,date}], ... }
  "minesweeper:lastGameStats": "{...}" // optional summary for resume or show last stats
}
```

Example `highscores` shape:

```json
{
  "beginner": [
    { "name": "Trung", "time": 23, "date": "2025-10-22T09:12:00.000Z" }
  ],
  "intermediate": [],
  "advanced": []
}
```

# 3 — State machine (simplified)

States: `idle` → `running` → (`won` | `lost`) → `idle` (restart)

Transitions:

- `idle`:
  - `START_GAME` (with config) → `running` (board generated lazily on first click OR generate but guarantee first-click safe)

- `running`:
  - `FIRST_CLICK` → start timer; ensure clicked cell isn't mine (move mine or generate after first click)
  - `REVEAL_CELL(row,col)`:
    - if mine → set `exploded`, transition to `lost`
    - else reveal cell; if adjacentMines == 0 → flood-fill reveal neighbors
    - check win: if (revealed cells === total - mines) → `won`

  - `TOGGLE_FLAG(row,col)`:
    - toggle flagged, update `flagsPlaced`

  - `AUTO_OPEN(row,col)` (chord action when revealed number equals flagged around):
    - reveal surrounding unflagged cells (can cause immediate lose)

- `won`:
  - stop timer, save highscore if in top list, show modal

- `lost`:
  - reveal all mines, show modal

# 4 — UX / Interaction details

- Controls:
  - Left click / tap: reveal
  - Right click / two-finger tap / long-press: toggle flag
  - Keyboard:
    - Arrow keys to move focus
    - Space / Enter to reveal focused cell
    - F to toggle flag on focused cell
    - R to restart

- First click guarantee: never lose on first click — generate mines after first click or relocate mine from first clicked cell.
- Auto-open/chording: when a revealed numbered cell has exactly `adjacentMines` flags around → allow middle-click/chord to open neighbors.
- Mobile long-press: configurable threshold (e.g., 400ms) in settings.
- Animations:
  - reveal: fade/scale; number pop; flag flip; mine explosion particle.
  - transitions via Framer Motion or CSS transitions for performance.

- Visual polish:
  - Subtle shadows, glass card, micro-interactions for buttons.
  - Level of polish should allow recruiter to see componentization and attention to detail.

# 5 — Tech stack & architecture

- Framework: **Next.js (app/router) or Vite + React** (choose Next.js if you want to deploy on Vercel easily)
- Language: **TypeScript**
- UI: **TailwindCSS** + custom tokens (for modern glossy look)
- State: local state per game using React + `useReducer` or `xstate` for explicit state machine; global: Zustand for settings/highscores (optional)
- Animations: **Framer Motion** (or CSS for simple)
- Storage: `localStorage` wrapper with expiry/sync helpers
- Tests: Jest + React Testing Library for unit + Cypress (or Playwright) for E2E interactions
- Lint & format: ESLint + Prettier + TypeScript strict
- Accessibility: axe-core in tests

# 6 — Performance considerations

- Board rendering: virtualize large boards? (not necessary for typical sizes but consider memoized Cell components)
- Avoid re-rendering whole board on single cell update — use `React.memo` for Cell and update cell state by identity reference.
- Flood-fill algorithm must be iterative (stack) to avoid recursion stack overflow on large boards.
- Use CSS transforms instead of layout thrashing for animations.

# 7 — Testing checklist

- Unit:
  - mine placement (count & no duplicate)
  - first-click safe logic
  - flood-fill correctness
  - win condition
  - flag counter logic

- Integration / E2E:
  - keyboard navigation
  - long-press flag on mobile emulation
  - leaderboard persistence

- Accessibility:
  - ARIA roles (grid, gridcell), tab order, screen reader labels

# 8 — Milestones (task-level, ready-to-implement)

> M1 — Project setup & basic board

- init Next.js + TypeScript + Tailwind
- global layout + header (timer, mine counter, difficulty dropdown, restart)
- Cell component basic rendering (hidden/surface)
- Generate board, place mines, calculate adjacent counts
- Implement reveal + flood-fill (no animations)
- Add first-click-safe handling

Deliverable: playable Minesweeper (no polish), local play resets on reload.

---

> M2 — Flags, timer, difficulty, persistence

- Toggle flag (right-click & keyboard F)
- Timer start on first reveal and stop on win/lose
- Difficulty presets (beginner/intermediate/advanced/custom)
- Persist settings & highscores skeleton to `localStorage` (no UI yet)
- Add mine counter (mines - flagsPlaced)

Deliverable: playable game with flags, timer, difficulty + highscores saved (background).

---

> M3 — Pro features & UX polish

- Auto-open (chording) and quick-reveal
- Custom board builder UI (rows, cols, mines)
- Leaderboard UI: show top 10 per difficulty with name entry on win
- Modal for win/lose with stats and share button (copy result)
- Mobile long-press flag handling

Deliverable: full feature set (Pro), mobile ready.

---

> M4 — Visual polish & animations

- Integrate Framer Motion animations for reveal/flag/explosion
- Modern glossy theme (Tailwind tokens + CSS)
- Sound feedback (optional, with mute)
- Micro interactions (button hover, restart animation)

Deliverable: Modern polished UI presentation-ready.

---

> M5 — Tests, accessibility, deploy & docs

- Unit tests for core logic
- E2E test for main flows
- Accessibility audit & fixes
- README (postmortem: architecture, trade-offs, improvements)
- Deploy to Vercel and add demo link in portfolio

Deliverable: production demo + README + deployed link.

# 9 — Example algorithms & pseudocode

## Flood-fill (iterative)

```ts
function floodReveal(board, startRow, startCol) {
  const stack = [{r:startRow, c:startCol}];
  while(stack.length) {
    const {r,c} = stack.pop();
    const cell = board[r][c];
    if(cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if(cell.adjacentMines === 0) {
      for(each neighbor nr,nc) {
        if(!board[nr][nc].revealed) stack.push({r:nr,c:nc});
      }
    }
  }
}
```

## First-click safe generation

- Option A (recommended): **defer mine placement until after first click**; generate mines excluding first click and its neighbors to guarantee open area.
- Option B: post-generate & relocate if mine on first click (more complex).

# 10 — Small checklist for recruiter impact (what to highlight)

- README: short “TL;DR” + architecture diagram + state machine image + trade-offs.
- Demo: Add `?replay=true` or `share` for quick recruiter tryout.
- Code: small folder structure, clean components, tests, typed domain models — recruiters notice this.
- Blog post / case study: 1 page “What I learned building Minesweeper” (hit on algorithms, perf, accessibility, testing) — huge plus.
