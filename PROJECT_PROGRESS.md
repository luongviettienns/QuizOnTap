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
  - [x] Khắc phục xung đột CI/CD: Chuyển đổi workflow `.github/workflows/deploy.yml` sang action `peaceiris/actions-gh-pages@v4` đồng bộ trực tiếp với nhánh `gh-pages` (tương thích 100% với cài đặt `build_type: legacy` của repo).
  - [x] Bổ sung script `npm run deploy` với package `gh-pages` cho phép deploy thủ công 1-click mọi lúc.
  - [x] Kiểm tra xác thực Live website: GitHub Actions run hoàn thành `success` lúc 09:57 UTC, mã phản hồi `HTTP/1.1 200 OK` tại **https://luongviettienns.github.io/QuizOnTap/**.

- [x] **Tối ưu Hệ Màu Frontend & Sửa lỗi Tailwind v4 (Design Tokens & Color Review)** *(Đã hoàn thành)*
  - [x] Khắc phục lỗi P0: Khai báo `@theme inline` ánh xạ toàn bộ dải màu `primary-*` sang Indigo trong [index.css](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/index.css), sửa triệt để lỗi màu ma trận câu hỏi, thanh tiến độ và các nút chọn.
  - [x] Khắc phục lỗi P0: Thêm `@custom-variant dark (&:where(.dark, .dark *));` giúp tính năng chuyển đổi Light/Dark mode trên giao diện hoạt động 100% chuẩn xác theo class `.dark`.
  - [x] Chuẩn hóa Semantic Badge: Chuyển badge "Chưa có key" từ màu đỏ (warning) sang màu vàng hổ phách (missing), đồng bộ với trạng thái Amber trong toàn bộ ứng dụng.
  - [x] Nâng cấp độ tương phản WCAG 2.2 AA: Thay thế `text-slate-400` ở các nhãn nhỏ, hướng dẫn phím tắt, ghi chú flashcard bằng `text-slate-600 dark:text-slate-400`.
  - [x] Bổ sung đầy đủ CSS Variables màu sắc cốt lõi vào [tokens.css](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/design/tokens.css) và làm dịu gradient Hero Banner Dashboard từ Indigo sang Slate-900.

- [x] **Hệ Thống Âm Thanh Toàn Diện & 4 Đáp Án 4 Màu Đặc Trưng (Sound Synthesizer & 4 Signature Colors)** *(Đã hoàn thành)*
  - [x] Thiết kế hệ màu 4 phương án chuẩn thương hiệu trong [optionColors.ts](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/design/optionColors.ts): A (Rose), B (Sky), C (Amber), D (Emerald) kèm trạng thái idle, hover và selected, fallback Indigo cho câu hỏi > 4 đáp án.
  - [x] Áp dụng 4 màu trực quan vào màn hình Luyện tập ([PracticeView.tsx](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/features/practice/PracticeView.tsx)), Thi thử ([ExamView.tsx](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/features/exam/ExamView.tsx)), Ôn câu sai ([MistakeReviewView.tsx](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/features/review/MistakeReviewView.tsx)) và Chi tiết đề thi ([QuizSetDetail.tsx](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/features/library/QuizSetDetail.tsx)).
  - [x] Nâng cấp Web Audio API Synthesizer offline trong [audioSynth.ts](file:///c:/Users/ASUS/Desktop/QuizOnTap/src/gamification/audioSynth.ts) với đầy đủ 7 hiệu ứng âm thanh tự nhiên: `correct` (hợp âm vui tươi E5-A5), `wrong` (boop trầm nhẹ Eb3-D3), `victory` (fanfare chiến thắng C5-E5-G5-C6), `complete` (triad thỏa mãn C5-F5-A5), `flip` (whoosh lật thẻ 3D), `alert` (ping cảnh báo 880Hz khi còn ít thời gian thi), `click` (click tương tác crisp 800Hz).
  - [x] Tích hợp phát âm thanh tương tác tại: Practice (chọn đúng/sai/chuyển câu/kết thúc), Exam (chọn đáp án/gắn cờ/chuyển câu/nộp bài/đếm ngược 60s), Flashcard (lật thẻ/thuộc/chưa thuộc/hoàn thành bộ thẻ).
  - [x] Tự động đồng bộ với nút Mute âm thanh trên Sidebar và lưu trữ trong `localStorage`.
  - [x] Đạt 100% Quality Gates: 41/41 Vitest Unit Tests pass, 4/4 Playwright E2E Tests pass, Production Build thành công.
- [x] **Phase 5: Nâng Cấp Kiến Trúc Focused Studio V3 — Chuyên Sâu 178 Câu "Kinh Tế Học & Môi Trường"** *(Đã hoàn thành)*
  - [x] **Workstream A — Chuẩn hóa Bộ đề Canonical 178 câu (P0)**:
    - Loại bỏ triệt để câu lỗi Chương 2 Câu 17 (`q_set_kinh_te_va_moi_truong_27` - thiếu hình vẽ và key) khỏi runtime bundle chính thức.
    - Giữ nguyên vẹn mã ID gốc của 178 câu còn lại (`q_set_kinh_te_va_moi_truong_1` đến `26` và `28` đến `179`).
    - Xây dựng module `src/data/canonicalQuizData.ts` cung cấp dữ liệu bất biến: đúng 178 câu = 104 verified + 74 AI suggested + 0 missing.
    - Nâng cấp `ensureCanonicalDefaultSet()` với migration Dexie atomic transaction: an toàn xóa câu 27, cập nhật 178 câu canonical, ghi `canonical_content_version = 3` mà không làm mất dữ liệu tùy chỉnh của người dùng.
  - [x] **Workstream B — Tinh gọn Navigation & Khóa Preview Bảo Mật (P0)**:
    - Rút gọn điều hướng toàn ứng dụng chỉ còn 3 mục: **Ôn tập** (`/`), **Thống kê** (`/insights`), **Phiên bản** (`/releases`).
    - Tự động chuyển hướng (safe redirect) các đường dẫn cũ (`/library`, `/import`, `/review`) về trang chủ Ôn tập.
    - Trang chủ hiển thị Hero Subject Card duy nhất của môn học kèm 2 nút CTA: `Bắt đầu ôn tập` và `Tiếp tục lượt đang học`.
    - Tính năng che nội dung (Locked Preview): Danh sách câu hỏi và đáp án mặc định hoàn toàn vắng mặt khỏi React DOM cây thực tế (chống inspect/F12 nhìn trước). Chỉ tải và hiển thị khi người dùng chủ động bấm `Xem nội dung bộ đề`, hỗ trợ ẩn lại bất cứ lúc nào.
  - [x] **Workstream C — Tự động Đảo Câu Hỏi & Đảo 4 Phương Án (P0)**:
    - Mỗi phiên ôn tập mới tự động sinh `seed` ngẫu nhiên độc lập; xáo thứ tự 178 câu và vị trí 4 đáp án A, B, C, D qua thuật toán Fisher-Yates.
    - Snapshot câu hỏi và vị trí đáp án được lưu cố định trong session progress; không bị thay đổi khi refresh trang hay tiếp tục phiên học.
    - Chấm điểm và liên kết đáp án dựa trên `option.id` gốc, không phụ thuộc vào thứ tự chữ cái A/B/C/D.
  - [x] **Workstream D — Mastery Learning Engine: Gom 5 câu sai → Ôn lại → Đúng hết mới hoàn thành (P0)**:
    - Phát triển State Machine thuần túy trong `src/domain/studyEngine.ts`: `createStudySession`, `applyStudyAnswer`, `advanceStudyNext`, `calculateStudyResult`.
    - Khi tích lũy đủ 5 câu hỏi sai riêng biệt (unique IDs) ở luồng câu mới $\to$ tạm dừng và chuyển sang chế độ `REMEDIATION` đúng 5 câu đó.
    - Vòng lặp ôn lại đa tầng: Chỉ những câu làm đúng mới được đánh dấu `mastered` và rời khỏi lô; các câu sai tiếp tục được ôn lại vòng tiếp theo cho đến khi đúng toàn bộ lô 5 câu.
    - Xử lý lô dư cuối kỳ (tail batch 1–4 câu) nếu còn câu sai chưa khắc phục.
    - Quy tắc hoàn thành tuyệt đối: Chỉ chuyển sang trạng thái `COMPLETED` khi đã nắm vững **178/178 câu** (`masteredCount === 178` và không còn câu nợ).
  - [x] **Workstream E — Phân tích Kết quả & Lịch sử Học tập Chuyên sâu (P1)**:
    - Bảng kết quả `StudyResultView.tsx` hiển thị tỷ lệ đúng lần đầu (`firstPassAccuracy`), tổng số lần thử, số lượt sai, số lô ôn và số vòng học lại.
    - Thống kê chi tiết theo 6 chương giáo trình và bảng xếp hạng các câu khó nhất (câu sai nhiều lần nhất kèm phân tích phương án chọn nhầm).
    - Màn hình `InsightsView.tsx` theo dõi toàn bộ lịch sử các phiên học (hoàn thành và đang dở), hỗ trợ tiếp tục hoặc xem lại chi tiết từng phiên.
  - [x] **Workstream F — Tab Nhật ký Phiên bản & Cập nhật (`/releases`) (P1)**:
    - Cung cấp trang tra cứu lịch sử phát hành từ `src/data/releases.ts` với đầy đủ các mốc `v3.0.0`, `v2.2.0`, `v2.1.0`, `v2.0.0`.
    - Định dạng mốc thời gian phát hành chuẩn ISO-8601 kèm múi giờ Việt Nam (GMT+7) và phân loại thay đổi (Tính năng, Cải thiện, Sửa lỗi, Breaking Changes).
  - [x] **Workstream G — Kiểm thử, Hardening & Triển khai Production**:
    - Nâng cấp schema Dexie lên Version 3 bổ sung bảng `studyProgress`, `answerAttempts`, `appMetadata`.
    - Đạt 100% Quality Gates: **59/59 Vitest Unit Tests** pass (20 test files), **5/5 Playwright E2E Tests** pass, TypeScript strict clean.
    - Production bundle compile sạch sẽ qua Vite (`npm run build`).
