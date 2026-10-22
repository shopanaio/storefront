import type { Warehouse } from './types';

const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** A closed day as the carrier returns it. */
const isClosed = (hours: string) => {
  const value = hours.trim();
  return value === '' || value === '-' || value === '0';
};

/** `08:00` as `8`, `08:30` as `8:30`; anything else as it came. */
const compactTime = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time.trim();
  const hour = String(Number(match[1]));
  return match[2] === '00' ? hour : `${hour}:${match[2]}`;
};

/** `08:00-21:00` as `8–21`; anything else as it came. */
const compactHours = (hours: string) => {
  const parts = hours.split('-');
  return parts.length === 2
    ? `${compactTime(parts[0])}–${compactTime(parts[1])}`
    : hours.trim();
};

/**
 * Opening hours as a short line that fits one line on a phone: consecutive days with the same
 * hours are joined, closed days are skipped, whole hours lose their minutes
 * (`Mon–Fri 8–20 · Sat 9–15`). Returns an empty string when the carrier gave no open day.
 */
export function formatSchedule(
  schedule: Warehouse['schedule'],
  dayLabel: (day: string) => string
): string {
  const days = [...schedule]
    .filter((item) => WEEK.includes(item.day))
    .sort((a, b) => WEEK.indexOf(a.day) - WEEK.indexOf(b.day));

  const ranges: Array<{ from: string; to: string; hours: string }> = [];
  for (const { day, hours } of days) {
    const last = ranges.at(-1);
    if (isClosed(hours)) {
      continue;
    }
    if (
      last &&
      last.hours === hours &&
      WEEK.indexOf(day) === WEEK.indexOf(last.to) + 1
    ) {
      last.to = day;
    } else {
      ranges.push({ from: day, to: day, hours });
    }
  }

  return ranges
    .map(({ from, to, hours }) =>
      from === to
        ? `${dayLabel(from)} ${compactHours(hours)}`
        : `${dayLabel(from)}–${dayLabel(to)} ${compactHours(hours)}`
    )
    .join(' · ');
}
