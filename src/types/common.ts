export type ID = string;
export type DateString = string; // ISO 8601
export type Currency = number;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: string | number | boolean;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith';
}

export interface SelectOption {
  value: string;
  label: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE = 'GHS';

export const TERMS = ['Term 1', 'Term 2', 'Term 3'] as const;
export type Term = typeof TERMS[number];

export const CLASS_LEVELS = [
  'Nursery 1', 'Nursery 2',
  'KG 1', 'KG 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JHS 1', 'JHS 2', 'JHS 3',
  'SS 1', 'SS 2', 'SS 3'
] as const;
export type ClassLevel = typeof CLASS_LEVELS[number];

export const ACADEMIC_YEAR = '2025/2026';
