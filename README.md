# 💣 Minesweeper

> ?! ... about project

## 📦 Package

### 🚩 `[devDependencies]`

> Cài những gói chỉ cần khi develop.

**1️⃣ Default:**

- **Eslint:**
  - `eslint` 👉🏻 _Linter_ chính, kiểm tra lỗi code
  - `eslint-config-next` 👉🏻 Bộ "rules" _ESLint_ cho _Next.js_ (bao gồm React, accessibility...)

- **Tailwind CSS:**
  - `tailwindcss` 👉🏻 Framework _CSS utility-first_
  - `@tailwindcss/postcss` 👉🏻 Plugin _PostCSS_ để "compile" _Tailwind_ (_Next.js 15+_ dùng cái này thay vì `postcss` + `autoprefixer` riêng)

- **Typescript:**
  - `typescript` 👉🏻 Compiler _TypeScript_
  - `@types/node` 👉🏻 Type definitions cho _Node.js APIs_ (fs, path...)
  - `@types/react` 👉🏻 Type definitions cho _React_
  - `@types/react-dom` 👉🏻 Type definitions cho _ReactDOM_

**2️⃣ Code Formatter:**

- [`prettier`](https://www.npmjs.com/package/prettier)
  - _Format code_ theo "rules" nhất quán (indentation, quotes, semicolons...) ➡️ Hoạt động với JS, TS, CSS, JSON, Markdown...
- [`prettier-plugin-tailwindcss`](https://www.npmjs.com/package/prettier-plugin-tailwindcss/v/0.0.0-insiders.d539a72)
  - Plugin của _Prettier_ cho _Tailwind CSS_ ➡️ Tự động sắp xếp _class names_ theo thứ tự khuyến nghị của _Tailwind_

```json
// .prettierrc

{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- Thêm plugin `prettier-plugin-tailwindcss` vào file cấu hình của _Prettier_.

```json
// .prettierrc

{
  "tailwindStylesheet": "src/app/globals.css"
}
```

- Chỉ định điểm "import" file _CSS_ của _Tailwind_ (bắt buộc phải có khi dùng `V4+`) vào file cấu hình của _Prettier_.

**3️⃣ Testing:**

- [`vitest`](https://www.npmjs.com/package/vitest)
  - _Testing_ framework hiện đại, tương thích _Jest API_
- [`@testing-library/react`](https://www.npmjs.com/package/@testing-library/react)
  - _Utilities_ để test _React components_
- [`@testing-library/jest-dom`](https://www.npmjs.com/package/@testing-library/jest-dom)
  - Custom "matchers" cho _DOM testing_

### 🚩 `[dependencies]`

> Cài những gói cần để app chạy.

**1️⃣ Default:**

- **Next.js:**
  - `next` 👉🏻 Framework _React_ với SSR, routing, API routes, optimization...

- **React:**
  - `react` 👉🏻 Core library của _React_ (components, hooks, JSX...)
  - `react-dom` 👉🏻 Render _React_ vào _DOM_ của browser

**2️⃣ Utility:**

- [`clsx`](https://www.npmjs.com/package/clsx)
  - Xử lý _className động_ trong _React_
- [`tailwind-merge`](https://www.npmjs.com/package/tailwind-merge)
  - Giải quyết vấn đề xung đột _class_ khi dùng _Tailwind CSS_

```ts
// src/lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- **Utility Function** kết hợp sức mạnh của cả `clsx` và `tailwind-merge`.
  - `clsx`: Xử lý conditional classes, merge arrays/objects
  - `twMerge`: Loại bỏ Tailwind classes bị xung đột
  - `cn`: Làm cả 2 việc trên trong 1 function

3️⃣ **Animation:**

- [`framer-motion`](https://www.npmjs.com/package/framer-motion)
  - Thư viện _animation_ cho _React_

4️⃣ **State Management:**

- [`zustand`](https://www.npmjs.com/package/zustand)
  - Thư viện _state management_ nhẹ và đơn giản ➡️ Thay thế `Redux/Context API`
