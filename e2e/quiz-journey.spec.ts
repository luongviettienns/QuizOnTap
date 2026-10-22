import { test, expect } from '@playwright/test';

test.describe('QuizOnTap V3 Focused 178 Study Journey', () => {
  test('homepage renders focused 178-question subject and allows locked preview reveal', async ({ page }) => {
    await page.goto('/');

    // Check title and single-subject hero
    await expect(page).toHaveTitle(/QuizOnTap/i);
    await expect(page.getByRole('heading', { name: /Kinh tế học và Môi trường/i })).toBeVisible();
    await expect(page.getByText('178 câu hợp lệ')).toBeVisible();

    // Check locked preview initial state
    await expect(page.getByText(/Nội dung câu hỏi và đáp án đang được khóa/i)).toBeVisible();
    const revealBtn = page.getByRole('button', { name: /Xem nội dung bộ đề/i }).first();
    await expect(revealBtn).toBeVisible();

    // Click to reveal preview
    await revealBtn.click();
    await expect(page.getByRole('button', { name: /Ẩn lại nội dung/i })).toBeVisible();
  });

  test('starts study session, answers questions, and receives instant feedback', async ({ page }) => {
    await page.goto('/');

    // Start study
    const startBtn = page.getByRole('button', { name: /Bắt đầu ôn tập/i }).first();
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Enters study session view
    await expect(page.getByText(/Câu 1 \/ 178/i)).toBeVisible();

    // Options A, B, C, D are visible
    const optionButtons = page.locator('button:has(span:text-matches("^[A-D]$"))');
    await expect(optionButtons.first()).toBeVisible();

    // Select first option
    await optionButtons.first().click();

    // Next button appears
    const nextBtn = page.getByRole('button', { name: /Câu tiếp theo|Tiếp tục/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Moves to Question 2
    await expect(page.getByText(/Câu 2 \/ 178/i)).toBeVisible();

    // Pause and return to home
    await page.getByRole('button', { name: /Tạm dừng/i }).click();
    await expect(page.getByRole('button', { name: /Tiếp tục lượt đang học/i })).toBeVisible();
  });

  test('navigates seamlessly between Study, Insights, and Releases tabs', async ({ page }) => {
    await page.goto('/');

    // Navigate to Insights
    await page.getByRole('button', { name: 'Thống kê', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: /Thống kê tiến trình học tập/i })).toBeVisible();

    // Navigate to Releases
    await page.getByRole('button', { name: 'Phiên bản', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: /Nhật ký phiên bản & Cập nhật/i })).toBeVisible();
    await expect(page.getByText(/v3.0.0/i).first()).toBeVisible();

    // Return to Study
    await page.getByRole('button', { name: 'Ôn tập', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: /Kinh tế học và Môi trường/i })).toBeVisible();
  });
});
