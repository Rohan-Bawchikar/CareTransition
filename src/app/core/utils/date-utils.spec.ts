import { 
  getLocalISODate, 
  getLocalISODateTime, 
  getOffsetISODate, 
  getOffsetISODateTime, 
  parseLocalDate, 
  formatReadableDate, 
  formatReadableDateTime 
} from './date-utils';

describe('DateUtils', () => {
  it('should format date to local ISO format YYYY-MM-DD', () => {
    const testDate = new Date(2026, 4, 15); // May 15, 2026
    const iso = getLocalISODate(testDate);
    expect(iso).toBe('2026-05-15');
  });

  it('should format datetime to local ISO format YYYY-MM-DDTHH:mm', () => {
    const testDate = new Date(2026, 4, 15, 14, 30); // May 15, 2026 14:30
    const iso = getLocalISODateTime(testDate, 14, 30);
    expect(iso).toBe('2026-05-15T14:30');
  });

  it('should compute offset date correctly', () => {
    const baseDate = new Date(2026, 0, 10); // Jan 10, 2026
    const plus5 = getOffsetISODate(5, baseDate);
    expect(plus5).toBe('2026-01-15');

    const minus3 = getOffsetISODate(-3, baseDate);
    expect(minus3).toBe('2026-01-07');
  });

  it('should compute offset datetime correctly', () => {
    const baseDate = new Date(2026, 0, 10);
    const offsetDt = getOffsetISODateTime(2, 11, 45, baseDate);
    expect(offsetDt).toBe('2026-01-12T11:45');
  });

  it('should parse local date strings reliably', () => {
    const parsed = parseLocalDate('2026-06-20');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5); // June is index 5
    expect(parsed.getDate()).toBe(20);
  });

  it('should parse local datetime strings reliably', () => {
    const parsed = parseLocalDate('2026-06-20T16:45');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(20);
    expect(parsed.getHours()).toBe(16);
    expect(parsed.getMinutes()).toBe(45);
  });

  it('should format human-readable date strings', () => {
    const formatted = formatReadableDate('2026-08-15');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('15');
  });

  it('should format human-readable datetime strings', () => {
    const formatted = formatReadableDateTime('2026-08-15T10:30');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('15');
    expect(formatted).toContain('10:30');
  });
});
