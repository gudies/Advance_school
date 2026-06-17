import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Staff } from '../../../types';

export function useStaff() {
  const adapter = useMemo(() => new LocalStorageAdapter<Staff>('advance_staff'), []);
  const [staffList, setStaffList] = useState<Staff[]>(() => adapter.getAll());

  const refresh = useCallback(() => {
    setStaffList(adapter.getAll());
  }, [adapter]);

  const getStaffById = useCallback((id: string) => {
    return adapter.getById(id);
  }, [adapter]);

  const registerStaff = useCallback((staffData: Omit<Staff, 'id' | 'staffId' | 'status' | 'dateOfEmployment'>) => {
    const nextIdNum = adapter.count() + 1;
    const staffId = `STF-${String(nextIdNum).padStart(3, '0')}`;
    const newStaff: Staff = {
      ...staffData,
      id: `stf_${String(nextIdNum).padStart(3, '0')}`,
      staffId,
      status: 'active',
      dateOfEmployment: new Date().toISOString(),
    };

    adapter.seed([...adapter.getAll(), newStaff]);
    refresh();
    return newStaff;
  }, [adapter, refresh]);

  const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
    adapter.update(id, updates);
    refresh();
  }, [adapter, refresh]);

  const deleteStaff = useCallback((id: string) => {
    const success = adapter.delete(id);
    if (success) {
      refresh();
    }
    return success;
  }, [adapter, refresh]);

  return {
    staffList,
    refresh,
    getStaffById,
    registerStaff,
    updateStaff,
    deleteStaff,
  };
}
