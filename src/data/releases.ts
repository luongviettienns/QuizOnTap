export interface ReleaseNote {
  version: string;
  releasedAt: string | null; // ISO-8601 kèm timezone hoặc null nếu planned
  status: 'released' | 'planned';
  title: string;
  type: 'major' | 'minor' | 'patch';
  highlights: string[];
  fixes: string[];
  breakingChanges?: string[];
  gitCommit?: string;
}

export const RELEASES: ReleaseNote[] = [
  {
    version: '3.0.0',
    releasedAt: '2026-10-22T22:30:00+07:00',
    status: 'released',
    title: 'Focused Studio V3 — Chuyên sâu 178 câu Kinh tế học & Môi trường',
    type: 'major',
    highlights: [
      'Tinh gọn website thành 1 môn học chuyên sâu duy nhất: Kinh tế học và Môi trường với đúng 178 câu hỏi trắc nghiệm hợp lệ.',
      'Khóa nội dung trước khi xem: Danh sách câu hỏi mặc định được che kín và bảo mật trong DOM, chỉ mở khóa khi người dùng bấm "Xem nội dung bộ đề".',
      'Tự động xáo trộn ngẫu nhiên: Mỗi lượt ôn tập mới tự động đảo ngẫu nhiên toàn bộ thứ tự 178 câu và vị trí 4 phương án A, B, C, D.',
      'Luyện lại theo nhóm 5 câu sai: Cứ khi trả lời sai 5 câu bất kỳ, hệ thống lập tức tạm dừng và đưa vào phiên ôn lại 5 câu đó cho đến khi giải quyết triệt để.',
      'Quy tắc thành thạo tuyệt đối: Chỉ cấp chứng nhận hoàn thành khi người dùng đã trả lời đúng toàn bộ 178/178 câu.',
      'Bảng phân tích tiến trình chuyên sâu: Đánh giá tỷ lệ đúng lần đầu, số lần cần sửa, thống kê 6 chương và bảng xếp hạng các câu khó nhất.',
      'Bảo toàn dữ liệu cũ: Migration Dexie v3 tự động loại bỏ câu lỗi cũ mà không làm mất các bộ đề cá nhân hay lịch sử của người dùng.',
    ],
    fixes: [
      'Loại bỏ dứt điểm câu hỏi lỗi Chương 2 Câu 17 (thiếu hình vẽ minh họa và đáp án) khỏi ngân hàng câu hỏi chính thức.',
      'Loại bỏ các tab và nút chức năng thừa (Nhập đề, CRUD bộ đề, Thư viện) nhằm tối đa hóa sự tập trung cho học viên.',
      'Khắc phục xung đột quyền hạn GitHub Pages với workflow tự động hóa qua nhánh gh-pages.',
    ],
    breakingChanges: [
      'Giao diện chuyển từ nền tảng quản trị nhiều bộ đề sang chế độ học tập tập trung 1 môn duy nhất.',
      'Các đường dẫn cũ (/import, /library, /review) tự động được chuyển hướng về trang chủ ôn tập.',
    ],
    gitCommit: 'b6599f7',
  },
  {
    version: '2.2.0',
    releasedAt: '2026-10-22T17:00:00+07:00',
    status: 'released',
    title: 'Hệ thống âm thanh tương tác & 4 đáp án 4 màu đặc trưng',
    type: 'minor',
    highlights: [
      'Bộ tổng hợp âm thanh Web Audio API offline 100%: 7 hiệu ứng âm thanh phong phú (correct, wrong, flip, alert, victory, complete, click).',
      'Hệ màu 4 đáp án chuẩn thương hiệu: A (Rose), B (Sky), C (Amber), D (Emerald) đạt chuẩn tương phản cao WCAG 2.2 AA.',
      'Tự động đồng bộ với nút Mute trên Sidebar và lưu trạng thái vào localStorage.',
    ],
    fixes: [
      'Sửa lỗi nhầm lẫn nhãn phương án khi đổi chỗ các câu hỏi.',
      'Chuẩn hóa độ tương phản nhãn nhỏ trên nền sáng và nền tối.',
    ],
  },
  {
    version: '2.1.0',
    releasedAt: '2026-10-22T14:30:00+07:00',
    status: 'released',
    title: 'Tích hợp ngân hàng câu hỏi & đáp án bổ sung kèm giải thích',
    type: 'minor',
    highlights: [
      'Bổ sung 74 đáp án AI gợi ý có lập luận giải thích chi tiết cho các câu hỏi chưa có key trong tài liệu gốc.',
      'Hệ thống Badge phân loại trực quan: Đáp án gốc (xanh lục), AI gợi ý (indigo), Chưa có đáp án (vàng).',
      'Tự động kích hoạt nạp dữ liệu vào IndexedDB khi người dùng truy cập lần đầu.',
    ],
    fixes: [
      'Nâng cấp Parser regex nhận diện chuẩn xác các mẫu đáp án đa dạng trong Markdown.',
    ],
  },
  {
    version: '2.0.0',
    releasedAt: '2026-10-21T20:00:00+07:00',
    status: 'released',
    title: 'Khởi tạo QuizOnTap Focused Studio V2',
    type: 'major',
    highlights: [
      'Kiến trúc Local-First chạy hoàn toàn trên trình duyệt qua Dexie/IndexedDB.',
      'Giao diện Dark/Light mode hiện đại thiết kế theo phong cách Focused Learning Studio.',
      'Hệ thống kiểm thử kép Vitest + Playwright E2E coverage 100%.',
    ],
    fixes: [],
  },
];
