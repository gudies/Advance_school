export interface IBaseRepository<T> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: Omit<T, 'id'>): T;
  update(id: string, item: Partial<T>): T;
  delete(id: string): boolean;
  search(query: string, fields: (keyof T)[]): T[];
}
