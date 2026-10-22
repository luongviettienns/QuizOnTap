# QUIZONTAP V3 — IMPLEMENTATION PLAN

**Phạm vi:** rút gọn ứng dụng thành một website ôn tập cố định cho **Kinh tế học và Môi trường**, tổng cộng **178 câu hợp lệ**, có che nội dung trước khi xem, tự động đảo câu/đáp án, học lại theo nhóm 5 câu sai, chỉ hoàn thành khi không còn câu sai chưa khắc phục, có thống kê chi tiết và tab Lịch sử phiên bản.

**Cơ sở khảo sát:** nhánh `main` của `luongviettienns/QuizOnTap` tại commit `367a6f266fb2c9c6f73087e4c1b2486b2a51a07f` (22/10/2026). Đây là **kế hoạch triển khai**, chưa phải code đã thay đổi hay phiên bản đã phát hành.

## 1. Hiện trạng kỹ thuật đã kiểm tra

- React 18, TypeScript strict, Vite 6, Tailwind v4; dữ liệu local-first bằng Dexie/IndexedDB; Vitest và Playwright; GitHub Pages deploy qua `.github/workflows/deploy.yml`.
- `src/data/seedDefaultData.ts` nạp 179 câu, trong đó **104 đáp án từ nguồn**, **74 đáp án AI gợi ý** và **1 câu thiếu hình/đáp án**; sử dụng ID `set_kinh_te_va_moi_truong`.
- Câu cần bỏ: **Chương 2 — Câu 17**, câu hỏi về điểm cân bằng E → E’, không có hình minh họa trong tài liệu. **Mã ID theo trình tự seed cũ: `q_set_kinh_te_va_moi_truong_27`** (10 câu chương 1 + câu 17 chương 2); nhiệm vụ triển khai phải xác nhận lại mã ID trực tiếp bằng dữ liệu parser trước khi chạy migration.
- `src/app/routes.ts` hiện có `/library`, `/import`, `/review`, `/insights`; `src/App.tsx` vẫn cho nhập đề, quản lý thư viện, chạy Practice/Exam/Flashcard.
- `src/features/library/QuizSetDetail.tsx` đang render trực tiếp cả câu hỏi và **đánh dấu đáp án đúng** ngay sau khi mở bộ đề.
- `src/domain/quizEngine.ts` đã có `createSessionSnapshot`, `seededShuffle`; nhưng `PracticeView.tsx` mặc định **không** xáo đáp án và chưa sử dụng snapshot xáo cả câu hỏi. Nút xáo hiện tại có thể thay đổi trong khi làm.
- `src/features/practice/PracticeView.tsx` kết thúc ngay khi duyệt xong mảng câu hỏi; chưa tích lũy sai, chưa có ôn lại 5 câu, chưa có persistence/analytics cho quá trình luyện tập.
- `src/domain/scoring.ts` hiện phục vụ kết quả thi thử; chưa biểu diễn quá trình đạt thành thạo sau nhiều lần trả lời.
- `src/db/quizDb.ts` đang ở schema version 2; `src/App.tsx` hiện chỉ gọi seed khi **toàn bộ danh sách bộ đề trống**, nên dữ liệu cũ có thể không tự cập nhật khi nâng cấp.

## 2. Phạm vi sau nâng cấp và các quyết định sản phẩm

### 2.1. Luồng chính duy nhất

**Trang chủ → Chọn bộ đề Kinh tế học và Môi trường → Trang giới thiệu bộ đề (ẩn câu/đáp án) → [Xem nội dung] hoặc [Bắt đầu ôn tập] → Làm 178 câu theo thứ tự ngẫu nhiên → Cứ đủ 5 câu sai chuyển qua ôn lại → Quay về luồng câu mới → Xử lý toàn bộ sai còn tồn → Hoàn thành → Bảng thống kê chi tiết.**

Menu đề xuất: **Ôn tập** (`/`), **Thống kê** (`/insights`), **Phiên bản** (`/releases`). Phần Thống kê có thể xem lịch sử phiên hoàn thành và phiên đang dở. Không cần Thư viện nhiều bộ đề.

### 2.2. Những gì loại bỏ khỏi UI người dùng

1. Toàn bộ **Nhập đề / Import Wizard** và các link dẫn đến nó (`/import`, Home CTA, Library CTA, empty state).
2. **Thư viện** dạng nhiều bộ đề và các thao tác **Tạo bộ đề**, **Nhập bộ đề mới**, **Xóa bộ đề**, **Thêm / Sửa / Xóa câu hỏi**, nút “Nạp đề mẫu”, export backup bộ đề từ màn hình học. Có thể giữ các hàm chuyển đổi dữ liệu ở mức code nếu phục vụ migration/kiểm thử, nhưng không còn lối truy cập trên sản phẩm.
3. Tab độc lập **Ôn câu sai** (`/review`) và màn `MistakeReviewView` trong điều hướng; ôn sai được đưa **vào bên trong phiên học** theo quy tắc 5 câu.
4. Các thẻ dashboard / nhãn / nội dung marketing nói rằng app hỗ trợ nhiều bộ đề, nhập đề hoặc quản trị câu hỏi; cập nhật README và tài liệu theo sản phẩm mới.
5. **Thi thử/Flashcard:** chưa có yêu cầu xóa rõ ràng; để đúng mục tiêu tối giản, ẩn khỏi luồng chính v3, không xóa module lõi khi chưa cần. Nếu sau này cần bật lại, cả hai chỉ được dùng bộ 178 câu hợp lệ. **Quy tắc “đúng hết mới hoàn thành” áp dụng cho chế độ Ôn tập v3**, không tự áp cho thi thử bấm giờ cũ.

**Bảo toàn dữ liệu:** tuyệt đối **không xóa hàng loạt** các bộ đề và lịch sử người dùng đã có trong IndexedDB; chỉ giới hạn bộ đề hiện ra và được truy cập ở UI. Riêng bản ghi **câu lỗi** thuộc bộ đề mặc định phải được xóa có chủ đích.

## 3. Workstream A — Chuẩn hóa bộ đề 178 câu (P0)

**Mục tiêu:** sau khi nâng cấp, mọi trải nghiệm mới chỉ dùng chính xác 178 câu có đáp án, không tạo bản sao và không bị kẹt ở câu lỗi.

**A1. Dữ liệu chuẩn bất biến**
- Lấy dữ liệu hiện tại từ `src/data/defaultQuiz.md` theo parser đang dùng; xác nhận 179 câu, 1 câu lỗi Chương 2/Câu 17 và 178 câu chấm được.
- Sinh **bản dữ liệu chuẩn 178 câu** dạng JSON/TS đã xác thực schema hoặc filter minh bạch trong quy trình seed. **Giữ nguyên mọi ID của 178 câu còn lại**: không đánh lại ID tuần tự sau khi bỏ phần tử thứ 27. Nếu bỏ câu lỗi khỏi file Markdown nguồn, phải dùng bản ánh xạ ID cũ khi xuất dữ liệu chuẩn, không tạo ID mới theo index của mảng 178 câu.
- Đưa câu lỗi ra khỏi nguồn dữ liệu **được bundle vào ứng dụng chạy thật**. Có thể giữ bản tài liệu gốc trong `docs/` để truy vết, nhưng không dùng nó để hiển thị/luyện tập.
- Câu `answerStatus === 'missing'` tuyệt đối không lọt vào danh sách phiên luyện tập; kiểm tra answer IDs có tồn tại trong options. Đánh dấu rõ câu AI gợi ý **không phải đáp án giảng viên đã xác minh**. Riêng các câu Chương 2/Câu 15 và Chương 3/Câu 14 có cảnh báo chất lượng trong tài liệu: kiểm tra nội dung hoặc giữ chú thích, **không tự suy diễn để đổi đáp án**.

**A2. Seed + migration IndexedDB**
- Tăng schema Dexie lên v3 và lưu `contentVersion` / `appDataVersion` dưới dạng metadata có chỉ mục rõ ràng.
- Khi khởi động, chạy `ensureCanonicalDefaultSet()` theo phiên bản dữ liệu, **kể cả khi IndexedDB đã có các bộ đề khác**.
- Migration trong transaction: xác nhận/tạo đúng set mặc định; xóa câu lỗi theo ID legacy sau khi xác minh; upsert 178 câu canonical; tránh duplicate; không xóa lịch sử cũ/sets tùy chỉnh; ghi contentVersion sau khi transaction thành công.
- Với các phiên dở cũ chứa câu đã loại: đánh dấu **không tương thích** và cho tạo phiên mới (hoặc chuyển đổi có kiểm chứng); tuyệt đối không khôi phục câu lỗi.
- Không re-seed vô điều kiện khi render: mỗi version chỉ cập nhật một lần, có cơ chế recover sau transaction thất bại.

**A3. Data QA**
- Test chính xác **178 câu = 104 verified + 74 suggested + 0 missing**; 6 chương; ID duy nhất; option IDs duy nhất từng câu; correct ID thuộc options; dữ liệu mô tả 178 không còn chữ “179” trên UI.
- Test update từ IndexedDB đã chứa 179 câu; từ IndexedDB có thêm bộ đề cũ; seed 2 lần không nhân bản; test lỗi migration rollback.

**Định nghĩa xong A:** query theo `setId` trả 178 bản ghi hợp lệ, ID câu lỗi vắng mặt, người dùng cũ không bị buộc xóa IndexedDB thủ công.

## 4. Workstream B — Tinh gọn navigation và trang bộ đề (P0)

**Files chính:** `src/app/routes.ts`, `src/app/AppShell.tsx`, `src/App.tsx`, `src/features/library/QuizSetDetail.tsx`, một `StudyHome.tsx`/`FixedQuizLanding.tsx` mới.

- Home render **1 thẻ duy nhất**: tiêu đề môn, 178 câu, 6 chương, mô tả, thông tin nguồn gốc đáp án và progress nếu đang học dở.
- 2 CTA nổi bật: `Bắt đầu lượt mới` và `Tiếp tục lượt đang học` (chỉ hiện khi có phiên dở).
- Ở trang chi tiết có khối preview câu hỏi **mặc định bị khóa**: hiển thị skeleton/placeholder hoặc lớp blur **không chứa text/đáp án gốc**; nút `Xem nội dung bộ đề` mới tải/render danh sách câu hỏi và đáp án preview.
- Trạng thái reveal chỉ sống trong phiên xem: mở trang chi tiết lần mới/refresh thì lại khóa. Có thể cho `Ẩn lại` bằng nút rõ ràng.
- Đáp án đúng trong **preview xem nội dung** được đánh dấu sau khi bấm `Xem nội dung`; khi **đang làm quiz** thì KHÔNG được hiển thị đáp án đúng trước khi chọn; sau khi trả lời mới feedback đúng/sai và giải thích.
- Tránh “blur giả”: không chỉ đặt `filter: blur()` lên DOM có text thật vì screen reader, copy/paste hoặc inspect vẫn đọc được. Chỉ render nội dung thật khi quyền hiển thị `revealed === true`. `aria-hidden`, loading, keyboard focus chuẩn.
- Bảo vệ đường dẫn cũ `/library`, `/import`, `/review` nếu có deep-link/bookmark: chuyển về `/` hoặc trang giải thích ngắn, không để trang trống.

**Định nghĩa xong B:** không tồn tại bất kỳ nút UI nào tạo/nhập/chỉnh bộ đề hoặc tab Ôn câu sai/Thư viện; mở bộ đề lần đầu không lộ chữ câu hỏi hoặc đáp án ở DOM.

## 5. Workstream C — Trộn đề/đáp án đúng và nhất quán (P0)

**Files chính:** `src/domain/quizEngine.ts`, `src/domain/contracts.ts`, `src/App.tsx`, `src/features/practice/PracticeView.tsx`.

- Mỗi **lượt xem nội dung mới** và **phiên ôn mới** tạo seed độc lập; thực hiện Fisher–Yates/`seededShuffle` cho **thứ tự 178 câu** và **thứ tự phương án riêng của mỗi câu**.
- Không dùng thứ tự chữ A/B/C/D làm ID. Đáp án và kết quả chấm luôn dùng `option.id`, không dùng `index`; nhãn A–D cập nhật từ **vị trí hiển thị mới**.
- Dùng `createSessionSnapshot(..., {shuffleQuestions:true, shuffleOptions:true, seed})`, hoặc tích hợp lại API hiện có theo cùng hợp đồng. Lưu `questionIds` và `optionOrderByQuestion` khi tạo phiên.
- **Thứ tự không thay đổi trong cùng một phiên** khi React re-render, refresh hay “Tiếp tục”. `Bắt đầu lượt mới` luôn sinh snapshot mới. Nếu mục tiêu UX là đảm bảo thứ tự khác phiên ngay trước, thêm kiểm tra permutation trùng và thử seed lại; không được đảo khi user đang làm.
- Đối với một lô ôn 5 câu sai: shuffle thứ tự 5 câu và các lựa chọn theo snapshot mới, không thay đổi `correctOptionIds`.
- Gỡ nút shuffle khi đang trả lời hoặc biến thành thiết lập áp dụng **chỉ cho phiên kế tiếp**, tránh đổi vị trí đáp án giữa hai thao tác.

**Định nghĩa xong C:** đề thay đổi thứ tự giữa các phiên mới; việc chọn và chấm đúng không phụ thuộc chữ cái vị trí; refresh duy trì nguyên đáp án/vị trí của phiên dở.

## 6. Workstream D — Learning Engine: “Sai đủ 5 → làm lại → đúng hết” (P0, trọng tâm)

### 6.1. Quy tắc nghiệp vụ cố định

- Tổng mục tiêu `totalEligible = 178`.
- **“Sai 5 câu” = 5 ID câu hỏi khác nhau** bị trả lời sai ở luồng câu mới, chưa được đưa vào lô ôn. Không tính 5 lần bấm sai trên cùng một câu là 5 câu sai.
- Khi đạt 5 câu sai, hiển thị feedback câu thứ 5; sau thao tác `Tiếp tục`, **tạm dừng luồng câu mới** và chuyển sang lô `REMEDIATION` đúng 5 ID đó.
- Trong lô ôn lại: câu làm đúng được đánh dấu `mastered` và rời lô; câu sai vẫn `unresolved`. Sau khi đi hết lô, chỉ các câu vẫn sai được làm lại vòng tiếp, cứ thế đến khi cả lô đúng; tránh lô ôn lồng nhau.
- Khi lô 5 đã sạch, trở lại đúng vị trí câu mới còn dở. Nếu cuối 178 câu còn 1–4 câu sai chưa tạo được lô 5 thì tạo **lô cuối** với chính 1–4 câu đó.
- `mastered` chỉ khi người dùng trả lời đúng (ít nhất một lần) câu đủ điều kiện; `completed` **khi và chỉ khi** cả 178 ID đã được trả lời đúng, không có câu mới chưa làm, không có ID unresolved/queued và không còn remediation đang chạy.
- Một câu đã trả lời sai rồi sửa đúng **vẫn được tính là sai ở lần đầu**, nhưng không còn nợ khi kết thúc. Không ghi phiên hoàn thành nếu user bấm `Thoát`, refresh hoặc đóng tab.
- Cho phép tạm dừng/tiếp tục; nút `Bỏ phiên` có xác nhận, không tính hoàn thành.

### 6.2. Trạng thái tối thiểu

```ts
type StudyPhase = 'MAIN' | 'REMEDIATION' | 'COMPLETED' | 'ABANDONED';
interface StudyProgress {
  sessionId: string;
  setId: string;               // chỉ DEFAULT_SET_ID
  contentVersion: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  phase: StudyPhase;
  questionOrder: string[];      // đúng 178 ID, đảo cố định theo session
  optionOrderByQuestion: Record<string, string[]>;
  mainCursor: number;          // vị trí câu chưa hoàn tất trong lượt chính
  masteredIds: string[];       // set khi xử lý state
  pendingWrongIds: string[];   // tối đa 4, trước khi đóng thành lô
  remediationIds: string[];    // tối đa 5, lô đang xử lý
  remediationCursor: number;
  remediationRound: number;
  attemptCount: number;
  wrongAttemptCount: number;
  reviewBatchCount: number;
  startedAt: number;
  completedAt: number | null;
  accumulatedActiveMs: number; // nếu cần thời gian học thực thay vì wall-clock
}
interface AnswerAttempt {
  id: string;                  // duy nhất; chống double submit
  sessionId: string;
  questionId: string;
  selectedOptionIds: string[];
  correct: boolean;
  phase: 'MAIN' | 'REMEDIATION';
  batchNo: number | null;
  createdAt: number;
}
```

**Lưu ý:** thuộc tính trên là hợp đồng **đề xuất**, cần hoàn thiện validator và thêm dữ liệu checkpoint để khôi phục chính xác. `masteredIds`, queue, lịch sử trả lời phải được cập nhật atomically; không cần giữ các field dư thừa nếu có thể derive từ attempt log một cách tin cậy.

### 6.3. Reducer/state machine đề xuất

```text
START -> MAIN
MAIN + CORRECT: ghi attempt, mastered.add(questionId), đi câu mới
MAIN + WRONG: ghi attempt, pendingWrong.add(questionId)
MAIN + pendingWrong.size == 5 -> sau feedback: REMEDIATION(5 IDs)
REMEDIATION + CORRECT: ghi attempt, mastered.add(questionId), loại khỏi unresolved
REMEDIATION + WRONG: ghi attempt, giữ ID unresolved cho vòng kế tiếp
REMEDIATION + hết vòng + unresolved > 0 -> REMEDIATION(vòng mới chỉ gồm unresolved)
REMEDIATION + hết vòng + unresolved == 0 -> MAIN
MAIN + hết 178 câu + pendingWrong.size > 0 -> REMEDIATION(lô cuối 1–4)
MAIN + hết 178 câu + pendingWrong.size == 0 + mastered.size == 178 -> COMPLETED
EXIT -> lưu in-progress; ABANDON chỉ khi người dùng xác nhận bỏ phiên
```

- Ghi mỗi attempt và chuyển state trong cùng **Dexie transaction**. Chặn double click/keyboard repeat/2 tab cùng trả lời (`expectedRevision`, mutex hoặc single-writer lock).
- Tạo `studyProgress` và `answerAttempts` qua Dexie schema version 3; có indexes cho `sessionId`, `questionId`, `createdAt`, `status`; định nghĩa `studyResults`/summary snapshot riêng nếu cần, tránh phụ thuộc `ExamResult` vốn dành cho thi thử.
- Viết domain functions **thuần** (`applyAnswer`, `startRemediation`, `finishRound`, `canComplete`) không trộn React/DB.

### 6.4. Ca ví dụ chuẩn

Giả sử đầu lượt: Q1 sai, Q4 sai, Q7 sai, Q11 sai, Q15 sai ⇒ hiện “Bạn có 5 câu cần luyện lại” ⇒ làm 5 câu. Vòng 1 đúng 3 và sai 2 ⇒ vòng 2 chỉ làm 2 câu; khi đúng cả 2 quay lại Q16 trở đi. Kết thúc 178 câu nếu còn 3 sai ⇒ ôn 3 câu đó đến khi đúng hết ⇒ **178/178 đã nắm vững**, mới có màn hoàn thành.

**Định nghĩa xong D:** không thể đến màn thành công trong trạng thái còn câu chưa làm hoặc câu sai tồn đọng; lỗi refresh/double click không làm nhảy câu hay nhân thống kê.

## 7. Workstream E — Kết quả, phân tích tiến độ và lịch sử (P1)

**Màn hình chỉ hiện khi status `completed`.** Có thể hiển thị `Tiến độ hiện tại` khi chưa hoàn thành, nhưng không gắn nhãn kết quả cuối.

Các chỉ số bắt buộc:

1. **178/178 đã nắm vững** — số câu đúng ít nhất một lần; đây là **mastery cuối**, không đánh đồng với điểm 100% lần đầu.
2. **Đúng lần đầu / Sai lần đầu**, tỷ lệ đúng ở lần đầu = `firstPassCorrect / 178 * 100`.
3. **Tổng lượt trả lời**, **số lượt đúng**, **số lượt sai** (bao gồm tất cả các vòng ôn), tỷ lệ đúng theo lần trả lời.
4. **Số câu từng mắc lỗi** (unique IDs), **tổng số lần trả lời sai**, **số nhóm ôn sai** và **số vòng ôn lại**, nhóm cuối dưới 5 cũng tính.
5. **Thời gian** bắt đầu, kết thúc, thời lượng học thực/elapsed (nêu rõ loại thời gian), số phiên bị bỏ/đang dở trong lịch sử nếu được hiển thị.
6. **Thống kê theo 6 chương**: tổng số câu, đúng lần đầu, sai lần đầu, tổng lần luyện, số câu cần sửa và hoàn thành.
7. **Những câu khó nhất**: câu sai nhiều lần, lần đầu chọn sai phương án nào, lời giải thích, đánh dấu `AI gợi ý` khi phù hợp. Các chi tiết này chỉ được bật sau khi hoàn thành hoặc được mở ở chế độ tổng kết; tuyệt đối không làm rò đáp án của câu chưa làm.
8. Mốc ngày/giờ lịch sử, nguồn dữ liệu version để so sánh hai phiên có khác tập câu; từ chối trộn thống kê 179 câu cũ với 178 câu v3.

**QA số liệu:** `firstPassCorrect + firstPassWrong = 178` (nếu bắt buộc trả lời từng câu trước Next); `totalAttempts = correctAttempts + wrongAttempts`; `uniqueEverWrong <= 178`; `mastered = 178`; `unresolved = 0`. Kết quả được tính từ attempt events, không lấy từ state UI dễ bị mất khi reload.

## 8. Workstream F — Tab “Phiên bản & Cập nhật” (P1)

**Route:** `/releases` — tên giao diện `Phiên bản` hoặc `Nhật ký cập nhật`.

**Metadata cho mỗi version:**

```ts
interface ReleaseNote {
  version: string;             // ví dụ "3.0.0" theo SemVer
  releasedAt: string | null;   // ISO-8601 kèm offset; null nếu CHƯA phát hành
  status: 'released' | 'planned';
  title: string;
  type: 'major' | 'minor' | 'patch';
  highlights: string[];
  fixes: string[];
  breakingChanges?: string[];
  gitCommit?: string;
}
```

- Lấy từ một file versioned `src/data/releases.ts` hoặc JSON; hiển thị mới nhất lên đầu, nhãn `Đang sử dụng`, các thẻ thay đổi được chia `Tính năng`, `Cải thiện`, `Sửa lỗi`, `Thay đổi có ảnh hưởng`.
- Định dạng giờ theo **Asia/Ho_Chi_Minh** (VD `22/10/2026 21:30 GMT+7`), không dùng `Date.now()` trên client để giả thành giờ phát hành.
- Chỉ đánh dấu `released` khi deploy thực sự thành công; metadata ban đầu cho v3 là **dự kiến** (`releasedAt: null`) cho tới khi có thời điểm xác nhận. Phân biệt rõ `builtAt` và `releasedAt`; timestamp commit không đồng nghĩa giờ website phát hành.
- Có thể link changelog với commit/tag GitHub thật. Không bịa lịch sử bản v1/v2 nếu chưa có record đáng tin cậy.
- Nội dung thay đổi của v3 nên gồm: giản lược menu/import/library/review; khóa preview; 178 câu; shuffle tự động; sửa 5 câu sai; bắt buộc mastery; thống kê; migration & backup; UI + tests.

**Định nghĩa xong F:** tab hiển thị ít nhất v3 planned/released đúng thực tế, changelog có thời gian chính xác sau phát hành, không viết dữ liệu giả.

## 9. Workstream G — UX, A11y, vận hành và hardening (P1)

- Layout desktop/mobile, bottom-nav không quá 3 tab. Không làm xô lệch khi mở feedback hoặc remediation; dùng sticky CTA hợp lý.
- Cảnh báo rõ trong phiên: `Đã trả lời 45/178`, `Nắm vững 39/178`, `Câu cần luyện lại 3/5`, phase `Làm lại câu sai 2/5`.
- Với lô ôn lỗi 5: nói rõ đây là phần học bắt buộc trong bài hiện tại, không mở tab ôn riêng; giữ lời giải hiện có.
- Hỗ trợ keyboard phím 1–4, A–D, Enter/Space nhưng disable sự kiện khi đang modal, input hoặc chờ lưu DB; focus và aria-live cho trạng thái phản hồi.
- Respect `prefers-reduced-motion`, dark/light, âm thanh mute và feedback màu không phụ thuộc màu duy nhất.
- Không dùng network/backend mới; giữ IndexedDB và GitHub Pages static. Nếu IndexedDB bị từ chối/quota full phải có thông báo và không đánh dấu submit đã lưu thành công.
- Chuẩn bị hiển thị khi dữ liệu seed thất bại; fallback `Thử lại` và thông tin lỗi có kiểm soát.
- README và `PROJECT_PROGRESS.md` cập nhật luồng mới, 178 câu, cách chạy test, format release note.

## 10. Ma trận thay đổi theo file

| File / nhóm file | Việc cần làm | Mức |
|---|---|---|
| `src/data/seedDefaultData.ts`, dữ liệu canonical mới | Seed 178, loại câu lỗi, version hoá migration | P0 |
| `src/data/defaultQuiz.md` | Chuyển dữ liệu gốc sang tài liệu archive/không đưa câu lỗi vào runtime bundle; giữ mapping IDs | P0 |
| `src/db/quizDb.ts`, `src/db/repositories.ts` | Dexie v3; progress/attempts, metadata, transactions, resume | P0 |
| `src/domain/contracts.ts` | `StudyProgress`, `AnswerAttempt`, phase, session status | P0 |
| `src/domain/quizEngine.ts` | Xáo câu + options, snapshots không biến động trong phiên | P0 |
| `src/domain/studyEngine.ts` (mới) | Pure state machine 5 câu sai và điều kiện hoàn thành | P0 |
| `src/features/practice/PracticeView.tsx` | Điều hướng MAIN/REMEDIATION, feedback, save/resume | P0 |
| `src/features/library/QuizSetDetail.tsx` hoặc `FixedQuizLanding.tsx` (mới) | Preview ẩn mặc định; chỉ reveal sau nút `Xem nội dung` | P0 |
| `src/app/routes.ts`, `src/app/AppShell.tsx`, `src/App.tsx` | Bỏ tab/CTA cũ, route home cố định, kết nối luồng mới | P0 |
| `src/features/results/StudyResultView.tsx` (mới) | Bảng kết quả mastery + history + chapter stats | P1 |
| `src/features/releases/ReleaseNotesView.tsx`, `src/data/releases.ts` (mới) | Changelog, version, datetime phát hành | P1 |
| Tests Vitest + Playwright hiện có | Xóa/sửa expectations obsolete, bổ sung scenarios mới | P0 |
| `.github/workflows/deploy.yml` | CI gates + build + deploy; tag & release metadata đúng thực tế | P1 |
| `README.md`, `PROJECT_PROGRESS.md` | Hướng dẫn luồng 178 câu và nhật ký nâng cấp | P1 |

**Không nhất thiết xóa các module cũ ngay:** xoá import, review, library trong điều hướng/runtime trước; sau khi hết import/reference mới cân nhắc loại mã chết và dependency. Tránh refactor diện rộng đồng thời với thay đổi state machine.

## 11. Triển khai theo wave và điểm nghiệm thu

| Wave | Phạm vi | Kết quả đầu ra | Gate |
|---|---|---|---|
| **0 — Snapshot** | Tạo branch, khoá baseline, sao lưu IndexedDB thử nghiệm, viết test đỏ cho 178 & 5-sai | Baseline + failing tests | Đã xác định ID câu lỗi; test mới đỏ đúng lý do |
| **1 — Data** | Canonical 178 + Dexie v3 migration + seeding mọi lượt khởi động | Dữ liệu 178 cả user mới & cũ | A3 tất cả pass |
| **2 — Simplify** | Router/sidebar/home fixed set; bỏ import/library/review/CRUD | UI đơn mục tiêu | Không còn link tính năng bỏ; deep link cũ an toàn |
| **3 — Reveal + Shuffle** | Preview locked; snapshot shuffle chính xác; resume giữ thứ tự | Không lộ đề + tráo ổn định | UX & shuffle tests pass |
| **4 — Mastery Engine** | Lỗi 5 câu, batch, round, tail batch; transactions | Không thể hoàn thành khi còn nợ | Full state machine unit tests pass |
| **5 — Analytics** | Attempts, results, breakdown, history | Báo cáo đúng bản chất tiến trình | Invariants & reload tests pass |
| **6 — Versions & Polish** | Tab releases, A11y, mobile, docs, CI | Candidate v3 | Typecheck/build/unit/E2E + QA thủ công pass |
| **7 — Deploy** | Smoke production GitHub Pages, ghi đúng phát hành, rollback plan | v3 production | Check website thật + app version/timestamp đúng |

Nếu dùng AI coding agent, chia mỗi wave thành **1 pull request nhỏ**, không yêu cầu agent làm tất cả trong một prompt khổng lồ. Wave 4 là trọng tâm, nên tách `studyEngine` thuần khỏi UI và viết test trước.

## 12. Bộ kịch bản kiểm thử bắt buộc

**Dữ liệu/migration**
- [ ] First load clean browser → đúng 1 bộ đề active, đúng 178 câu, 6 chương, 0 missing.
- [ ] Upgrade browser cũ 179 câu → câu Chương 2/Câu 17 biến mất; 178 ID còn lại không đổi; lịch sử cũ không bị xóa hàng loạt.
- [ ] App khởi động 3 lần → không thêm bản ghi/tráo metadata vô cớ; lỗi transaction rollback đúng.
- [ ] Bộ đề cũ của người dùng được giữ trong DB nhưng không truy cập được từ UI v3.

**Ẩn nội dung**
- [ ] Vừa mở chi tiết → không thấy text câu hỏi hoặc option/đáp án trong DOM/accessible tree; chỉ placeholder và nút reveal.
- [ ] Bấm `Xem nội dung` → mới render preview; quay về rồi vào lại → lại ẩn.
- [ ] Bắt đầu làm → không lộ option đúng trước khi chọn; sau chọn mới show feedback.

**Shuffle**
- [ ] Bắt đầu phiên mới → cả câu hỏi và option được shuffle, mapping đáp án giữ nguyên.
- [ ] Reload/resume → cùng thứ tự trong phiên cũ; bắt đầu phiên mới → seed mới.
- [ ] Test deterministic với seed cố định; không giả định hoán vị phải khác 100% nếu không có bảo đảm code.

**Tích lũy sai/một lượt**
- [ ] Trả sai 1–4 câu → chưa bật remediation.
- [ ] Trả sai đúng 5 ID khác nhau → sau feedback chuyển sang lô 5.
- [ ] Lô ôn sai 2/5 → chỉ 2 ID sai sang vòng tiếp; đúng hết mới về MAIN.
- [ ] Kết thúc 178 câu còn 1–4 sai → tạo lô cuối và giải quyết.
- [ ] Sai tất cả 178 lần đầu → thành công chỉ sau khi 178 đều được giải quyết.
- [ ] Trả đúng 178 câu lần đầu → hoàn thành ngay, 0 batch.
- [ ] Sau sai lần đầu, sửa đúng → `firstPassWrong` vẫn chính xác nhưng `unresolved=0`.
- [ ] Double click/nhấn Enter liên tiếp hoặc 2 tab → không nhân attempt/không nhảy 2 câu.
- [ ] Refresh giữa lô 5 câu → quay lại đúng phase/cursor/answer order; không reset tiến độ.
- [ ] Thoát/đóng tab → chưa có `COMPLETED`; tiếp tục được.

**Báo cáo & releases**
- [ ] `firstPassCorrect + firstPassWrong = 178`; `correctAttempts + wrongAttempts = totalAttempts`; `mastered=178` trước khi show kết quả.
- [ ] 6 chương breakdown đúng; không coi 100% mastered là 100% đúng lần đầu.
- [ ] Tab phiên bản có thời gian thực sự được ghi nhận sau deploy, không tự nhận `planned` là đã phát hành.
- [ ] `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run build` pass; smoke test desktop/mobile và URL GitHub Pages.

## 13. Definition of Done toàn dự án

Chỉ chấp nhận v3 khi **đồng thời** thỏa mãn: (1) một bộ đề cố định 178 câu; (2) câu Chương 2/Câu 17 bị loại ở DB + mọi luồng mới; (3) không còn nhập đề/tạo bộ đề/thư viện/ôn câu sai độc lập; (4) preview không lộ trước khi xem; (5) mỗi phiên mới xáo cả câu và đáp án, khôi phục phiên không tráo lại; (6) đủ 5 câu sai kích hoạt lượt luyện lại, phần dư 1–4 được xử lý cuối bài; (7) chỉ kết thúc khi 178/178 đã đúng, hàng đợi sai trống; (8) thống kê first-pass và tổng lượt trả lời có thể kiểm toán; (9) trang lịch sử phiên bản hiển thị cập nhật và thời gian phát hành xác thực; (10) nâng cấp không làm mất dữ liệu người dùng cũ và CI/CD thông qua.

## 14. Nguồn mã đã tham chiếu

- Repo: https://github.com/luongviettienns/QuizOnTap
- Default seed: https://github.com/luongviettienns/QuizOnTap/blob/main/src/data/seedDefaultData.ts
- Default quiz: https://github.com/luongviettienns/QuizOnTap/blob/main/src/data/defaultQuiz.md
- UI set detail: https://github.com/luongviettienns/QuizOnTap/blob/main/src/features/library/QuizSetDetail.tsx
- Practice view: https://github.com/luongviettienns/QuizOnTap/blob/main/src/features/practice/PracticeView.tsx
- Quiz engine: https://github.com/luongviettienns/QuizOnTap/blob/main/src/domain/quizEngine.ts
- Routing: https://github.com/luongviettienns/QuizOnTap/blob/main/src/app/routes.ts
- Database schema: https://github.com/luongviettienns/QuizOnTap/blob/main/src/db/quizDb.ts
