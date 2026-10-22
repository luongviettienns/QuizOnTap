# 📊 TIẾN ĐỘ DỰ ÁN: QUIZ ON TAP (WEBSITE ÔN TẬP TRẮC NGHIỆM LOCAL)

> **Mô tả**: Website ôn tập kiến thức trắc nghiệm chạy local, tối ưu trải nghiệm học tập, hỗ trợ nhiều chế độ làm bài, thống kê và quản lý câu hỏi. Triển khai theo mô hình Multi-Agent & Superpowers Engineering.

---

## 🧭 Lộ trình Tổng quan (Phases)

- [x] **Phase 1: Brainstorming & Thiết kế Kiến trúc (Architectural Design)** *(Đã hoàn thành)*
  - [x] Khởi tạo dự án & thiết lập tài liệu theo dõi tiến độ
  - [x] Phân tích yêu cầu và làm rõ tính năng với người dùng (Q&A)
  - [x] Lựa chọn kiến trúc & Tech Stack (Vite + React + TS + Tailwind)
  - [x] Soạn thảo bản đặc tả thiết kế kỹ thuật ([2026-10-21-quiz-website-design.md](file:///c:/Users/ASUS/Desktop/QuizOnTap/docs/superpowers/specs/2026-10-21-quiz-website-design.md))
  - [x] Người dùng nghiệm thu bản thiết kế (Design Review Gate)

- [x] **Phase 2: Lập Kế hoạch Thực thi (Implementation Planning)** *(Đã hoàn thành)*
  - [x] Phân rã công việc thành các sub-tasks độc lập cho Multi-Agent (17 tasks chia theo 5 Waves 0–4)
  - [x] Thiết lập quy chuẩn kiểm thử (TDD / Acceptance Criteria, 179-question fixture)
  - [x] Soạn bản Implementation Plan ([2026-10-22-quizontap-v2-implementation.md](file:///c:/Users/ASUS/Desktop/QuizOnTap/docs/superpowers/plans/2026-10-22-quizontap-v2-implementation.md))
  - [x] Người dùng nghiệm thu kế hoạch thực thi (Plan Review Gate)

- [x] **Phase 3: Triển khai Cốt lõi & Giao diện (Core Development via Multi-Agent)** *(Đã hoàn thành)*
  - [x] Wave 0: Khởi tạo khung dự án, đóng băng Contracts, Router Shell & Test Suite
  - [x] Wave 1: Foundation Modules (Design Tokens & Primitives, Dexie DB, State Machine Parser, Pure Quiz Engine)
  - [x] Wave 2: Feature UI & User Flows (Import Wizard [x], Library [x], Practice Drill [x], Exam Mode [x], Results & Mistake Review [x], Gamification [x])
  - [x] Wave 3: Advanced Modes & Polish (Flashcard 3D [x], Mistake Review [x], Insights, Calm Motion)
  - [x] Module dữ liệu câu hỏi (Question Engine, Parser, Dexie CRUD & Mock Data 179 câu)
  - [x] Module làm bài (Quiz Engine: Luyện tập [x], Bấm giờ [x], Phản hồi đáp án [x], Giải thích [x])
  - [x] Module thống kê & Lịch sử ôn tập (Review, Analytics, Local Storage)
  - [x] Module quản lý & Nhập câu hỏi (Import Wizard 5 bước, CSV/JSON Export, Question Editor)

- [x] **Phase 4: Kiểm thử, Tối ưu & Bàn giao (Testing, QA & Polish)** *(Đã hoàn thành)*
  - [x] Kiểm thử toàn diện luồng người dùng (35/35 Vitest Unit tests & 4/4 Playwright E2E tests đạt 100%)
  - [x] Tối ưu UI/UX, micro-animations, theme Dark/Light, Web Audio synthesizer offline
  - [x] Bàn giao & hướng dẫn nạp dữ liệu câu hỏi ([README.md](file:///c:/Users/ASUS/Desktop/QuizOnTap/README.md))

- [x] **Nâng cấp Dữ liệu Thực tế: Tích hợp Ngân hàng 179 câu "Kinh tế học và Môi trường"** *(Đã hoàn thành)*
  - [x] Nâng cấp Parser regex nhận diện chuẩn 100% định dạng đáp án tài liệu thực tế (`**- Đáp án: A**`, `**→ Đáp án đúng: C**`)
  - [x] Lưu trữ tệp dữ liệu gốc tại `src/data/defaultQuiz.md` và xây dựng module auto-seed `src/data/seedDefaultData.ts`
  - [x] Tự động kích hoạt nạp vào IndexedDB khi người dùng mới mở web, đồng thời hỗ trợ nút nạp 1-click tại Hero Banner, Thư viện và Import Wizard
  - [x] Giữ nguyên trung thực dữ liệu: 104 câu có đáp án (Verified), 75 câu tự luyện (Missing), phân chia chuẩn theo 6 chương
  - [x] Đạt 100% Quality Gates: TypeScript Strict, 35/35 Vitest tests, 4/4 Playwright E2E tests và Vite Production Build.

- [x] **Tích hợp Bản Đáp Án Bổ Sung: `Tai_lieu_on_tap_Kinh_te_hoc_va_Moi_truong_DA_Bo_sung.md`** *(Đã hoàn thành)*
  - [x] Nhận diện và bóc tách tự động: 178/179 câu có đáp án (104 câu gốc `verified` + 74 câu AI bổ sung `suggested` kèm lời giải thích chi tiết; 1 câu Chương 2 Câu 17 đánh dấu `missing` do thiếu hình vẽ).
  - [x] Nâng cấp Parser regex nhận diện lời giải thích đa dạng (`> *Giải thích (AI bổ sung): ...*`, `> **Cần kiểm tra lại câu hỏi:**...`, `**Chưa thể khoanh đáp án...**`).
  - [x] Nâng cấp `seedDefaultData.ts` tự động kiểm tra và nâng cấp dữ liệu hiện hữu trong IndexedDB lên bản 178 câu có đáp án.
  - [x] Hiển thị Badge trực quan: `[Đáp án gốc]` (xanh lục), `[AI gợi ý]` (indigo/tím) và `[Chưa có đáp án]` (vàng hổ phách).
  - [x] Hỗ trợ thi thử và luyện tập toàn diện cả 178 câu có đáp án (câu thiếu hình vẽ giữ `unscored` theo đúng logic đề thi).
  - [x] Đạt 100% Quality Gates: TypeScript Strict, 36/36 Vitest Unit tests, 4/4 Playwright E2E tests, Vite Production Build thành công.
- [x] **Deploy Production lên GitHub Pages & Thiết lập CI/CD** *(Đã hoàn thành)*
  - [x] Tạo GitHub Repository [luongviettienns/QuizOnTap](https://github.com/luongviettienns/QuizOnTap)
  - [x] Cấu hình Vite với `base: './'` hỗ trợ routing linh hoạt trên GitHub Pages và máy chủ tĩnh
  - [x] Thiết lập GitHub Actions workflow tự động build và deploy khi push code lên nhánh `main`
  - [x] Kích hoạt và triển khai thành công lên GitHub Pages tại: **https://luongviettienns.github.io/QuizOnTap/**

- [x] **Tối ưu Hệ Màu Frontend & Sửa lỗi Tailwind v4 (Design Tokens & Color Review)** *(Đã hoàn thành)*
  - [x] Khắc phục lỗi P0: Khai báo `@theme inline` ánh xạ toàn bộ dải màu `primary-*` sang Indigo trong [index.css](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/index.css), sửa triệt để lỗi màu ma trận câu hỏi, thanh tiến độ và các nút chọn.
  - [x] Khắc phục lỗi P0: Thêm `@custom-variant dark (&:where(.dark, .dark *));` giúp tính năng chuyển đổi Light/Dark mode trên giao diện hoạt động 100% chuẩn xác theo class `.dark`.
  - [x] Chuẩn hóa Semantic Badge: Chuyển badge "Chưa có key" từ màu đỏ (warning) sang màu vàng hổ phách (missing), đồng bộ với trạng thái Amber trong toàn bộ ứng dụng.
  - [x] Nâng cấp độ tương phản WCAG 2.2 AA: Thay thế `text-slate-400` ở các nhãn nhỏ, hướng dẫn phím tắt, ghi chú flashcard bằng `text-slate-600 dark:text-slate-400`.
  - [x] Bổ sung đầy đủ CSS Variables màu sắc cốt lõi vào [tokens.css](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/design/tokens.css) và làm dịu gradient Hero Banner Dashboard từ Indigo sang Slate-900.

