import { useState } from 'react';
import { useCanteen } from '../hooks/useCanteen';
import { MenuItem } from '../../../types/canteen';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Plus, Edit2 } from 'lucide-react';

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem } = useCanteen();
  const addToast = useNotificationStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'breakfast' | 'lunch' | 'snack' | 'drink'>('lunch');
  const [isAvailable, setIsAvailable] = useState(true);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('lunch');
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategory(item.category);
    setIsAvailable(item.isAvailable);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      addToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    const itemPrice = Number(price) || 0;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name,
        description,
        price: itemPrice,
        category,
        isAvailable
      });
      addToast({ type: 'success', message: `Menu item "${name}" updated successfully.` });
    } else {
      addMenuItem({
        name,
        description,
        price: itemPrice,
        category,
        isAvailable
      });
      addToast({ type: 'success', message: `Menu item "${name}" added to canteen.` });
    }

    setIsModalOpen(false);
  };

  const handleToggleAvailability = (id: string, currentVal: boolean, name: string) => {
    updateMenuItem(id, { isAvailable: !currentVal });
    addToast({
      type: 'success',
      message: `"${name}" is now marked as ${!currentVal ? 'Available' : 'Unavailable'}`
    });
  };

  const breadcrumbs = [
    { label: 'Canteen Management', path: '/canteen' },
    { label: 'Menu Setup' }
  ];

  return (
    <PageWrapper
      title="Menu Setup"
      subtitle="Manage kitchen meal offerings, categories, prices, and inventory availability."
      breadcrumbs={breadcrumbs}
      action={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleOpenAddModal}
        >
          Add Menu Item
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-2 bg-gradient-to-r from-primary-500 to-indigo-600 shrink-0" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</CardTitle>
                    <Badge variant={item.category === 'lunch' ? 'success' : item.category === 'breakfast' ? 'warning' : 'primary'} className="capitalize">
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="py-2 space-y-2">
                  <p className="text-xs text-slate-500 font-light leading-relaxed min-h-[40px]">{item.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Price tag:</span>
                    <span className="font-extrabold text-primary-600 text-sm">{CURRENCY_SYMBOL}{item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Stock Status:</span>
                    <Badge variant={item.isAvailable ? 'success' : 'danger'}>
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </CardBody>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-border-secondary flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAvailability(item.id, item.isAvailable, item.name)}
                  className="text-[10px] h-7 px-2"
                >
                  {item.isAvailable ? 'Set Out of Stock' : 'Set Available'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={12} />}
                  onClick={() => handleOpenEditModal(item)}
                  className="text-[10px] h-7 px-2"
                >
                  Edit Item
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Canteen Item' : 'Add New Canteen Item'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Dish / Meal Name"
              placeholder="e.g. Red Red with Plantain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Description"
              placeholder="Detail ingredients or size..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`Price (${CURRENCY_SYMBOL})`}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <Select
                label="Food Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuItem['category'])}
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch / Entrees' },
                  { value: 'snack', label: 'Snacks / Bites' },
                  { value: 'drink', label: 'Drinks / Beverages' }
                ]}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isAvailable"
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-border-secondary"
              />
              <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mark as currently available / in stock
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {editingItem ? 'Save Updates' : 'Add to Canteen'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
