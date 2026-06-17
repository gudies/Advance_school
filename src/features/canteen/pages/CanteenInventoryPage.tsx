import { useState, useMemo } from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, Column } from '../../../components/data-display/DataTable';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { StatCard } from '../../../components/data-display/StatCard';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { InventoryItem, CURRENCY_SYMBOL } from '../../../types';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Package, Plus, PackageCheck, AlertOctagon, RotateCcw } from 'lucide-react';

export default function CanteenInventoryPage() {
  const addToast = useNotificationStore((state) => state.addToast);
  const adapter = useMemo(() => new LocalStorageAdapter<InventoryItem>('advance_canteen_inventory'), []);

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const list = adapter.getAll();
    if (list.length === 0) {
      const seed: InventoryItem[] = [
        { id: 'inv_1', name: 'Waakye Rice', category: 'raw_food', quantityInStock: 8, unit: 'bags', minimumThreshold: 3, lastRestocked: '2026-06-01', costPerUnit: 450.00 },
        { id: 'inv_2', name: 'Fresh Chicken pieces', category: 'meat', quantityInStock: 45, unit: 'kg', minimumThreshold: 15, lastRestocked: '2026-06-12', costPerUnit: 45.00 },
        { id: 'inv_3', name: 'Sobolo Leaves', category: 'ingredients', quantityInStock: 2, unit: 'bags', minimumThreshold: 4, lastRestocked: '2026-05-20', costPerUnit: 120.00 },
        { id: 'inv_4', name: 'Vegetable Cooking Oil', category: 'ingredients', quantityInStock: 25, unit: 'liters', minimumThreshold: 10, lastRestocked: '2026-06-08', costPerUnit: 35.00 },
        { id: 'inv_5', name: 'Meat Pie Baked Dough', category: 'prepared', quantityInStock: 120, unit: 'pieces', minimumThreshold: 50, lastRestocked: '2026-06-14', costPerUnit: 5.00 },
        { id: 'inv_6', name: 'Ripe Plantain bunches', category: 'raw_food', quantityInStock: 3, unit: 'pieces', minimumThreshold: 8, lastRestocked: '2026-06-10', costPerUnit: 15.00 }
      ];
      seed.forEach(x => adapter.create(x));
      return seed;
    }
    return list;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('raw_food');
  const [quantityInStock, setQuantityInStock] = useState('0');
  const [unit, setUnit] = useState<'kg' | 'liters' | 'pieces' | 'bags'>('kg');
  const [minimumThreshold, setMinimumThreshold] = useState('5');
  const [costPerUnit, setCostPerUnit] = useState('0');

  const refreshInventory = () => {
    setInventory(adapter.getAll());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `inv_${Math.random().toString(36).substring(7)}`,
      name,
      category,
      quantityInStock: Number(quantityInStock),
      unit,
      minimumThreshold: Number(minimumThreshold),
      lastRestocked: new Date().toISOString().split('T')[0],
      costPerUnit: Number(costPerUnit)
    };

    adapter.create(newItem);
    refreshInventory();
    setIsModalOpen(false);

    // Clear fields
    setName('');
    setCategory('raw_food');
    setQuantityInStock('0');
    setUnit('kg');
    setMinimumThreshold('5');
    setCostPerUnit('0');

    addToast({
      type: 'success',
      message: 'New inventory item added successfully!'
    });
  };

  const handleRestock = (id: string, amount: number) => {
    const item = adapter.getById(id);
    if (item) {
      adapter.update(id, {
        quantityInStock: item.quantityInStock + amount,
        lastRestocked: new Date().toISOString().split('T')[0]
      });
      refreshInventory();
      addToast({
        type: 'success',
        message: `Restocked ${item.name} by ${amount} ${item.unit}.`
      });
    }
  };

  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.quantityInStock <= i.minimumThreshold).length;
    const totalValue = inventory.reduce((sum, i) => sum + i.quantityInStock * i.costPerUnit, 0);
    return {
      totalItems,
      lowStockItems,
      totalValue
    };
  }, [inventory]);

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-lg shrink-0">
            <Package size={16} />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
            <div className="text-[10px] text-slate-400 capitalize">{row.category.replace('_', ' ')}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Stock Level',
      accessorKey: 'quantityInStock',
      cell: (row) => {
        const isLow = row.quantityInStock <= row.minimumThreshold;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
              {row.quantityInStock} {row.unit}
            </span>
            {isLow && (
              <Badge variant="danger" className="text-[9px] uppercase tracking-wide">Low Stock</Badge>
            )}
          </div>
        );
      }
    },
    {
      header: 'Min Threshold',
      accessorKey: 'minimumThreshold',
      cell: (row) => (
        <span className="text-xs text-slate-500">{row.minimumThreshold} {row.unit}</span>
      )
    },
    {
      header: 'Unit Cost',
      accessorKey: 'costPerUnit',
      cell: (row) => (
        <span className="font-mono text-xs">
          {CURRENCY_SYMBOL}{row.costPerUnit.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Last Restocked',
      accessorKey: 'lastRestocked',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.lastRestocked}</span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="py-1 px-2 text-xs"
            onClick={() => handleRestock(row.id, row.unit === 'pieces' ? 50 : 10)}
          >
            <RotateCcw size={12} className="mr-1" /> Quick Restock
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageWrapper
      title="Canteen Inventory Management"
      subtitle="Monitor ingredient stock levels, evaluate cost holdings, and record restocking schedules."
      breadcrumbs={[
        { label: 'Canteen Management', path: '/canteen' },
        { label: 'Inventory' }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Inventory Items"
          value={stats.totalItems}
          icon={<PackageCheck className="text-primary-500" />}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={<AlertOctagon className="text-rose-500" />}
          className={stats.lowStockItems > 0 ? 'bg-rose-50/10 border-rose-200' : ''}
        />
        <StatCard
          title="Total Holdings Value"
          value={`${CURRENCY_SYMBOL}${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<Package className="text-success-500" />}
        />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex-between">
          <CardTitle>Kitchen Inventory List</CardTitle>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {inventory.length > 0 ? (
            <DataTable data={inventory} columns={columns} />
          ) : (
            <div className="p-6">
              <EmptyState
                title="No Inventory Items"
                description="There are currently no items tracked in the canteen inventory."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Item"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Broken Rice, Plantains..."
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'raw_food', label: 'Raw Ingredients & Grains' },
              { value: 'meat', label: 'Meat & Poultry' },
              { value: 'ingredients', label: 'Spices, Shito & Oil' },
              { value: 'drink', label: 'Beverage Raw Materials' },
              { value: 'prepared', label: 'Pre-baked / Prepared Snacks' }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Initial Stock Quantity"
              type="number"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(e.target.value)}
              required
            />
            <Select
              label="Stock Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'kg' | 'liters' | 'pieces' | 'bags')}
              options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'liters', label: 'Liters' },
                { value: 'pieces', label: 'Pieces / Units' },
                { value: 'bags', label: 'Bags' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Reorder Threshold"
              type="number"
              value={minimumThreshold}
              onChange={(e) => setMinimumThreshold(e.target.value)}
              required
            />
            <Input
              label={`Cost per Unit (${CURRENCY_SYMBOL})`}
              type="number"
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Item
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
