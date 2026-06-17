import { useState, useCallback, useMemo } from 'react';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { User } from '../../../types/auth';
import { ClassLevel, Term } from '../../../types/common';
import { LeaveRequest } from '../../../types/staff';
import { Expense } from '../../../types/finance';

export interface SchoolSettings {
  id: string;
  schoolName: string;
  academicYear: string;
  activeTerm: Term;
  classLevels: Record<ClassLevel, boolean>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

const DEFAULT_SETTINGS: SchoolSettings = {
  id: 'global',
  schoolName: 'Camied Behills International School',
  academicYear: '2025/2026',
  activeTerm: 'Term 2',
  classLevels: {
    'Nursery 1': true, 'Nursery 2': true,
    'KG 1': true, 'KG 2': true,
    'Primary 1': true, 'Primary 2': true, 'Primary 3': true, 'Primary 4': true, 'Primary 5': true, 'Primary 6': true,
    'JHS 1': true, 'JHS 2': true, 'JHS 3': true,
    'SS 1': true, 'SS 2': true, 'SS 3': true
  }
};

export function useAdmin() {
  const usersAdapter = useMemo(() => new LocalStorageAdapter<User>('advance_users'), []);
  const leaveAdapter = useMemo(() => new LocalStorageAdapter<LeaveRequest>('advance_leave_requests'), []);
  const expenseAdapter = useMemo(() => new LocalStorageAdapter<Expense>('advance_expenses'), []);
  const settingsAdapter = useMemo(() => new LocalStorageAdapter<SchoolSettings>('advance_settings'), []);
  const logsAdapter = useMemo(() => new LocalStorageAdapter<ActivityLog>('advance_activity_logs'), []);

  const [users, setUsers] = useState<User[]>(() => usersAdapter.getAll());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => leaveAdapter.getAll());
  const [expenses, setExpenses] = useState<Expense[]>(() => expenseAdapter.getAll());
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const all = settingsAdapter.getAll();
    return all.length > 0 ? all[0] : DEFAULT_SETTINGS;
  });
  const [logs, setLogs] = useState<ActivityLog[]>(() => logsAdapter.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

  const refreshUsers = useCallback(() => {
    setUsers(usersAdapter.getAll());
  }, [usersAdapter]);

  const refreshLeaveRequests = useCallback(() => {
    setLeaveRequests(leaveAdapter.getAll());
  }, [leaveAdapter]);

  const refreshExpenses = useCallback(() => {
    setExpenses(expenseAdapter.getAll());
  }, [expenseAdapter]);

  const refreshLogs = useCallback(() => {
    setLogs(logsAdapter.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [logsAdapter]);

  const logActivity = useCallback((userId: string, userName: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log_${Math.random().toString(36).substring(7)}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logsAdapter.create(newLog);
    refreshLogs();
  }, [logsAdapter, refreshLogs]);

  const createUser = useCallback((newUser: Omit<User, 'createdAt'>, actorId: string, actorName: string) => {
    const user: User = {
      ...newUser,
      createdAt: new Date().toISOString()
    };
    usersAdapter.create(user);
    logActivity(actorId, actorName, 'CREATE_USER', `Created user ${user.firstName} ${user.lastName} (${user.role})`);
    refreshUsers();
  }, [usersAdapter, logActivity, refreshUsers]);

  const updateUser = useCallback((updatedUser: User, actorId: string, actorName: string) => {
    usersAdapter.update(updatedUser.id, updatedUser);
    logActivity(actorId, actorName, 'UPDATE_USER', `Updated user ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.role})`);
    refreshUsers();
  }, [usersAdapter, logActivity, refreshUsers]);

  const toggleUserStatus = useCallback((userId: string, currentStatus: User['status'], actorId: string, actorName: string) => {
    const nextStatus: User['status'] = currentStatus === 'active' ? 'inactive' : 'active';
    const existing = usersAdapter.getById(userId);
    if (existing) {
      const updated = { ...existing, status: nextStatus };
      usersAdapter.update(userId, updated);
      logActivity(actorId, actorName, nextStatus === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', `Changed status of ${existing.firstName} ${existing.lastName} to ${nextStatus}`);
      refreshUsers();
    }
  }, [usersAdapter, logActivity, refreshUsers]);

  const saveSettings = useCallback((newSettings: SchoolSettings, actorId: string, actorName: string) => {
    const all = settingsAdapter.getAll();
    if (all.length > 0) {
      settingsAdapter.update(all[0].id, newSettings);
    } else {
      settingsAdapter.create(newSettings);
    }
    localStorage.setItem('advance_settings', JSON.stringify([newSettings]));
    setSettings(newSettings);
    logActivity(actorId, actorName, 'UPDATE_SETTINGS', `Updated global school settings: Term=${newSettings.activeTerm}, Year=${newSettings.academicYear}`);
  }, [settingsAdapter, logActivity]);

  const approveLeave = useCallback((leaveId: string, _reviewerId: string, actorId: string, actorName: string) => {
    const req = leaveAdapter.getById(leaveId);
    if (req) {
      const updated: LeaveRequest = {
        ...req,
        status: 'approved'
      };
      leaveAdapter.update(leaveId, updated);
      logActivity(actorId, actorName, 'APPROVE_LEAVE', `Approved leave request for staff ID ${req.staffId} (${req.type})`);
      refreshLeaveRequests();
    }
  }, [leaveAdapter, logActivity, refreshLeaveRequests]);

  const rejectLeave = useCallback((leaveId: string, _reviewerId: string, remarks: string, actorId: string, actorName: string) => {
    const req = leaveAdapter.getById(leaveId);
    if (req) {
      const updated: LeaveRequest = {
        ...req,
        status: 'rejected',
        reason: req.reason ? `${req.reason} (Rejected: ${remarks})` : `Rejected: ${remarks}`
      };
      leaveAdapter.update(leaveId, updated);
      logActivity(actorId, actorName, 'REJECT_LEAVE', `Rejected leave request for staff ID ${req.staffId} (${req.type})`);
      refreshLeaveRequests();
    }
  }, [leaveAdapter, logActivity, refreshLeaveRequests]);

  const approveExpense = useCallback((expenseId: string, actorId: string, actorName: string) => {
    const exp = expenseAdapter.getById(expenseId);
    if (exp) {
      const updated: Expense = {
        ...exp,
        status: 'approved',
        approvedBy: actorId
      };
      expenseAdapter.update(expenseId, updated);
      logActivity(actorId, actorName, 'APPROVE_EXPENSE', `Approved expense of GH₵${exp.amount} for ${exp.description}`);
      refreshExpenses();
    }
  }, [expenseAdapter, logActivity, refreshExpenses]);

  const rejectExpense = useCallback((expenseId: string, actorId: string, actorName: string) => {
    const exp = expenseAdapter.getById(expenseId);
    if (exp) {
      const updated: Expense = {
        ...exp,
        status: 'rejected'
      };
      expenseAdapter.update(expenseId, updated);
      logActivity(actorId, actorName, 'REJECT_EXPENSE', `Rejected expense of GH₵${exp.amount} for ${exp.description}`);
      refreshExpenses();
    }
  }, [expenseAdapter, logActivity, refreshExpenses]);

  return {
    users,
    leaveRequests,
    expenses,
    settings,
    logs,
    createUser,
    updateUser,
    toggleUserStatus,
    saveSettings,
    approveLeave,
    rejectLeave,
    approveExpense,
    rejectExpense,
    logActivity,
    refreshUsers,
    refreshLeaveRequests,
    refreshExpenses,
    refreshLogs
  };
}
