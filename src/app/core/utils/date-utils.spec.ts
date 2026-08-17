import { 
  getAppCurrentDate,
  getLocalISODate, 
  getLocalISODateTime, 
  getOffsetISODate, 
  getOffsetISODateTime, 
  parseLocalDate, 
  formatReadableDate, 
  formatReadableDateTime 
} from './date-utils';

describe('DateUtils', () => {
  it('should return February reference date from getAppCurrentDate', () => {
    const current = getAppCurrentDate();
    expect(current.getFullYear()).toBe(2026);
    expect(current.getMonth()).toBe(1); // February is index 1
    expect(current.getDate()).toBe(18);
  });

  it('should format date to local ISO format YYYY-MM-DD', () => {
    const testDate = new Date(2026, 1, 15); // Feb 15, 2026
    const iso = getLocalISODate(testDate);
    expect(iso).toBe('2026-02-15');
  });

  it('should default getLocalISODate to February 2026', () => {
    const iso = getLocalISODate();
    expect(iso).toBe('2026-02-18');
  });

  it('should format datetime to local ISO format YYYY-MM-DDTHH:mm', () => {
    const testDate = new Date(2026, 1, 15, 14, 30); // Feb 15, 2026 14:30
    const iso = getLocalISODateTime(testDate, 14, 30);
    expect(iso).toBe('2026-02-15T14:30');
  });

  it('should compute offset date correctly', () => {
    const baseDate = new Date(2026, 1, 18); // Feb 18, 2026
    const plus5 = getOffsetISODate(5, baseDate);
    expect(plus5).toBe('2026-02-23');

    const minus3 = getOffsetISODate(-3, baseDate);
    expect(minus3).toBe('2026-02-15');
  });

  it('should compute offset datetime correctly', () => {
    const baseDate = new Date(2026, 1, 18);
    const offsetDt = getOffsetISODateTime(2, 11, 45, baseDate);
    expect(offsetDt).toBe('2026-02-20T11:45');
  });

  it('should parse local date strings reliably', () => {
    const parsed = parseLocalDate('2026-02-20');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(1); // Feb is index 1
    expect(parsed.getDate()).toBe(20);
  });

  it('should parse local datetime strings reliably', () => {
    const parsed = parseLocalDate('2026-02-20T16:45');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(1);
    expect(parsed.getDate()).toBe(20);
    expect(parsed.getHours()).toBe(16);
    expect(parsed.getMinutes()).toBe(45);
  });

  it('should format human-readable date strings', () => {
    const formatted = formatReadableDate('2026-02-15');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Feb');
    expect(formatted).toContain('15');
  });

  it('should format human-readable datetime strings', () => {
    const formatted = formatReadableDateTime('2026-02-15T10:30');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Feb');
    expect(formatted).toContain('15');
    expect(formatted).toContain('10:30');
  });
});
