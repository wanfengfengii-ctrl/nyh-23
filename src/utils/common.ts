import type { StatusColor, StatusColorMap, PaginationResult } from '../types/base';

export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

export function generateNo(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 <= end2 && start2 <= end1;
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function getMonthStart(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

export function getNextMonthStart(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];
}

export function getStatusColorFromMap(
  status: string,
  colorMap: StatusColorMap,
  defaultColor: StatusColor = 'default'
): StatusColor {
  return colorMap[status] || defaultColor;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function getSafePage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  if (page < 0) return 0;
  if (page >= totalPages) return totalPages - 1;
  return page;
}

export function calculatePageAfterDelete(
  currentPage: number,
  currentPageSize: number,
  totalAfterDelete: number
): number {
  const totalPages = Math.ceil(totalAfterDelete / currentPageSize);
  return getSafePage(currentPage, totalPages);
}

export function countByField<T>(items: T[], field: keyof T): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = String(item[field]);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function countByFieldValue<T>(items: T[], field: keyof T, value: string): number {
  return items.filter((item) => String(item[field]) === value).length;
}

export function countByCondition<T>(items: T[], condition: (item: T) => boolean): number {
  return items.filter(condition).length;
}

export function buildSearchFilter<T>(
  searchFields: (keyof T)[],
  searchTerm: string
): (item: T) => boolean {
  if (!searchTerm.trim()) return () => true;
  const lowerSearch = searchTerm.toLowerCase();
  return (item) =>
    searchFields.some((field) =>
      String(item[field] || '').toLowerCase().includes(lowerSearch)
    );
}

export function buildDateRangeFilter<T>(
  dateField: keyof T,
  dateRange: [string, string] | null
): (item: T) => boolean {
  if (!dateRange || !dateRange[0] || !dateRange[1]) return () => true;
  return (item) => {
    const date = String(item[dateField] || '');
    return date >= dateRange[0] && date <= dateRange[1];
  };
}

export function buildDateRangeOverlapFilter<T>(
  startField: keyof T,
  endField: keyof T,
  dateRange: [string, string] | null
): (item: T) => boolean {
  if (!dateRange || !dateRange[0] || !dateRange[1]) return () => true;
  return (item) => {
    const start = String(item[startField] || '');
    const end = String(item[endField] || '');
    if (!start || !end) return true;
    return start <= dateRange[1] && end >= dateRange[0];
  };
}
