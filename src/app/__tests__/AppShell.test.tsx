import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from '../AppShell';

describe('AppShell Component', () => {
  it('renders application header and main navigation items', () => {
    render(
      <AppShell currentPath="/" onNavigate={() => {}}>
        <div data-testid="page-content">Home Content</div>
      </AppShell>
    );
    expect(screen.getAllByText(/QuizOnTap/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('page-content')).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Tổng quan/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /Thư viện/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /Nhập đề/i }).length).toBeGreaterThanOrEqual(1);
  });
});
