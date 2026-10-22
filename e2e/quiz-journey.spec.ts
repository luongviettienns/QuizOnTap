import { test, expect } from '@playwright/test';

test.describe('QuizOnTap V2 Core User Journey', () => {
  test('homepage renders and allows navigating between pages', async ({ page }) => {
    await page.goto('/');

    // Check title and hero
    await expect(page).toHaveTitle(/QuizOnTap/i);
    await expect(page.getByRole('heading', { name: /Ôn tập trắc nghiệm thông minh/i })).toBeVisible();

    // Check Quick Stats
    await expect(page.getByText(/Chuỗi ngày học liên tục/i)).toBeVisible();
    await expect(page.getByText(/Bộ đề trong thư viện/i)).toBeVisible();

    // Navigate to Thư viện
    await page.getByRole('button', { name: 'Thư viện', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: /Thư viện bộ đề ôn tập/i })).toBeVisible();

    // Navigate to Nhập đề
    await page.getByRole('button', { name: 'Nhập đề', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: /Kéo thả file hoặc dán văn bản/i })).toBeVisible();
  });

  test('allows creating and managing a quiz set', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Thư viện', exact: true }).first().click();

    // Click "Tạo bộ đề mới"
    const createBtn = page.getByRole('button', { name: /Tạo bộ đề mới/i }).first();
    await createBtn.click();

    // Modal opens
    await expect(page.getByRole('heading', { name: /Tạo bộ đề ôn tập mới/i })).toBeVisible();
    await page.getByPlaceholder(/Kinh tế học vi mô/i).fill('Đề thi thử Triết học Mác - Lênin');
    await page.getByPlaceholder(/Ghi chú về nguồn câu hỏi/i).fill('Bộ đề 10 câu ôn tập trọng tâm');
    await page.getByRole('button', { name: 'Tạo bộ đề', exact: true }).click();

    // Navigates to Set Detail
    await expect(page.getByRole('heading', { name: 'Đề thi thử Triết học Mác - Lênin' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thêm câu hỏi/i })).toBeVisible();

    // Return back to library
    await page.getByRole('button', { name: /Trở về Thư viện/i }).click();
    await expect(page.getByText('Đề thi thử Triết học Mác - Lênin')).toBeVisible();
  });

  test('seeds and launches default 179-question quiz set from hero', async ({ page }) => {
    await page.goto('/');

    // Click Hero CTA button
    const heroBtn = page.getByRole('button', { name: /Ôn tập ngay: Kinh tế học & Môi trường/i });
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();

    // Verify Set Detail page is shown
    await expect(page.getByRole('heading', { name: /Tài liệu ôn tập Kinh tế học và Môi trường/i })).toBeVisible();
    await expect(page.getByText('179').first()).toBeVisible();

    // Start Practice mode
    await page.getByRole('button', { name: /Luyện tập \(Drill\)/i }).click();

    // Verify practice session launched and progress indicator shows 179 questions
    await expect(page.getByText(/1 \/ 179/i)).toBeVisible();
  });
});

