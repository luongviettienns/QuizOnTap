import { describe, it, expect } from 'vitest';
import { getOptionColor, OPTION_COLORS } from '../optionColors';

describe('Option Colors System (4 Signature Colors)', () => {
  it('returns distinct configurations for options 0, 1, 2, 3 (A, B, C, D)', () => {
    const optA = getOptionColor(0);
    const optB = getOptionColor(1);
    const optC = getOptionColor(2);
    const optD = getOptionColor(3);

    expect(optA.letter).toBe('A');
    expect(optA.name).toBe('Rose');
    expect(optA.badgeIdle).toContain('rose');

    expect(optB.letter).toBe('B');
    expect(optB.name).toBe('Sky');
    expect(optB.badgeIdle).toContain('sky');

    expect(optC.letter).toBe('C');
    expect(optC.name).toBe('Amber');
    expect(optC.badgeIdle).toContain('amber');

    expect(optD.letter).toBe('D');
    expect(optD.name).toBe('Emerald');
    expect(optD.badgeIdle).toContain('emerald');
  });

  it('provides reliable fallback for index >= 4 (E, F, ...)', () => {
    const optE = getOptionColor(4);
    expect(optE.letter).toBe('E');
    expect(optE.name).toBe('Indigo');
    expect(optE.badgeIdle).toContain('indigo');

    const optF = getOptionColor(5);
    expect(optF.letter).toBe('F');
  });

  it('includes cardHover, badgeSelected, and cardSelected in every config', () => {
    [0, 1, 2, 3].forEach((idx) => {
      const config = OPTION_COLORS[idx];
      expect(config.badgeIdle).toBeTruthy();
      expect(config.cardHover).toBeTruthy();
      expect(config.badgeSelected).toBeTruthy();
      expect(config.cardSelected).toBeTruthy();
    });
  });
});
