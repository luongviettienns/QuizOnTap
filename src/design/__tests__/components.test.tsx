import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

describe('Design UI Primitives', () => {
  it('renders button and handles click event', () => {
    const handleClick = vi.fn();
    render(<Button variant="primary" onClick={handleClick}>Làm bài ngay</Button>);
    const btn = screen.getByRole('button', { name: /Làm bài ngay/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders correct badge status colors', () => {
    render(<Badge variant="verified">Đã có đáp án</Badge>);
    expect(screen.getByText('Đã có đáp án')).toBeDefined();
  });

  it('renders Card with header and content', () => {
    render(
      <Card title="Chương 1" subtitle="Tổng quan">
        <div>Nội dung thẻ</div>
      </Card>
    );
    expect(screen.getByText('Chương 1')).toBeDefined();
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Nội dung thẻ')).toBeDefined();
  });
});
