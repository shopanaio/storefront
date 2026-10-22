import { describe, expect, it } from 'vitest';
import { formatSchedule } from './schedule';

const day = (name: string, hours: string) => ({
  __typename: 'NovaPoshtaScheduleDay' as const,
  day: name,
  hours,
});

describe('formatSchedule', () => {
  it('joins consecutive days with the same hours and skips closed days', () => {
    expect(
      formatSchedule(
        [
          day('Monday', '08:00-20:00'),
          day('Tuesday', '08:00-20:00'),
          day('Wednesday', '08:00-20:00'),
          day('Thursday', '08:00-20:00'),
          day('Friday', '08:00-20:00'),
          day('Saturday', '09:00-15:00'),
          day('Sunday', '-'),
        ],
        (name) => name.slice(0, 3)
      )
    ).toBe('Mon–Fri 8–20 · Sat 9–15');
  });

  it('does not join days separated by a closed day', () => {
    expect(
      formatSchedule(
        [
          day('Monday', '10:00-18:00'),
          day('Tuesday', '-'),
          day('Wednesday', '10:00-18:00'),
        ],
        (name) => name.slice(0, 2)
      )
    ).toBe('Mo 10–18 · We 10–18');
  });

  it('keeps the minutes of hours that are not whole', () => {
    expect(
      formatSchedule(
        [day('Monday', '08:30-19:45'), day('Tuesday', '24 hours')],
        (name) => name.slice(0, 3)
      )
    ).toBe('Mon 8:30–19:45 · Tue 24 hours');
  });

  it('is empty without open days', () => {
    expect(formatSchedule([], (name) => name)).toBe('');
  });
});
