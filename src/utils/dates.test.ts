import { describe, expect, it } from 'vitest';
import { addMinutes, timeSlots } from './dates';

describe('time slots', () => {
  it('adds minutes', () => {
    expect(addMinutes('17:00', 60)).toBe('18:00');
    expect(addMinutes('21:45', 30)).toBe('22:15');
  });
  it('lists 30-minute steps inclusive', () => {
    expect(timeSlots('17:00', '19:00')).toEqual(['17:00', '17:30', '18:00', '18:30', '19:00']);
    expect(timeSlots('17:00', '21:30')).toHaveLength(10);
  });
});
