import React, { useState } from 'react';
import { useFees } from '../hooks/useFees';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { CLASS_LEVELS, TERMS, ACADEMIC_YEAR, CURRENCY_SYMBOL, FeeStructure, FeeItem, ClassLevel, Term } from '../../../types';
import { Plus, Trash2, Settings, List } from 'lucide-react';

export default function FeeSetupPage() {
  const { feeStructures, addFeeStructure } = useFees();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [classLevel, setClassLevel] = useState<ClassLevel>(CLASS_LEVELS[0]);
  const [term, setTerm] = useState<Term>(TERMS[0]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR);
  const [items, setItems] = useState<Omit<FeeItem, 'id'>[]>([
    { category: 'tuition', description: 'Tuition Fee', amount: 0, mandatory: true }
  ]);

  const handleAddItem = () => {
    setItems([...items, { category: 'tuition', description: '', amount: 0, mandatory: false }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<FeeItem, 'id'>, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    
    const newStructure: Omit<FeeStructure, 'id'> = {
      classLevel,
      term,
      academicYear,
      totalAmount,
      items: items.map((item, i) => ({ ...item, id: `temp_${Date.now()}_${i}` }))
    };

    addFeeStructure(newStructure);
    setIsModalOpen(false);
    // Reset form
    setItems([{ category: 'tuition', description: 'Tuition Fee', amount: 0, mandatory: true }]);
  };

  return (
    <PageWrapper
      title="Fee Structure Setup"
      subtitle="Configure fee requirements for different classes and terms."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Fees', path: '/fees' },
        { label: 'Setup' },
      ]}
      action={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Fee Structure
        </Button>
      }
    >
      <div className="space-y-6">
        {feeStructures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeStructures.map(fs => (
              <Card key={fs.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex-between border-b border-border-secondary pb-4">
                  <div>
                    <CardTitle>{fs.classLevel}</CardTitle>
                    <p className="text-xs text-secondary mt-1">{fs.term} | {fs.academicYear}</p>
                  </div>
                  <Badge variant="primary">{fs.items.length} Items</Badge>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3 mb-4">
                    {fs.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex-between text-sm">
                        <span className="text-secondary">{item.description}</span>
                        <span className="font-medium">{CURRENCY_SYMBOL}{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {fs.items.length > 3 && (
                      <p className="text-xs text-tertiary italic">+ {fs.items.length - 3} more items...</p>
                    )}
                  </div>
                  <div className="flex-between border-t border-border-secondary pt-4 mt-auto">
                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="font-bold text-lg text-primary-600">{CURRENCY_SYMBOL}{fs.totalAmount.toLocaleString()}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No Fee Structures" 
            description="You haven't configured any fee structures yet. Create one to start billing students."
            icon={<Settings size={48} />}
          />
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Fee Structure" size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-3 gap-4">
              <Select 
                label="Class Level" 
                value={classLevel} 
                onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                options={CLASS_LEVELS.map(c => ({ label: c, value: c }))}
                required
              />
              <Select 
                label="Term" 
                value={term} 
                onChange={(e) => setTerm(e.target.value as Term)}
                options={TERMS.map(t => ({ label: t, value: t }))}
                required
              />
              <Input 
                label="Academic Year" 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex-between mb-4 border-b border-border-secondary pb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <List size={18} /> Fee Items
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-3 p-3 bg-surface-secondary rounded-lg border border-border-secondary">
                    <div className="flex-1">
                      <Select 
                        label="Category"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        options={[
                          { value: 'tuition', label: 'Tuition' },
                          { value: 'books', label: 'Books & Stationery' },
                          { value: 'uniform', label: 'Uniform' },
                          { value: 'feeding', label: 'Feeding' },
                          { value: 'transport', label: 'Transport' },
                          { value: 'ict', label: 'ICT & Lab' },
                          { value: 'sports', label: 'Sports & Entertainment' },
                          { value: 'exam', label: 'Examination' },
                          { value: 'pta', label: 'PTA Dues' },
                          { value: 'development_levy', label: 'Development Levy' },
                        ]}
                      />
                    </div>
                    <div className="flex-[2]">
                      <Input 
                        label="Description"
                        placeholder="e.g. Termly Tuition Fee"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        label={`Amount (${CURRENCY_SYMBOL})`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="flex items-center pb-3 px-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.mandatory}
                          onChange={(e) => handleItemChange(index, 'mandatory', e.target.checked)}
                          className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                        />
                        <span className="text-sm font-medium">Mandatory</span>
                      </label>
                    </div>
                    {items.length > 1 && (
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm" 
                        className="mb-1"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="bg-primary-50 text-primary-900 px-4 py-3 rounded-lg flex items-center gap-4 border border-primary-200">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold font-heading">
                    {CURRENCY_SYMBOL}{items.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Fee Structure</Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
