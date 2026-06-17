import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Student, AdmissionStatus, Status } from '../../../types';

export function useStudents() {
  const adapter = useMemo(() => new LocalStorageAdapter<Student>('advance_students'), []);
  const [students, setStudents] = useState<Student[]>(() => adapter.getAll());

  const refresh = useCallback(() => {
    setStudents(adapter.getAll());
  }, [adapter]);

  const getStudentById = useCallback((id: string) => {
    return adapter.getById(id);
  }, [adapter]);

  const enrollStudent = useCallback((studentData: Omit<Student, 'id' | 'studentId' | 'status' | 'admissionDate'>) => {
    const nextIdNum = adapter.count() + 1;
    const studentId = `ADV-2025-${String(nextIdNum).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `stu_${String(nextIdNum).padStart(3, '0')}`,
      studentId,
      status: 'enrolled',
      admissionDate: new Date().toISOString(),
    };
    
    // We bypass Omit since we are building it directly
    adapter.seed([...adapter.getAll(), newStudent]);
    refresh();
    return newStudent;
  }, [adapter, refresh]);

  const createAdmissionApplication = useCallback((studentData: Omit<Student, 'id' | 'studentId' | 'status' | 'admissionDate'>) => {
    const nextIdNum = adapter.count() + 1;
    const studentId = `ADV-APP-${String(nextIdNum).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `stu_${String(nextIdNum).padStart(3, '0')}`,
      studentId,
      status: 'applied',
      admissionDate: new Date().toISOString(),
    };
    
    adapter.seed([...adapter.getAll(), newStudent]);
    refresh();
    return newStudent;
  }, [adapter, refresh]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    adapter.update(id, updates);
    refresh();
  }, [adapter, refresh]);

  const deleteStudent = useCallback((id: string) => {
    const success = adapter.delete(id);
    if (success) {
      refresh();
    }
    return success;
  }, [adapter, refresh]);

  const updateAdmissionStatus = useCallback((id: string, status: AdmissionStatus | Status) => {
    const student = adapter.getById(id);
    if (!student) return;

    const updates: Partial<Student> = { status };
    // If transitioning to enrolled, generate official studentId
    if (status === 'enrolled' && student.studentId.startsWith('ADV-APP')) {
      const nextIdNum = adapter.getAll().filter(s => s.status === 'enrolled').length + 1;
      updates.studentId = `ADV-2025-${String(nextIdNum).padStart(3, '0')}`;
      updates.admissionDate = new Date().toISOString();
    }

    adapter.update(id, updates);
    refresh();
  }, [adapter, refresh]);

  return {
    students,
    refresh,
    getStudentById,
    enrollStudent,
    createAdmissionApplication,
    updateStudent,
    deleteStudent,
    updateAdmissionStatus,
  };
}
