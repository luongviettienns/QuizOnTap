# 🎯 QuizOnTap V2 — Focused Learning Studio

> **Website Ôn Tập Trắc Nghiệm Thông Minh, Chạy Cục Bộ (Local-First), Tối Ưu Cho Học Tập Tập Trung.**

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-blue.svg)](https://www.typescriptlang.org/)
[![Vite + React](https://img.shields.io/badge/Vite-React_18-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-33_Passed-success.svg)](https://vitest.dev/)
[![E2E](https://img.shields.io/badge/Playwright-3_Passed-success.svg)](https://playwright.dev/)
[![Offline Local-First](https://img.shields.io/badge/Storage-IndexedDB_Dexie-green.svg)](https://dexie.org/)

---

## 🌟 Tổng Quan Dự Án

**QuizOnTap V2** được kiến trúc theo triết lý **Focused Learning Studio**: giao diện tối giản, sang trọng, mang lại cảm giác tĩnh lặng và tập trung cao độ, tôn trọng quyền riêng tư của người học với mô hình **100% Local-First** — mọi dữ liệu câu hỏi, đề thi và lịch sử học tập được lưu trữ an toàn trong IndexedDB của trình duyệt, không gửi bất kỳ dữ liệu nào lên máy chủ bên ngoài.

---

## ⚡ Các Tính Năng Nổi Bật

### 1. 📥 Bộ Bóc Tách & Thuật Toán Phân Tích Thông Minh (Import Wizard 5 Bước)
- Bóc tách tự động tài liệu Word/PDF đã chuyển sang định dạng **Markdown (`.md`)**, **Text (`.txt`)** hoặc **CSV (`.csv`)**.
- Nhận diện chính xác 179 câu hỏi thực tế qua 6 chương (104 câu có đáp án, 75 câu thiếu đáp án) mà không tự ý bịa đáp án.
- Live Preview trực quan phân loại câu hỏi có đáp án (`verified`), câu thiếu đáp án (`missing`), câu có hình vẽ hoặc cảnh báo định dạng.
- Trình sửa trực tiếp tại chỗ (Inline Question Editor) trước khi lưu vào cơ sở dữ liệu.
- Cơ chế chống **CSV Formula Injection** và hỗ trợ chuẩn UTF-8 BOM.

### 2. 📚 Thư Viện Bộ Đề & Quản Lý Câu Hỏi
- Quản lý nhiều môn học, khóa học hoặc đợt thi khác nhau.
- Thêm mới, chỉnh sửa nội dung câu hỏi, danh sách phương án A/B/C/D, đáp án đúng và lời giải thích.
- Xuất dữ liệu linh hoạt: JSON Backup schema v2 (round-trip không mất mát) và xuất CSV ôn tập.

### 3. 🎯 Chế Độ Luyện Tập (Practice Drill Mode)
- Phản hồi đúng/sai tức thì ngay sau khi bấm chọn phương án.
- Hiển thị lời giải thích chi tiết củng cố kiến thức.
- Xáo trộn kép (**Dual Shuffle**): cho phép xáo trộn thứ tự câu hỏi và thứ tự các đáp án ngẫu nhiên bằng thuật toán PRNG để tránh học vẹt vị trí.
- Phím tắt bàn phím: <kbd>1</kbd>-<kbd>4</kbd> hoặc <kbd>A</kbd>-<kbd>D</kbd> để chọn nhanh, <kbd>Space</kbd> để qua câu tiếp theo.

### 4. ⏱️ Chế Độ Thi Thử (Exam Mode)
- Đồng hồ đếm ngược **Deadline-based Countdown Timer** tính theo epoch timestamp, không bị trôi lệch thời gian khi chuyển tab hoặc máy tính vào chế độ sleep.
- Cảnh báo đổi màu: bình thường (xanh/xám) $\rightarrow$ nhắc nhở (< 5 phút, vàng) $\rightarrow$ nguy cấp (< 1 phút, đỏ nhấp nháy).
- **Ma trận câu hỏi (Question Matrix)** trực quan: hiển thị rõ trạng thái đã làm, chưa làm và đánh dấu cờ xem lại (<kbd>F</kbd>).
- Hộp thoại nộp bài hiển thị chi tiết số câu đã làm, chưa làm và tự động nộp bài khi hết giờ.

### 5. 📊 Bảng Điểm & Ôn Lại Câu Trả Lời Sai (Mistake Review)
- Thuật toán tính điểm toán học chuẩn:
  $$\text{scoredCount} = \text{correct} + \text{incorrect} + \text{unanswered}$$
  Tách bạch rõ giữa tỷ lệ đúng trên tổng đề (`percent`) và độ chính xác trong số câu đã làm (`accuracyAmongAnswered`). Các câu thiếu đáp án xác nhận (`unscored`) không bị tính ép làm điểm sai.
- Phân tích biểu đồ tỷ lệ đạt theo từng chương học.
- Màn hình **Ôn câu sai**: so sánh trực quan phương án đúng và phương án người dùng đã chọn, kèm nút *"Đã thành thạo"* để gạch khỏi danh sách ôn tập.

### 6. 🃏 Chế Độ Lật Thẻ Flashcard 3D
- Hiệu ứng lật thẻ 3D mượt mà với CSS `perspective` và `rotateY(180deg)`.
- Tự động nhận diện và tôn trọng cài đặt `prefers-reduced-motion` của hệ thống.
- Chế độ tự đánh giá: *"Chưa thuộc"* và *"Đã thuộc"*, thống kê tỷ lệ ghi nhớ cuối phiên học.

### 7. 🎮 Gamification & Âm Thanh Offline
- **Web Audio API Synthesizer**: tự động tạo hiệu ứng âm thanh du dương (arpeggio, chúc mừng chiến thắng, click) hoàn toàn bằng thuật toán toán học, không cần tải bất kỳ tệp `.mp3` nào từ internet.
- **Streak Tracker**: tính chuỗi ngày học liên tục tự động theo lịch sử ngày học.
- **Combo XP**: tích lũy điểm kinh nghiệm và điểm thưởng khi trả lời đúng liên tiếp.
- **Canvas Confetti**: hiệu ứng pháo hoa chúc mừng khi hoàn thành xuất sắc bài thi.

---

## ⌨️ Bảng Phím Tắt (Keyboard Shortcuts)

| Chế độ | Phím tắt | Hành động |
| :--- | :--- | :--- |
| **Luyện tập** | <kbd>1</kbd> - <kbd>4</kbd> hoặc <kbd>A</kbd> - <kbd>D</kbd> | Chọn phương án tương ứng |
| | <kbd>Space</kbd> hoặc <kbd>Enter</kbd> | Chuyển sang câu hỏi kế tiếp |
| **Thi thử** | <kbd>1</kbd> - <kbd>4</kbd> hoặc <kbd>A</kbd> - <kbd>D</kbd> | Chọn/thay đổi phương án |
| | <kbd>F</kbd> | Bật/tắt gắn cờ câu hỏi hiện tại |
| | <kbd>←</kbd> / <kbd>→</kbd> | Chuyển qua lại giữa các câu hỏi |
| **Flashcard** | <kbd>Space</kbd> | Lật mặt trước / mặt sau của thẻ |
| | <kbd>1</kbd> | Đánh giá "Chưa thuộc" (khi thẻ đã lật) |
| | <kbd>2</kbd> | Đánh giá "Đã thuộc" (khi thẻ đã lật) |
| | <kbd>←</kbd> / <kbd>→</kbd> | Xem thẻ trước / thẻ sau |

---

## 🛠️ Cài Đặt & Chạy Dự Án

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ hoặc 20+
- **Trình duyệt**: Google Chrome, Edge, Firefox hoặc Safari

### Hướng dẫn khởi chạy

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động môi trường phát triển cục bộ
npm run dev
# Ứng dụng sẽ chạy tại: http://localhost:5173
```

### Các lệnh kiểm thử & đóng gói

```bash
# Kiểm tra tĩnh TypeScript (Strict mode, noEmit)
npm run typecheck

# Chạy toàn bộ 33 bài kiểm thử đơn vị (Unit Tests qua Vitest)
npm run test:unit

# Chạy kiểm thử tự động trên trình duyệt thật (E2E qua Playwright)
npm run test:e2e

# Đóng gói sản phẩm cho môi trường production
npm run build

# Xem trước bản đóng gói production
npm run preview
```

---

## 🏗️ Cấu Trúc Mã Nguồn

```text
src/
├── app/                  # App Shell, routing, error boundary, main navigation
├── db/                   # Dexie IndexedDB schemas & repository transactions
│   ├── quizDb.ts         # Dexie v2 database declaration
│   └── repositories.ts   # CRUD repositories for sets, questions, sessions, results
├── design/               # Design tokens & UI primitives
│   ├── tokens.css        # CSS variables & design tokens
│   └── components/       # Button, Card, Badge, Modal, Toast, Skeleton
├── domain/               # Pure business domain contracts & logic (Zero UI/DB dependencies)
│   ├── contracts.ts      # Core TypeScript contracts & interfaces
│   ├── schemas.ts        # Zod validation schemas
│   ├── quizEngine.ts     # PRNG dual shuffle, snapshot generator
│   └── scoring.ts        # Deterministic scoring algorithm
├── features/             # Feature UI components
│   ├── import-wizard/    # 5-step import wizard with live preview & inline fix
│   ├── library/          # Quiz set list & set detail view
│   ├── questions/        # Visual question editor modal
│   ├── practice/         # Practice drill mode with instant feedback
│   ├── exam/             # Exam mode with deadline timer & question matrix
│   ├── results/          # Exam results breakdown & chapter stats
│   ├── review/           # Mistake review with mastery toggles
│   └── flashcards/       # 3D interactive flashcard view
├── gamification/         # Offline Web Audio synth, streak tracking & confetti
├── import/               # Markdown state machine parser, CSV & JSON serializers
└── test/                 # Test setup, mocks and 179-question real fixture
```

---

## 🛡️ Cam Kết Bảo Mật & Dữ Liệu
- **100% Không có Backend**: Không truyền dữ liệu của bạn tới bất kỳ máy chủ nào.
- **Không Telemetry / Tracking**: Không cài đặt Google Analytics hay bất kỳ tracker theo dõi người dùng.
- **Dữ liệu thuộc về bạn**: Dễ dàng xuất và sao lưu toàn bộ ngân hàng câu hỏi thành tệp JSON chỉ với 1 cú click.
