import { ID, DateString, Currency } from './common';

export type MenuCategory = 'breakfast' | 'lunch' | 'snack' | 'drink';

export interface MenuItem {
  id: ID;
  name: string;
  description: string;
  category: MenuCategory;
  price: Currency;
  isAvailable: boolean;
  image?: string;
}

export interface MealRecord {
  id: ID;
  studentId: ID;
  menuItemId: ID;
  date: DateString;
  quantity: number;
  totalPrice: Currency;
  paymentMethod: 'prepaid' | 'cash';
}

export interface InventoryItem {
  id: ID;
  name: string;
  category: string;
  quantityInStock: number;
  unit: 'kg' | 'liters' | 'pieces' | 'bags';
  minimumThreshold: number;
  lastRestocked: DateString;
  costPerUnit: Currency;
}

export interface SalesRecord {
  id: ID;
  date: DateString;
  menuItemId: ID;
  quantitySold: number;
  totalRevenue: Currency;
}

export interface DailySalesSummary {
  date: DateString;
  totalRevenue: Currency;
  topSellingItems: { name: string; quantity: number }[];
  totalMealsServed: number;
}
