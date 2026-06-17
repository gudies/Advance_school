import { IBaseRepository } from '../repositories/baseRepository';
import { pushToFirebase } from './firebaseSync';

export class LocalStorageAdapter<T extends { id: string }> implements IBaseRepository<T> {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  private getItems(): T[] {
    try {
      const items = localStorage.getItem(this.storageKey);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error(`Error reading from localStorage [${this.storageKey}]:`, error);
      return [];
    }
  }

  private saveItems(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      // Background sync to remote cloud database (non-blocking)
      pushToFirebase(this.storageKey, items);
    } catch (error) {
      console.error(`Error saving to localStorage [${this.storageKey}]:`, error);
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  getAll(): T[] {
    return this.getItems();
  }

  getById(id: string): T | null {
    const items = this.getItems();
    return items.find((item) => item.id === id) || null;
  }

  create(item: Omit<T, 'id'>): T {
    const items = this.getItems();
    const newItem = {
      ...item,
      id: this.generateId(),
    } as unknown as T;
    
    items.push(newItem);
    this.saveItems(items);
    return newItem;
  }

  update(id: string, itemUpdate: Partial<T>): T {
    const items = this.getItems();
    const index = items.findIndex((item) => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${this.storageKey}`);
    }
    
    const updatedItem = { ...items[index], ...itemUpdate };
    items[index] = updatedItem;
    this.saveItems(items);
    
    return updatedItem;
  }

  delete(id: string): boolean {
    const items = this.getItems();
    const initialLength = items.length;
    const filteredItems = items.filter((item) => item.id !== id);
    
    if (filteredItems.length !== initialLength) {
      this.saveItems(filteredItems);
      return true;
    }
    
    return false;
  }

  search(query: string, fields: (keyof T)[]): T[] {
    const items = this.getItems();
    if (!query) return items;
    
    const lowerQuery = query.toLowerCase();
    
    return items.filter((item) => {
      return fields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }

  // Helper methods
  getByField<K extends keyof T>(field: K, value: T[K]): T[] {
    const items = this.getItems();
    return items.filter((item) => item[field] === value);
  }

  getWhere(predicate: (item: T) => boolean): T[] {
    const items = this.getItems();
    return items.filter(predicate);
  }

  count(): number {
    return this.getItems().length;
  }

  clear(): void {
    this.saveItems([]);
  }

  // Used for seeding data
  seed(items: T[]): void {
    this.saveItems(items);
  }
}
