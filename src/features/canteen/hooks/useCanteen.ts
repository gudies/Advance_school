import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { MenuItem, MealRecord } from '../../../types/canteen';
import { Student } from '../../../types/student';

export function useCanteen() {
  const menuAdapter = useMemo(() => new LocalStorageAdapter<MenuItem>('advance_canteen_menu'), []);
  const saleAdapter = useMemo(() => new LocalStorageAdapter<MealRecord>('advance_canteen_sales'), []);
  const studentAdapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const all = menuAdapter.getAll();
    if (all.length === 0) {
      // Seed default menu
      const seed: MenuItem[] = [
        { id: 'item_1', name: 'Waakye with Fish & Egg', description: 'Traditional Ghanaian rice and beans dish served with shito, fish, and boiled egg.', category: 'lunch', price: 25.00, isAvailable: true },
        { id: 'item_2', name: 'Jollof Rice with Grilled Chicken', description: 'Spicy savory jollof rice served with grilled chicken piece and salad.', category: 'lunch', price: 30.00, isAvailable: true },
        { id: 'item_3', name: 'Sobolo Drink', description: 'Local hibiscus tea beverage sweetened with ginger and pineapple syrup.', category: 'drink', price: 8.00, isAvailable: true },
        { id: 'item_4', name: 'Meat Pie', description: 'Baked pastry filled with seasoned minced beef and carrots.', category: 'snack', price: 12.00, isAvailable: true },
        { id: 'item_5', name: 'Fried Plantain & Bean Stew (Red Red)', description: 'Fried ripe plantain served with black-eyed pea bean stew in palm oil.', category: 'lunch', price: 20.00, isAvailable: true },
        { id: 'item_6', name: 'Pancakes & Syrup', description: 'Two fluffy pancakes served with butter and maple syrup.', category: 'breakfast', price: 15.00, isAvailable: true }
      ];
      seed.forEach(x => menuAdapter.create(x));
      return menuAdapter.getAll();
    }
    return all;
  });

  const [sales, setSales] = useState<MealRecord[]>(() => {
    const all = saleAdapter.getAll();
    if (all.length === 0) {
      const seed: MealRecord[] = [
        {
          id: 'sale_1',
          studentId: 'stu_001',
          menuItemId: 'item_2',
          date: new Date().toISOString(),
          quantity: 1,
          totalPrice: 30.00,
          paymentMethod: 'prepaid'
        },
        {
          id: 'sale_2',
          studentId: 'stu_002',
          menuItemId: 'item_3',
          date: new Date().toISOString(),
          quantity: 2,
          totalPrice: 16.00,
          paymentMethod: 'cash'
        }
      ];
      seed.forEach(x => saleAdapter.create(x));
      return saleAdapter.getAll();
    }
    return all;
  });

  const refreshMenu = useCallback(() => {
    setMenuItems(menuAdapter.getAll());
  }, [menuAdapter]);

  const refreshSales = useCallback(() => {
    setSales(saleAdapter.getAll());
  }, [saleAdapter]);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item_${Math.random().toString(36).substring(7)}`
    };
    menuAdapter.create(newItem);
    refreshMenu();
  }, [menuAdapter, refreshMenu]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    menuAdapter.update(id, updates);
    refreshMenu();
  }, [menuAdapter, refreshMenu]);

  const recordSale = useCallback((studentId: string, menuItemId: string, quantity: number, paymentMethod: 'prepaid' | 'cash') => {
    const item = menuAdapter.getById(menuItemId);
    if (!item) throw new Error('Menu item not found');

    const total = item.price * quantity;

    if (paymentMethod === 'prepaid') {
      const student = studentAdapter.getById(studentId);
      if (!student) throw new Error('Student not found');
      // In a real database, we would check and deduct the student wallet balance here
      // For this mock environment, we log the transaction as successful
    }

    const newSale: MealRecord = {
      id: `sale_${Math.random().toString(36).substring(7)}`,
      studentId,
      menuItemId,
      date: new Date().toISOString(),
      quantity,
      totalPrice: total,
      paymentMethod
    };

    saleAdapter.create(newSale);
    refreshSales();
  }, [menuAdapter, saleAdapter, studentAdapter, refreshSales]);

  const canteenStats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalOrders = sales.length;
    
    // Top selling items calculation
    const itemCounts: Record<string, number> = {};
    sales.forEach(s => {
      itemCounts[s.menuItemId] = (itemCounts[s.menuItemId] || 0) + s.quantity;
    });

    let topItem = 'N/A';
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([itemId, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        const matched = menuItems.find(m => m.id === itemId);
        if (matched) {
          topItem = matched.name;
        }
      }
    });

    return {
      totalRevenue,
      totalOrders,
      topItem,
      maxQty
    };
  }, [sales, menuItems]);

  return {
    menuItems,
    sales,
    addMenuItem,
    updateMenuItem,
    recordSale,
    canteenStats,
    refreshMenu,
    refreshSales
  };
}
