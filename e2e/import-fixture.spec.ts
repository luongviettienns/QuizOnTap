import { test, expect } from '@playwright/test';

test.describe('Quiz Import Wizard E2E Flow', () => {
  const sampleImportText = `
### Câu 1: Quy luật giá trị là quy luật kinh tế cơ bản của:
A. Nền sản xuất tự cấp tự túc
B. Nền sản xuất hàng hóa
C. Nền kinh tế tri thức
D. Tất cả các hình thái kinh tế
Đáp án: B

### Câu 2: Giá cả thị trường lên xuống xoay quanh cái gì?
A. Cung và cầu
B. Giá trị hàng hóa
C. Ý chí của người mua
D. Giá thành sản xuất
`;

  test('successfully imports questions via Markdown parser', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nhập đề', exact: true }).first().click();

    // Switch to Paste tab
    await page.getByRole('button', { name: 'Dán văn bản', exact: true }).click();

    // Fill in textarea
    const textarea = page.getByPlaceholder(/Dán nội dung câu hỏi tại đây/i);
    await textarea.fill(sampleImportText);

    // Click Analyze
    await page.getByRole('button', { name: 'Phân tích tài liệu', exact: true }).click();

    // Preview step
    await expect(page.getByText(/2 câu phát hiện/i)).toBeVisible();
    await expect(page.getByText(/1 có đáp án/i)).toBeVisible();
    await expect(page.getByText(/Quy luật giá trị là quy luật kinh tế cơ bản của:/i)).toBeVisible();

    // Enter title & confirm save
    await page.getByPlaceholder(/Nhập tên bộ đề/i).fill('Bộ Đề Kinh Tế Chính Trị');
    await page.getByRole('button', { name: /Lưu vào thư viện/i }).click();

    // Redirects to library / set detail
    await expect(page.getByRole('heading', { name: 'Bộ Đề Kinh Tế Chính Trị' })).toBeVisible();
    await expect(page.getByText(/Tổng số: 2 câu/i)).toBeVisible();
  });
});
