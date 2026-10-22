import { test, expect } from '@playwright/test';

test.describe('QuizOnTap V3 Locked Preview & Route Protection', () => {
  test('locked preview hides question content from DOM until revealed', async ({ page }) => {
    await page.goto('/');

    // Before clicking reveal, questions should not exist in the DOM
    const questionHeaders = page.locator('h3:has-text("Chương")');
    await expect(questionHeaders).toHaveCount(0);

    // Click "Xem nội dung bộ đề"
    await page.getByRole('button', { name: /Xem nội dung bộ đề/i }).first().click();

    // After reveal, questions become visible in DOM
    await expect(page.getByText(/Đang hiển thị toàn bộ 178 câu hỏi/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Ẩn lại nội dung/i })).toBeVisible();

    // Verify correct option marker exists in preview
    await expect(page.getByText('✓ Đúng').first()).toBeVisible();

    // Click "Ẩn lại nội dung" to re-lock
    await page.getByRole('button', { name: /Ẩn lại nội dung/i }).first().click();

    // After re-locking, question list is removed from DOM again
    await expect(page.getByText(/Nội dung câu hỏi và đáp án đang được khóa/i)).toBeVisible();
  });

  test('legacy routes redirect to home without breaking', async ({ page }) => {
    // Navigate to legacy import route
    await page.goto('/#/import');
    await expect(page.getByRole('heading', { name: /Kinh tế học và Môi trường/i })).toBeVisible();

    // Navigate to legacy library route
    await page.goto('/#/library');
    await expect(page.getByRole('heading', { name: /Kinh tế học và Môi trường/i })).toBeVisible();

    // Navigate to legacy review route
    await page.goto('/#/review');
    await expect(page.getByRole('heading', { name: /Kinh tế học và Môi trường/i })).toBeVisible();
  });
});
