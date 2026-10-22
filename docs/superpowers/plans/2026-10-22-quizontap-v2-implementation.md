# QuizOnTap V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hoàn chỉnh ứng dụng trắc nghiệm Single Page Application (SPA) *local-first* QuizOnTap V2 với phong cách Focused Learning Studio, hỗ trợ ngân hàng câu hỏi lớn qua IndexedDB (Dexie), bóc tách tài liệu thông minh 179 câu (6 chương, 104 có đáp án, 75 thiếu đáp án), 4 chế độ làm bài (Luyện tập, Thi thử có timer/ma trận, Ôn câu sai, Flashcard 3D) và hệ thống gamification âm thanh offline.

**Architecture:** Kiến trúc phân lớp nghiêm ngặt chia thành 8 role (A0–A7) thực thi qua 5 đợt (Waves 0–4). Tầng `src/domain/` hoàn toàn là Pure TypeScript độc lập; tầng `src/db/` phụ trách IndexedDB; tầng `src/import/` là State Machine Parser; tầng `src/design/` cung cấp Design System chuẩn WCAG 2.2 AA; tầng `src/features/` lắp ráp trải nghiệm người dùng; kiểm thử toàn diện với Vitest và Playwright.

**Tech Stack:** React 18+, Vite, TypeScript (strict), Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Dexie (IndexedDB), Canvas-Confetti, Web Audio API, Vitest, Playwright.

**Spec:** [docs/superpowers/specs/2026-10-21-quiz-website-design.md](file:///c:/Users/ASUS/Desktop/QuizOnTap/docs/superpowers/specs/2026-10-21-quiz-website-design.md) & [QuizOnTap_MasterPlan_V2_ProUIUX_MultiAgent.md](file:///c:/Users/ASUS/Desktop/QuizOnTap/QuizOnTap_MasterPlan_V2_ProUIUX_MultiAgent.md)

## Global Constraints

- **Language & Platform:** Node.js 18+, Vite SPA, Windows PowerShell compatible, Tiếng Việt là ngôn ngữ hiển thị mặc định.
- **Local-first & Privacy:** 100% dữ liệu lưu tại trình duyệt (IndexedDB), không cần server/backend, không gửi dữ liệu ra bên ngoài.
- **Data Integrity:** Không tự ý bịa đáp án cho 75 câu thiếu key trong fixture; hỗ trợ đầy đủ `answerStatus: 'missing' | 'suggested' | 'verified'`.
- **Scoring Invariant:** $\text{scoredCount} = \text{correct} + \text{incorrect} + \text{unanswered}$; không thưởng điểm khi bỏ trống; phân tách riêng `accuracyAmongAnswered` và `percent`.
- **Pure Domain Boundary:** Tuyệt đối không import React, Dexie, window, hay DOM trong `src/domain/`.
- **Accessibility & Motion:** Tuân thủ WCAG 2.2 AA, hỗ trợ bàn phím đầy đủ, tôn trọng `prefers-reduced-motion` và có tùy chọn Mute âm thanh.

---

## Danh Sách Tasks Chi Tiết

### Wave 0: Khởi Tạo Dự Án, Đóng Băng Hợp Đồng & Fixtures (Lead A0)

---

### Task 1: Scaffolding Vite + React + TypeScript + Tailwind CSS v4 + Test Suite

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `vitest.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Test: `src/test/smoke.test.ts`

**Interfaces:**
- Produces: Môi trường chạy Vite dev server, TypeScript compile strict, Vitest runner với `npm run test:unit`, `npm run typecheck`, `npm run build`.

- [ ] **Step 1: Write the failing smoke test**

```typescript
// src/test/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Environment Smoke Test', () => {
  it('should verify vitest is operational', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (environment not yet created)**

Run: `npm run test:unit`  
Expected: FAIL (command or module not found)

- [ ] **Step 3: Setup package.json, configs and dependencies**

Cài đặt các dependencies chính: `react`, `react-dom`, `lucide-react`, `dexie`, `dexie-react-hooks`, `clsx`, `tailwind-merge`, `canvas-confetti`.  
DevDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit`  
Expected: PASS

- [ ] **Step 5: Verify build & commit**

Run: `npm run typecheck && npm run build`  
Expected: Build thành công tạo thư mục `dist/`  
Commit: `git add . && git commit -m "chore: scaffold project with vite, ts strict, tailwind and vitest"`

---

### Task 2: Core Data Contracts, Zod Schemas & 179-Question Fixture

**Files:**
- Create: `src/domain/contracts.ts`
- Create: `src/domain/schemas.ts`
- Create: `src/test/fixtures/real-179-questions.md`
- Test: `src/domain/__tests__/contracts.test.ts`

**Interfaces:**
- Produces: `Option`, `Question`, `QuizSet`, `QuizSession`, `ExamResult`, `ParseIssue`, `QuestionDraft`, `ParseResult` và các hàm validate Zod.

- [ ] **Step 1: Write the failing test for contracts validation**

```typescript
// src/domain/__tests__/contracts.test.ts
import { describe, it, expect } from 'vitest';
import { validateQuestion } from '../schemas';
import type { Question } from '../contracts';

describe('Question Contract Invariants', () => {
  it('should fail when a verified question has null correctOptionIds', () => {
    const invalidQuestion: Question = {
      id: 'q-1',
      setId: 'set-1',
      kind: 'single',
      text: 'Thị trường cạnh tranh hoàn hảo là gì?',
      options: [
        { id: 'opt-1', text: 'Nhiều người mua và người bán' },
        { id: 'opt-2', text: 'Chỉ có một người bán duy nhất' }
      ],
      correctOptionIds: null,
      answerStatus: 'verified', // Vi phạm: verified không được có correctOptionIds null
      answerOrigin: 'source',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => validateQuestion(invalidQuestion)).toThrow();
  });

  it('should pass when question is missing key and correctOptionIds is null', () => {
    const missingKeyQuestion: Question = {
      id: 'q-2',
      setId: 'set-1',
      kind: 'single',
      text: 'Quy luật cung cầu thể hiện điều gì?',
      options: [
        { id: 'opt-1', text: 'Giá tăng khi cầu vượt cung' },
        { id: 'opt-2', text: 'Giá giảm khi cầu vượt cung' }
      ],
      correctOptionIds: null,
      answerStatus: 'missing',
      answerOrigin: null,
      tags: ['Chương 1'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => validateQuestion(missingKeyQuestion)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/__tests__/contracts.test.ts`  
Expected: FAIL (`validateQuestion` not defined)

- [ ] **Step 3: Implement contracts.ts, schemas.ts and setup real-179-questions.md fixture**

Tạo đúng các interfaces từ Architectural Spec V2 và các hàm validate logic bất biến. Nạp file fixture 179 câu thực tế chứa 6 chương (Kinh tế học & Môi trường).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/__tests__/contracts.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/domain/ src/test/fixtures/ && git commit -m "feat(domain): define core contracts, zod schemas and 179 questions fixture"`

---

### Task 3: App Shell, Router Configuration & Error Boundary (Lead A0)

**Files:**
- Create: `src/app/routes.ts`
- Create: `src/app/AppShell.tsx`
- Create: `src/app/ErrorBoundary.tsx`
- Modify: `src/App.tsx`
- Test: `src/app/__tests__/AppShell.test.tsx`

**Interfaces:**
- Consumes: Navigation state, React components.
- Produces: Khung điều hướng SPA (Header, Sidebar/BottomNav, Outlet, Theme provider, Error fallback).

- [ ] **Step 1: Write the failing test for AppShell navigation**

```typescript
// src/app/__tests__/AppShell.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from '../AppShell';

describe('AppShell Component', () => {
  it('renders application header and main navigation items', () => {
    render(<AppShell currentPath="/" onNavigate={() => {}} children={<div data-testid="page-content">Home</div>} />);
    expect(screen.getByText(/QuizOnTap/i)).toBeDefined();
    expect(screen.getByTestId('page-content')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/__tests__/AppShell.test.tsx`  
Expected: FAIL (`AppShell` not defined)

- [ ] **Step 3: Implement AppShell and ErrorBoundary**

Xây dựng AppShell thanh lịch, có nút chuyển theme Sáng/Tối, nút bật/tắt âm thanh, các mục menu: Tổng quan (Dashboard), Thư viện (Library), Nhập đề (Import Wizard), Ôn câu sai (Review), Thống kê (Insights).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/__tests__/AppShell.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/app/ src/App.tsx && git commit -m "feat(app): implement app shell layout, router structure and error boundary"`

---

### Wave 1: Xây Dựng Các Module Nền Tảng Độc Lập

---

### Task 4: Design Tokens & Base UI Primitives (Agent A1)

**Files:**
- Create: `src/design/tokens.css`
- Create: `src/design/components/Button.tsx`
- Create: `src/design/components/Card.tsx`
- Create: `src/design/components/Badge.tsx`
- Create: `src/design/components/Modal.tsx`
- Create: `src/design/components/Toast.tsx`
- Create: `src/design/components/Skeleton.tsx`
- Test: `src/design/__tests__/components.test.tsx`

**Interfaces:**
- Produces: Bộ component giao diện tái sử dụng chuẩn hóa (Button các biến thể `primary`, `secondary`, `outline`, `ghost`, `danger`; Card; Badge trạng thái; Modal dialog accessibility; Toast alert).

- [ ] **Step 1: Write failing tests for Button and Badge variants**

```typescript
// src/design/__tests__/components.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

describe('Design UI Primitives', () => {
  it('renders button and handles click event', () => {
    const handleClick = vi.fn();
    render(<Button variant="primary" onClick={handleClick}>Làm bài ngay</Button>);
    const btn = screen.getByRole('button', { name: /Làm bài ngay/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders correct badge status colors', () => {
    render(<Badge variant="verified">Đã có đáp án</Badge>);
    expect(screen.getByText('Đã có đáp án')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design/__tests__/components.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement design tokens and UI components**

Cấu hình CSS variables trong `tokens.css`: `--radius-md`, `--study-max: 780px`, màu sắc Tailwind v4 thân thiện mắt, đạt độ tương phản WCAG 2.2 AA.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design/__tests__/components.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/design/ && git commit -m "feat(design): implement design tokens and accessible UI primitives"`

---

### Task 5: Dexie IndexedDB Database & Repositories (Agent A2)

**Files:**
- Create: `src/db/quizDb.ts`
- Create: `src/db/repositories.ts`
- Create: `src/db/migrations.ts`
- Test: `src/db/__tests__/repositories.test.ts`

**Interfaces:**
- Consumes: `QuizSet`, `Question`, `QuizSession`, `ExamResult` từ `src/domain/contracts.ts`.
- Produces: `quizSetRepo`, `questionRepo`, `sessionRepo`, `resultRepo`, transaction batch helpers.

- [ ] **Step 1: Write failing test for questionRepo and batch transactions**

```typescript
// src/db/__tests__/repositories.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../quizDb';
import { quizSetRepo, questionRepo } from '../repositories';

describe('IndexedDB Repositories', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('creates quiz set and atomically imports questions', async () => {
    const set = await quizSetRepo.create({
      title: 'Kinh tế học & Môi trường',
      description: 'Bộ đề 179 câu',
    });
    expect(set.id).toBeDefined();

    await questionRepo.batchCreate([
      {
        id: 'q-1',
        setId: set.id,
        kind: 'single',
        text: 'Kinh tế học nghiên cứu điều gì?',
        options: [{ id: 'opt-a', text: 'Sự khan hiếm nguồn lực' }],
        correctOptionIds: null,
        answerStatus: 'missing',
        answerOrigin: null,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ]);

    const count = await questionRepo.countBySet(set.id);
    expect(count).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/db/__tests__/repositories.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Dexie schema and CRUD Repositories**

Cấu hình schema Dexie version 2:
- `quizSets`: `id, updatedAt`
- `questions`: `id, setId, chapterId, answerStatus, updatedAt, [setId+chapterId]`
- `sessions`: `id, setId, status, startedAt`
- `results`: `sessionId, setId, submittedAt`
Hỗ trợ giao dịch nguyên tử (transaction) để đảm bảo không lưu dở dang khi nạp file.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/db/__tests__/repositories.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/db/ && git commit -m "feat(db): setup dexie indexeddb schemas, migrations and repositories"`

---

### Task 6: Smart State Machine Parser cho Markdown / Text (Agent A3)

**Files:**
- Create: `src/import/types.ts`
- Create: `src/import/markdownParser.ts`
- Create: `src/import/validator.ts`
- Test: `src/import/__tests__/markdownParser.test.ts`

**Interfaces:**
- Consumes: Chuỗi văn bản thô (Markdown / TXT).
- Produces: `parseDocument(rawText: string): ParseResult` chứa `drafts: QuestionDraft[]`, `issues: ParseIssue[]`.

- [ ] **Step 1: Write failing test on 179-question real fixture**

```typescript
// src/import/__tests__/markdownParser.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseDocument } from '../markdownParser';

describe('Smart State Machine Parser', () => {
  it('correctly parses the 179-question real fixture into 6 chapters and expected counts', () => {
    const fixturePath = path.resolve(__dirname, '../../test/fixtures/real-179-questions.md');
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const result = parseDocument(content);

    expect(result.drafts.length).toBe(179);
    
    // Đếm số câu có đáp án và thiếu đáp án
    const verifiedCount = result.drafts.filter(d => d.detectedKeys.length > 0).length;
    const missingCount = result.drafts.filter(d => d.detectedKeys.length === 0).length;

    expect(verifiedCount).toBe(104);
    expect(missingCount).toBe(75);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/import/__tests__/markdownParser.test.ts`  
Expected: FAIL (`parseDocument` not defined)

- [ ] **Step 3: Implement State Machine Parser**

Xây dựng bộ phân tích cú pháp theo máy trạng thái (States: `OUTSIDE`, `QUESTION`, `OPTIONS`, `ANSWER`, `EXPLANATION`):
- Nhận diện tiêu đề câu: `Câu \d+[:.]?` hoặc `\d+[\./\)]`
- Nhận diện phương án: `^[A-Za-z][\.\)]\s+` hoặc `- [A-Za-z]\.`
- Bóc tách đáp án: `Đáp án:?\s*([A-Za-z])`, `Key:?\s*([A-Za-z])`
- Bóc tách lời giải thích: `Giải thích:?\s*(.+)`
- Lưu vết số dòng bắt đầu và kết thúc (`lineStart`, `lineEnd`)
- Báo cảnh báo nếu thiếu phương án hoặc không có đáp án mà không làm rơi rụng câu.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/import/__tests__/markdownParser.test.ts`  
Expected: PASS (179 câu, 104 verified, 75 missing)

- [ ] **Step 5: Commit**

Commit: `git add src/import/ && git commit -m "feat(import): implement robust state-machine parser for markdown and text"`

---

### Task 7: CSV & JSON Import/Export Serializers (Agent A3)

**Files:**
- Create: `src/import/csvParser.ts`
- Create: `src/import/jsonBackup.ts`
- Test: `src/import/__tests__/csvJsonBackup.test.ts`

**Interfaces:**
- Produces: `parseCsv(csvContent: string): ParseResult`, `exportQuizSetToJson(setId: string): Promise<string>`, `importJsonBackup(jsonString: string): Promise<QuizSet>`.

- [ ] **Step 1: Write failing test for CSV parsing and JSON roundtrip**

```typescript
// src/import/__tests__/csvJsonBackup.test.ts
import { describe, it, expect } from 'vitest';
import { parseCsv } from '../csvParser';

describe('CSV and JSON Serializers', () => {
  it('parses structured CSV content correctly', () => {
    const csvData = `Câu hỏi,Lựa chọn A,Lựa chọn B,Lựa chọn C,Lựa chọn D,Đáp án,Giải thích\n"Lạm phát là gì?","Sự tăng giá chung","Sự giảm giá chung","Không đổi","Cả A và B",A,"Định nghĩa chuẩn"`;
    const result = parseCsv(csvData);
    expect(result.drafts.length).toBe(1);
    expect(result.drafts[0].questionText).toContain('Lạm phát là gì?');
    expect(result.drafts[0].detectedKeys).toEqual(['A']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/import/__tests__/csvJsonBackup.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement CSV parser with formula injection protection and JSON backup**

Xử lý an toàn CSV: escape các ký tự nguy hiểm (`=`, `+`, `-`, `@`); hỗ trợ UTF-8 có BOM để mở trên Excel tiếng Việt không lỗi font; xuất/nhập sao lưu JSON định dạng schema v2.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/import/__tests__/csvJsonBackup.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/import/ && git commit -m "feat(import): implement csv parser and json backup roundtrip"`

---

### Task 8: Pure Quiz Engine & Deterministic Scoring Algorithm (Agent A4)

**Files:**
- Create: `src/domain/quizEngine.ts`
- Create: `src/domain/scoring.ts`
- Test: `src/domain/__tests__/quizEngine.test.ts`

**Interfaces:**
- Consumes: `Question[]`, session options (`shuffleQuestions`, `shuffleOptions`, `seed`).
- Produces: `createSession(...)`, `scoreExam(questions: Question[], answers: Record<string, string[]>): ExamResult`.

- [ ] **Step 1: Write failing test for exam scoring and dual shuffle invariants**

```typescript
// src/domain/__tests__/quizEngine.test.ts
import { describe, it, expect } from 'vitest';
import { scoreExam, createSessionSnapshot } from '../quizEngine';
import type { Question } from '../contracts';

describe('Quiz Engine & Scoring Invariants', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      setId: 's1',
      kind: 'single',
      text: 'Q1',
      options: [{ id: 'opt-a', text: 'A' }, { id: 'opt-b', text: 'B' }],
      correctOptionIds: ['opt-a'],
      answerStatus: 'verified',
      answerOrigin: 'source',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'q2',
      setId: 's1',
      kind: 'single',
      text: 'Q2',
      options: [{ id: 'opt-c', text: 'C' }, { id: 'opt-d', text: 'D' }],
      correctOptionIds: ['opt-c'],
      answerStatus: 'verified',
      answerOrigin: 'source',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'q3',
      setId: 's1',
      kind: 'single',
      text: 'Q3 (Missing Key)',
      options: [{ id: 'opt-e', text: 'E' }, { id: 'opt-f', text: 'F' }],
      correctOptionIds: null,
      answerStatus: 'missing',
      answerOrigin: null,
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    }
  ];

  it('scores exam accurately: 1 correct, 1 blank, 1 missing-key unscored -> 50% score', () => {
    // q1 trả lời đúng ('opt-a'), q2 bỏ trống, q3 chọn bừa nhưng không có key
    const answers = {
      q1: ['opt-a'],
      q3: ['opt-e']
    };
    const result = scoreExam(sampleQuestions, answers);

    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(0);
    expect(result.unanswered).toBe(1);
    expect(result.unscored).toBe(1);
    expect(result.scoredCount).toBe(2); // q1 và q2 đủ điều kiện chấm
    expect(result.percent).toBe(50);    // 1 / 2 * 100%
    expect(result.accuracyAmongAnswered).toBe(100); // 1 / (1 + 0)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/__tests__/quizEngine.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement pure quiz engine & scoring math**

Hiện thực hàm `scoreExam` và `createSessionSnapshot` với thuật toán đảo trộn có seed (Pseudo-Random Number Generator) tái lập được kết quả, đảm bảo độc lập hoàn toàn với UI.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/__tests__/quizEngine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/domain/ && git commit -m "feat(domain): implement pure quiz session creation and exam scoring algorithm"`

---

### Wave 2: Lắp Ráp Giao Diện Chức Năng & Trải Nghiệm Học Tập (Agent A5 + A6)

---

### Task 9: Import Wizard 5 Bước Có Live Preview & Sửa Lỗi (Agent A5)

**Files:**
- Create: `src/features/import-wizard/ImportWizard.tsx`
- Create: `src/features/import-wizard/StepUpload.tsx`
- Create: `src/features/import-wizard/StepPreview.tsx`
- Create: `src/features/import-wizard/StepInlineFix.tsx`
- Test: `src/features/import-wizard/__tests__/ImportWizard.test.tsx`

**Interfaces:**
- Consumes: `parseDocument`, `parseCsv`, `quizSetRepo`, `questionRepo`.
- Produces: Luồng wizard 5 bước: Upload (Kéo thả/Dán văn bản) -> Phân tích -> Live Preview lọc theo trạng thái -> Sửa lỗi trực tiếp -> Commit IndexedDB.

- [ ] **Step 1: Write failing test for Import Wizard flow**

```typescript
// src/features/import-wizard/__tests__/ImportWizard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImportWizard } from '../ImportWizard';

describe('Import Wizard Component', () => {
  it('renders upload dropzone and bulk text area tab', () => {
    render(<ImportWizard onCompleted={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Kéo thả file hoặc dán văn bản/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiếp tục/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/import-wizard/__tests__/ImportWizard.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement Import Wizard components**

Xây dựng giao diện với các tab: Dán văn bản, Tải file Markdown, Tải file CSV; Bảng preview tổng kết số câu phát hiện (Hợp lệ / Thiếu đáp án / Lỗi); nút "Bổ sung đáp án nhanh" và "Commit vào thư viện".

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/import-wizard/__tests__/ImportWizard.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/import-wizard/ && git commit -m "feat(features): implement 5-step import wizard with live preview and inline editor"`

---

### Task 10: Quản Lý Bộ Đề (Library) & Soạn Thảo Câu Hỏi (Question Editor) (Agent A5)

**Files:**
- Create: `src/features/library/LibraryView.tsx`
- Create: `src/features/library/QuizSetDetail.tsx`
- Create: `src/features/questions/QuestionEditorModal.tsx`
- Test: `src/features/library/__tests__/LibraryView.test.tsx`

**Interfaces:**
- Consumes: `quizSetRepo`, `questionRepo`.
- Produces: Danh sách bộ đề, xem thống kê theo chương, tạo/sửa/xóa bộ đề, modal thêm và sửa câu hỏi (click 1 chạm đổi đáp án đúng).

- [ ] **Step 1: Write failing test for Library empty state and set card**

```typescript
// src/features/library/__tests__/LibraryView.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LibraryView } from '../LibraryView';

describe('Library View', () => {
  it('displays empty state with CTA when no quiz sets exist', () => {
    render(<LibraryView quizSets={[]} onSelectSet={() => {}} onOpenImport={() => {}} />);
    expect(screen.getByText(/Chưa có bộ đề nào/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Nhập bộ đề ngay/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/library/__tests__/LibraryView.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement LibraryView and QuestionEditorModal**

Thiết kế giao diện card bộ đề: tổng số câu, số câu có đáp án, nút bắt đầu làm bài, menu tùy chọn (Xuất JSON, Xóa có hộp thoại xác nhận an toàn). Editor cho phép sửa nội dung câu hỏi, thêm phương án, chuyển đổi trạng thái đáp án (`missing` / `verified`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/library/__tests__/LibraryView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/library/ src/features/questions/ && git commit -m "feat(features): implement quiz set library and visual question editor"`

---

### Task 11: Chế Độ Luyện Tập (Practice Mode) Phản Hồi Tức Thì (Agent A5)

**Files:**
- Create: `src/features/practice/PracticeView.tsx`
- Create: `src/features/practice/AnswerFeedback.tsx`
- Test: `src/features/practice/__tests__/PracticeView.test.tsx`

**Interfaces:**
- Consumes: `Question[]`, `sessionRepo`, âm thanh Web Audio từ Gamification.
- Produces: Giao diện luyện tập: câu hỏi dạng card lớn, nút lựa chọn A/B/C/D dễ bấm, phản hồi màu sắc đúng/sai ngay lập tức, hiển thị lời giải thích, tùy chọn xáo trộn kép (Dual Shuffle).

- [ ] **Step 1: Write failing test for Practice View answer selection**

```typescript
// src/features/practice/__tests__/PracticeView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PracticeView } from '../PracticeView';

describe('Practice View', () => {
  it('displays options and provides feedback when user selects an option', () => {
    const question = {
      id: 'q1',
      setId: 's1',
      kind: 'single' as const,
      text: 'Quy luật cung cầu là gì?',
      options: [
        { id: 'opt-a', text: 'Giá tăng khi cầu tăng' },
        { id: 'opt-b', text: 'Không liên quan' }
      ],
      correctOptionIds: ['opt-a'],
      answerStatus: 'verified' as const,
      answerOrigin: 'source' as const,
      explanation: 'Đây là nguyên lý cơ bản',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    };

    render(<PracticeView questions={[question]} onFinish={() => {}} />);
    const optionA = screen.getByText('Giá tăng khi cầu tăng');
    fireEvent.click(optionA);

    expect(screen.getByText(/Chính xác!/i)).toBeDefined();
    expect(screen.getByText(/Đây là nguyên lý cơ bản/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/practice/__tests__/PracticeView.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement PracticeView and AnswerFeedback**

Hỗ trợ phím tắt bàn phím (1-4 hoặc A-D, Space để qua câu), thông báo thân thiện đối với câu hỏi chưa có đáp án xác nhận ("Câu hỏi tự ôn tập, không chấm đúng sai").

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/practice/__tests__/PracticeView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/practice/ && git commit -m "feat(features): implement practice drill mode with instant feedback and dual shuffle"`

---

### Task 12: Chế Độ Thi Thử (Exam Mode) Đồng Hồ Deadline & Ma Trận Câu Hỏi (Agent A5)

**Files:**
- Create: `src/features/exam/ExamView.tsx`
- Create: `src/features/exam/ExamTimer.tsx`
- Create: `src/features/exam/QuestionMatrix.tsx`
- Test: `src/features/exam/__tests__/ExamView.test.tsx`

**Interfaces:**
- Consumes: `QuizSession`, `questionRepo`, `sessionRepo`.
- Produces: Màn hình thi thử: thanh timer đếm ngược bám dính (sticky) đổi màu khi sắp hết giờ, ma trận số câu (đã làm, chưa làm, gắn cờ 🚩), tự động lưu sau mỗi lựa chọn, nộp bài tự động khi hết giờ.

- [ ] **Step 1: Write failing test for Exam View flags and matrix navigation**

```typescript
// src/features/exam/__tests__/ExamView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExamView } from '../ExamView';

describe('Exam Mode View', () => {
  it('allows flagging a difficult question and toggles flagged state in matrix', () => {
    const questions = [
      {
        id: 'q1',
        setId: 's1',
        kind: 'single' as const,
        text: 'Câu 1 thi thử',
        options: [{ id: 'opt-1', text: 'A' }, { id: 'opt-2', text: 'B' }],
        correctOptionIds: ['opt-1'],
        answerStatus: 'verified' as const,
        answerOrigin: 'source' as const,
        tags: [],
        createdAt: 0,
        updatedAt: 0,
      }
    ];

    render(<ExamView questions={questions} durationMinutes={15} onSubmit={() => {}} />);
    const flagBtn = screen.getByRole('button', { name: /Gắn cờ/i });
    fireEvent.click(flagBtn);

    expect(screen.getByTestId('matrix-item-0')).toHaveAttribute('data-flagged', 'true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/exam/__tests__/ExamView.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement ExamView, ExamTimer, and QuestionMatrix**

Lưu trữ `deadlineAt` theo epoch ms để khi người dùng F5 hoặc đổi tab đồng hồ vẫn giữ độ chính xác tuyệt đối; hộp thoại xác nhận nộp bài hiển thị rõ số câu đã làm và câu bỏ trống.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/exam/__tests__/ExamView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/exam/ && git commit -m "feat(features): implement exam mode with deadline timer and question matrix"`

---

### Task 13: Màn Hình Kết Quả (Results), Thống Kê & Ôn Lại Câu Sai (Agent A5)

**Files:**
- Create: `src/features/results/ExamResultView.tsx`
- Create: `src/features/results/CategoryBreakdown.tsx`
- Create: `src/features/review/MistakeReviewView.tsx`
- Test: `src/features/results/__tests__/ExamResultView.test.tsx`

**Interfaces:**
- Consumes: `ExamResult`, `Question[]`, `resultRepo`.
- Produces: Màn hình tổng kết điểm số, thống kê theo từng chương, bộ lọc xem lại câu sai, nút "Ôn tập riêng các câu sai này".

- [ ] **Step 1: Write failing test for ExamResultView calculation display**

```typescript
// src/features/results/__tests__/ExamResultView.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExamResultView } from '../ExamResultView';

describe('Exam Result View', () => {
  it('displays accurate score percentage and breakdown', () => {
    const mockResult = {
      sessionId: 'ses-1',
      correct: 18,
      incorrect: 2,
      unanswered: 0,
      unscored: 0,
      scoredCount: 20,
      attemptedScoredCount: 20,
      accuracyAmongAnswered: 90,
      percent: 90,
      chapterStats: {
        'Chương 1': { correct: 10, scored: 10 }
      }
    };

    render(<ExamResultView result={mockResult} questions={[]} onRetry={() => {}} onReviewMistakes={() => {}} />);
    expect(screen.getByText('18/20')).toBeDefined();
    expect(screen.getByText('90%')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/results/__tests__/ExamResultView.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement ExamResultView and MistakeReviewView**

Trang kết quả phân loại rõ ràng các câu trả lời đúng, sai, bỏ qua; trang Mistake Review tự động lọc danh sách câu sai và cho phép bấm "Đã thành thạo" để loại bỏ khỏi danh sách ôn tập.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/results/__tests__/ExamResultView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/results/ src/features/review/ && git commit -m "feat(features): implement exam results breakdown and mistake review view"`

---

### Task 14: Gamification System: Âm Thanh Offline, Streak, XP & Pháo Hoa (Agent A6)

**Files:**
- Create: `src/gamification/audioSynth.ts`
- Create: `src/gamification/streakTracker.ts`
- Create: `src/gamification/xpCalculator.ts`
- Create: `src/gamification/confettiEffect.ts`
- Test: `src/gamification/__tests__/gamification.test.ts`

**Interfaces:**
- Produces: `playTone('correct' | 'wrong' | 'victory')`, `calculateStreak(lastDate: string): { streak: number, updatedDate: string }`, `calculateXp(correctCount: number, combo: number): number`, `triggerConfetti()`.

- [ ] **Step 1: Write failing test for streak calculation and XP combos**

```typescript
// src/gamification/__tests__/gamification.test.ts
import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../streakTracker';
import { calculateXp } from '../xpCalculator';

describe('Gamification Logic', () => {
  it('increments streak when active on consecutive days', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const result = calculateStreak(yesterday, 3);
    expect(result.streak).toBe(4);
    expect(result.updatedDate).toBe(today);
  });

  it('calculates XP bonus based on combo streak', () => {
    const xpBase = calculateXp(1, 0);
    const xpWithCombo = calculateXp(1, 5); // Combo 5x
    expect(xpWithCombo).toBeGreaterThan(xpBase);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/gamification/__tests__/gamification.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Web Audio API synthesizer and gamification logic**

Sử dụng Web Audio API thuần (OscillatorNode, GainNode) tạo âm thanh du dương offline, không cần tải file mp3; pháo hoa Canvas-Confetti với tùy chọn kiểm soát số lượng và tôn trọng `prefers-reduced-motion`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/gamification/__tests__/gamification.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/gamification/ && git commit -m "feat(gamification): implement offline web audio synth, streak tracking and xp calculation"`

---

### Wave 3 & 4: Flashcard 3D, Kiểm Thử Toàn Diện & Đóng Gói Phát Hành

---

### Task 15: Chế Độ Flashcard Lật Thẻ 3D & Tự Đánh Giá (Agent A5)

**Files:**
- Create: `src/features/flashcards/FlashcardView.tsx`
- Create: `src/features/flashcards/FlashcardCard.tsx`
- Test: `src/features/flashcards/__tests__/FlashcardView.test.tsx`

**Interfaces:**
- Consumes: `Question[]`.
- Produces: Giao diện thẻ 3D lật mặt trước (câu hỏi) và mặt sau (đáp án + giải thích), 2 nút đánh giá "Chưa thuộc" và "Đã thuộc".

- [ ] **Step 1: Write failing test for Flashcard flip and rating**

```typescript
// src/features/flashcards/__tests__/FlashcardView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FlashcardView } from '../FlashcardView';

describe('Flashcard 3D View', () => {
  it('flips card upon click to reveal answer and explanation', () => {
    const question = {
      id: 'q1',
      setId: 's1',
      kind: 'single' as const,
      text: 'Thế nào là ô nhiễm môi trường?',
      options: [{ id: 'opt-1', text: 'Biến đổi tính chất môi trường' }],
      correctOptionIds: ['opt-1'],
      answerStatus: 'verified' as const,
      answerOrigin: 'source' as const,
      explanation: 'Theo luật BVMT 2020',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    };

    render(<FlashcardView questions={[question]} onFinish={() => {}} />);
    const card = screen.getByTestId('flashcard-card');
    fireEvent.click(card);

    expect(screen.getByText(/Theo luật BVMT 2020/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/flashcards/__tests__/FlashcardView.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement Flashcard 3D CSS animations and self-rating controls**

Sử dụng CSS `perspective` và `transform: rotateY(180deg)` có hỗ trợ chế độ crossfade khi bật `prefers-reduced-motion`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/flashcards/__tests__/FlashcardView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

Commit: `git add src/features/flashcards/ && git commit -m "feat(features): implement 3d interactive flashcard study mode"`

---

### Task 16: Automated Playwright End-to-End Test Suite (Agent A7)

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/quiz-journey.spec.ts`
- Create: `e2e/import-fixture.spec.ts`

**Interfaces:**
- Produces: Kiểm thử tự động chạy trên trình duyệt thực tế, bao phủ toàn bộ luồng người dùng chính.

- [ ] **Step 1: Write Playwright E2E spec for complete user journey**

Kiểm tra:
1. Mở ứng dụng lần đầu -> Trạng thái Empty State -> Bấm Nhập đề.
2. Dán fixture 179 câu -> Kiểm tra bảng preview hiển thị đúng 104 có đáp án / 75 thiếu đáp án -> Bấm Xác nhận lưu đề.
3. Vào chế độ Luyện tập Chương 4 -> Chọn đáp án -> Nhận phản hồi đúng/sai và lời giải.
4. Bắt đầu bài Thi thử 20 câu -> Chọn 18 câu, bỏ trống 2 câu -> Nộp bài -> Điểm số đạt đúng `18/20 = 90%`.
5. Vào Ôn câu sai -> Đánh dấu thành thạo câu đã ôn.
6. Xuất file backup JSON -> Xóa bộ đề -> Phục hồi từ file backup JSON -> Dữ liệu hoàn toàn nguyên vẹn.

- [ ] **Step 2: Run Playwright test suite**

Run: `npx playwright test`  
Expected: PASS 100% các bài test E2E.

- [ ] **Step 3: Commit**

Commit: `git add playwright.config.ts e2e/ && git commit -m "test(e2e): implement playwright automated end-to-end test suite"`

---

### Task 17: Release Verification, Security Audit & Documentation Wrap-up (Lead A0)

**Files:**
- Modify: `PROJECT_PROGRESS.md`
- Create: `README.md`
- Test: Full release test suite

**Interfaces:**
- Produces: Dự án hoàn thiện sẵn sàng sử dụng cục bộ, vượt qua mọi quality gates.

- [ ] **Step 1: Run comprehensive quality checks**

Run:
```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run build
```
Expected: Tất cả câu lệnh chạy thành công, không có TypeScript error, không có warning bất thường, bundle sản phẩm gọn nhẹ.

- [ ] **Step 2: Update PROJECT_PROGRESS.md to 100% completion**

Cập nhật các Phase trong `PROJECT_PROGRESS.md` sang trạng thái hoàn thành kèm đường dẫn tới các tài liệu tương ứng.

- [ ] **Step 3: Commit and tag release**

Commit: `git add . && git commit -m "chore(release): complete QuizOnTap V2 implementation and verification"`
