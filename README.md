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

## 🤖 AI Agent

> Đây là project thử nghiệm dùng AI Agent.

### 📚 Course

- [agentic_ai_crash_course](https://github.com/aishwaryanr/awesome-generative-ai-guide/tree/main/free_courses/agentic_ai_crash_course)

### ⚙️ `[Experimenter]`

> Những kỹ năng "Experimenter" cần có trong thời đại AI.

- **1️⃣ Prompting & AI-assisted development**

  > Học cách biến ý tưởng → mô tả kỹ → ra code
  - _<u>Keywords</u>:_
    - `Prompt Engineering for Coding`
      > Nghệ thuật viết câu lệnh (prompt) cho AI sao cho AI <u>hiểu đúng yêu cầu kỹ thuật</u> và <u>sinh ra code phù hợp</u> — tránh mơ hồ, tránh thiếu case, nêu rõ constraints & context.
    - `Spec → Code Pipeline`
      > Quy trình không viết code ngay, mà <u>mô tả nhu cầu dưới dạng specification</u> rõ ràng (use-case, input/output, flow, constraints), rồi dùng AI chuyển bản mô tả đó thành code nền tảng.
    - `AI Code Review`
      > Dùng AI để <u>rà soát code</u>: tìm bug, smell, security issue, performance issue — đồng thời AI đề xuất refactor hoặc giải pháp thay thế.
    - `Architecting with AI Agents`
      > <u>Thiết kế kiến trúc hệ thống</u> (module, service boundary, data flow) <u>thông qua đối thoại với AI</u> — AI đóng vai “kiến trúc sư phụ trợ” giúp phân tích trade-off và đề xuất cấu trúc.
    - `AI-Driven Prototyping`
      > Dùng AI để <u>tạo ra bản prototype nhanh</u> (UI, API mock, skeleton code, DB schema) trước khi đầu tư công sức xây bản final — nhằm test idea / validate hướng đi sớm.

- **2️⃣ Solution thinking thay cho pure coding**

  > Học cách xác định nên làm gì, làm đến đâu là đủ, tại sao người dùng cần
  - _<u>Keywords</u>:_
    - `Product Discovery`
      > Quá trình tìm hiểu và xác định xem <u>có vấn đề thật sự cần giải quyết hay không</u>, ai gặp vấn đề đó, họ giải quyết bằng cách gì hiện tại, và liệu có cơ hội tạo giá trị mới.
    - `Problem Framing`
      > Kỹ năng diễn đạt vấn đề đúng bản chất, không nhảy vội vào giải pháp — biến thứ mơ hồ (“hệ thống đang chậm”) thành câu hỏi rõ ràng có thể giải (“trang X mất 4.2s TTFB khi user > 5k concurrent”).
    - `MVP Thinking`
      > Tư duy xây dựng <u>phiên bản nhỏ nhất có giá trị dùng được</u> để kiểm chứng nhu cầu và học nhanh từ người dùng, thay vì cố làm sản phẩm hoàn thiện ngay từ đầu.
    - `Value Hypothesis`
      > Giả định rõ ràng về <u>điều gì sẽ tạo ra giá trị cho người dùng</u>: “Nếu chúng ta làm X, người dùng Y sẽ Z vì lý do W” — để từ đó có tiêu chí kiểm chứng.
    - `Customer Interview Basics`
      > Kỹ năng nói chuyện với người dùng một cách không dẫn dắt, không ép họ nói điều mình muốn nghe — tập trung hỏi về hành vi, bối cảnh thật, không hỏi ý kiến kiểu “Bạn có nghĩ đây là ý tưởng hay?”.

- **3️⃣ Technical abstraction over implementation**

  > Không sa đà vào code-bằng-tay, mà học cách “describe systems” để AI hiện thực
  - _<u>Keywords</u>:_
    - `System Design Prompt`
      > <u>Viết prompt ở cấp độ kiến trúc</u> (requirements, constraints, scale, patterns, SLA…) để AI đề xuất cách bố trí hệ thống — thay vì hỏi “code thế nào?” thì hỏi “nên thiết kế hệ thống ra sao?”.
    - `High-Level Architecture Spec`
      > Một bản <u>mô tả tổng thể về cấu trúc hệ thống</u>: các thành phần, cách chúng giao tiếp, dữ liệu đi qua đâu, giới hạn nào cần tuân theo — không đi xuống mức code implementation.
    - `Sequence Diagrams`
      > Biểu đồ <u>mô tả trình tự tương tác giữa các thành phần theo thời gian</u> (user → API → DB → service khác…) để làm rõ logic thực thi từ đầu tới cuối.
    - `Design Doc Writing`
      > Kỹ năng <u>viết tài liệu thiết kế</u> (Design Doc) để giải thích <u>tại sao thiết kế này</u>, mô tả phương án, phân tích trade-offs, rủi ro, và tiêu chí “thế nào là done” — trước khi code bắt đầu.
    - `Trade-Off Analysis`
      > Khả năng so sánh lựa chọn A/B/C và nêu rõ được: ưu — nhược — chi phí — rủi ro của mỗi lựa chọn, từ đó chọn giải pháp “phù hợp” nhất, không phải “hoàn hảo” nhất.

- **4️⃣ Building with AI tools & new workflows**

  > Thực hành workflow mới thay vì đọc sách
  - _<u>Keywords</u>:_
    - `AI-first Development Workflow`
      > Cách làm việc mà AI được đặt <u>ở bước đầu và xuyên suốt pipeline</u> (spec → generate → review → refactor → test), chứ không phải chỉ “lâu lâu gọi AI hỗ trợ”.
    - `Claude Code / Cursor / Copilot Full-Project`
      > Khai thác các IDE/assistant AI (như Claude Code, Cursor, Copilot) không chỉ để sinh đoạn code, mà để <u>dẫn dắt cả project</u>: scaffold repo, kiến trúc, refactor, test, doc.
    - `AI-Refactor Pipeline`
      > Quy trình sử dụng AI để: <u>đọc hiểu codebase hiện có</u> → đề xuất cải tiến cấu trúc → thực hiện refactor an toàn → đảm bảo không phá behavior ban đầu.
    - `AI Test Generation`
      > Dùng AI <u>tạo test case/unit/integration từ spec hoặc từ code sẵn</u>, nhằm tăng độ phủ test nhanh mà không viết thủ công từng case.

- **5️⃣ Product & value literacy** ⚠️ _(thứ AI không làm thay được)_
  > Đọc — phân tích — hiểu cách sản phẩm sống được trên thị trường
  - _<u>Keywords</u>:_
    - `product-market fit`
      > Mức độ mà sản phẩm <u>giải đúng vấn đề cho đúng nhóm người dùng</u> đến mức họ tự nguyện quay lại sử dụng và giới thiệu — không phải nhờ marketing ép.
    - `go-to-market for dev tools`
      > Hiểu cách một sản phẩm dành cho developer (tool, SDK, SaaS, platform…) được đưa ra thị trường: kênh phân phối, pricing, trial, docs, community, onboarding.
    - `activation & retention metrics`
      > Hai nhóm chỉ số sống còn:
      >
      > - **Activation**: người dùng mới vào có “chạm được” tới giá trị cốt lõi không?
      > - **Retention**: họ có quay lại sử dụng sau ngày 1/7/30 hay không — nếu không, nghĩa là không có value thật.
    - `job-to-be-done`
      > Khung tư duy xem sản phẩm từ góc “người dùng thuê sản phẩm để hoàn thành một công việc nào đó” — thay vì nhìn từ góc kỹ thuật hay chức năng.

### Cách dùng **1️⃣ Prompting & AI-assisted development**

---

> 📌 `Prompt Engineering for Coding`
>
> Cách viết _"câu lệnh" (prompt)_ đúng? 👉🏻 AI hiểu _(spec)_ đúng 👉🏻 AI sinh code phù hợp.

- **4 nguyên tắc khi Prompt cho Coding:**
  - Rule 1️⃣ - Nói rõ mục tiêu cuối cùng `(Goal first)`
    - ❌ Không hỏi “làm sao”
    - ✅ Hãy nói “muốn kết quả gì”
  - Rule 2️⃣ - Đưa ràng buộc & bối cảnh `(Constraints & Context)`
    - ⚠️ AI sinh code sai phần lớn vì thiếu constraint.
  - Rule 3️⃣ - Định nghĩa `input/output` & `success criteria`
    - 💎 Đây là “điểm neo” để AI không tự suy diễn.
  - Rule 4️⃣ - Yêu cầu `format output` rõ ràng
    - ⚠️ Nếu không nói, AI hay viết lẫn mô tả + code lộn xộn.

- **Prompt Template:**

  ```
  You are an expert { role } using { tech-stack }.
  I need you to generate production-grade code for the following specification.

  GOAL:
  { mô tả mục tiêu cần đạt được }

  CONTEXT / CONSTRAINTS:
  - Stack: { các công nghệ dùng? }
  - Standards: { các tiêu chuẩn dùng? }
  - Rules: { các quy tắc phải tuân theo? 👉🏻 no any, no comments, no console.log, error must be typed... }

  INPUT / OUTPUT:
  - Input: { dữ liệu đầu vào gồm những gì? }
  - Output (success): { nếu thành công, dữ liệu đầu ra sẽ là gì? }
  - Output (failure): { nếu thất bại, dữ liệu đầu ra sẽ là gì? }

  REQUIREMENTS:
  - Must handle { những việc phải làm? }
  - Must not use { những việc không được làm? }
  - Must be ready to paste & run

  OUTPUT FORMAT:
  { định dạng chuẩn dữ liệu đầu ra? 👉🏻 Return only code, no explanations... }
  ```

---

> 📌 `Spec → Code Pipeline`
>
> Cách mô tả nhu cầu dưới dạng _"đặc điểm kỹ thuật" (specification)_?

- **Tách "nhu cầu" thành 5 khối bắt buộc:**

  | Khối                     | Trả lời câu hỏi gì?             |
  | ------------------------ | ------------------------------- |
  | **Goal**                 | Ta đang giải quyết việc gì?     |
  | **Context / Constraint** | Trong môi trường/giới hạn nào?  |
  | **Contract (I/O)**       | Input/Output chuẩn là gì?       |
  | **Rules / Logic**        | Các điều kiện áp dụng bắt buộc? |
  | **Acceptance Criteria**  | Khi nào coi là làm đúng?        |

- **Format SPEC theo Template chuẩn:**

  ```
  SPEC: ...

  1) GOAL
  - Implement ...

  2) CONTEXT / CONSTRAINTS
  - Environment: ...
  - Libraries: ...
  - Architecture: ...

  3) CONTRACT (INPUT / OUTPUT)
  - Input: ...
  - Output on success: ...
  - Output on failure: ...

  4) LOGIC / RULES
  - ...

  5) ACCEPTANCE CRITERIA
  - ...
  ```

- **AI Generate Code:**

  ```
  Lúc này prompt kiểu:

    “Dựa trên SPEC sau, sinh code hoàn chỉnh…”,
    “Không thêm mô tả văn bản, chỉ trả về code…”
  ```

---

> 📌 `AI Code Review`
>
> Cách dùng AI để _"rà soát" (review)_ code?

- **Cung cấp Context cho việc Review:**
  - ⚠️ AI không thể review tốt nếu không biết <u>mục đích file</u> đó dùng để làm gì, constraint gì.

  ```
  “Đây là ---. Nó phải ---, không được --- và tuân theo ---. Review giúp đoạn code này theo tiêu chí đó.”
  ```

- **Nêu rõ tiêu chí Review:**
  - 🔑 Một số <u>tiêu chí</u> thường dùng:

    ```
    👉🏻 Performance
    👉🏻 Security
    👉🏻 Clean architecture / Separation of Concerns
    👉🏻 Code smell / Anti-Pattern
    👉🏻 Reliability / Error Handling
    👉🏻 Scalability
    👉🏻 Concurrency Safety
    👉🏻 Idiomatic style (chuẩn theo best-practice framework)
    ```

- **Prompt Template:**

  ```
  You are an expert in {tech-stack}.
  Perform a code review as {role}.

  CONTEXT:
  This code implements {mô tả mục tiêu file/function}.

  REVIEW CRITERIA:
  - correctness
  - security & edge cases
  - performance
  - architecture & separation of concerns
  - readability & maintainability
  - potential bugs / code smells

  REVIEW STYLE:
  - Concise but specific
  - Include concrete fixes or rewrites when appropriate
  - Do not praise; focus on issues and actionable improvements

  Here is the code:

  (paste code here)

  Return findings in sections: [Findings] [Suggested Fixes] [If rewriting: safer rewrite snippet].
  ```

- _⚠️ Sau khi nhận review — dùng vòng lặp “Fix → Re-Review:”_
  - Sau khi AI chỉ ra lỗi, bạn có thể tiếp tục theo một trong ba cách sau.
  - Cách 1:
    ```
    Rewrite the code applying all the suggested fixes.
    Return only the final improved code.
    No explanations.
    ```
  - Cách 2:
    ```
    Show me only the part of code that must be changed, not the full file.
    ```
  - Cách 3:
    ```
    Explain the reasoning behind Fix #{...} in more depth.
    ```

---

> 📌 `Architecting with AI Agents`
>
> Cách đối thoại với AI để thiết kế _"kiến trúc" (architecting)_ hệ thống?

- **Đặt đúng “frame” trước khi hỏi AI:**
  - AI cần biết mình đang kiến trúc cái gì ở cấp nào.
  - Việc đặt role giúp AI không nhảy vào coding sớm.

  ```
  You are my System Architect.
  I need help thinking at the level of system design, not implementation.
  Ask clarifying questions before proposing an architecture.
  ```

- **Đưa input ở dạng “constraint-based spec”, không phải kể lể:**
  - Một spec kiến trúc nên nói bằng constraint — những điều bắt buộc hệ thống phải thỏa.
  - Không mô tả GUI, không kể workflow chi tiết — chỉ rào chắn.

  ```
  Goal: build...

  Constraints:
  - {danh sách các ràng buộc}
  ```

- **Yêu cầu AI trả về artefacts kiến trúc chuẩn:**
  - Yêu cầu theo format rõ.
  - Điều này vừa ép AI trả lời có kỷ luật, vừa lộ “lỗ hổng” để refine.

  ```
  Return in this structure:
  1) Key decisions & rationale
  2) High-level architecture diagram in text
  3) Data model (only core tables/entities)
  4) Risk analysis (scaling, cost, failure)
  5) Questions you still need to ask me
  ```

- **Vòng lặp refine kiến trúc bằng thảo luận có mục tiêu:**
  - Khi feedback không nói kiểu “nghe ổn” mà cụ thể.
  - Yêu cầu “conservative adjustments” giữ nhịp iterative design.

  ```
  Refine the design given this new change:
  - we need multi-tenant isolation per customer (not per user)
  - blog posts must support version history
  - reduce vendor-lock-in risk
  Make conservative adjustments, not a full redesign.
  ```

- **Kết thúc bằng “architecture freeze” dùng được cho team:**
  - Khi đã hợp lý ➡️ Frozen deliverables = đồ nghề dev team xài được ngay.

  ```
  Freeze the current architecture and produce:
  - final architecture summary (executive style)
  - sequence diagram for create & read flow
  - infra-as-text (Terraform-like pseudo)
  - API contracts (only at boundary level)
  ```

---

> 📌 `AI-Driven Prototyping`
>
> Cách dùng AI tạo _"nguyên mẫu" (prototype)_ nhanh?

- _⚠️ Thay đổi mindset 🧠: từ “hoàn chỉnh” → “đủ để test”_
  - Prototype không phải MVP, không phải sản phẩm:
    - chấp nhận code xấu
    - chấp nhận hardcode
    - chấp nhận fake backend / mock API
    - chấp nhận no security/no scaling
  - Chỉ để validate: có ai dùng / có logic chạy được / UX có hợp?

- **Cách nói chuyện với AI để ra prototype đúng hướng**
  - AI sẽ định hướng “tối thiểu có giá trị”.

  ```
  You are my prototyping engineer.
  Goal: I want a functional prototype, not production code.

  Context:
  - Platform: ...
  - Scope: only...
  - Speed > quality
  - You may mock data/fake API if needed

  Return:
  1) What minimal pieces we should build first to make it “feel real”
  2) A step-by-step build plan
  3) Skeleton code to start the first screen
  ```

- **Yêu cầu AI “build in loops”, không build một lần**
  - Mỗi vòng đều chạy được → sửa được → tránh đổ thừa.

  ```
  Step 1: ...
  Step n: ...
  ```

- **Khi yêu cầu AI generate code — nói rõ style & tolerance**
  - Rõ ranh giới → AI không “đi quá đà”.

  ```
  Code style constraints:
  - ...
  ```

- **Chốt prototype: yêu cầu “demo checklist” cuối cùng**
  - Checklist này giúp prototype không bị drift thành “production xấu”.

  ```
  Before we freeze the prototype:
  List what is currently:
  - mocked
  - faked
  - hardcoded
  - missing security
  - not scalable

  And give me the top 5 things to NOT do if I continue it to MVP.
  ```

### Cách dùng **3️⃣ Technical abstraction over implementation**

---

> 📌 `System Design Prompt`
>
> Cách viết prompt ở _"cấp độ kiến trúc"_? 👉🏻 để AI đề xuất cách bố trí hệ thống.

- ?!

---

> 📌 `High-Level Architecture Spec`
>
> Cách mô tả tổng thể cấu trúc hệ thống?

- ?!

---

> 📌 `Sequence Diagrams`
>
> Cách mô tả trình tự tương tác giữa các thành phần theo thời gian?

- ?!

### Cách dùng **4️⃣ Building with AI tools & new workflows**

---

> 📌 `AI-Refactor Pipeline`
>
> Cách để AI đọc hiểu codebase hiện có? 👉🏻 để AI đề xuất _"cải tiến cấu trúc" (refactor)_ an toàn, đảm bảo không phá behavior ban đầu.

- ?!

---

> 📌 `AI Test Generation`
>
> Cách dùng AI tạo _(test case/unit/integration)_ từ _(spec)_ hoặc từ code sẵn?

- ?!

### 🏆 Tổng hợp:

```
Pipeline (spec → generate → review → refactor → test)
```
