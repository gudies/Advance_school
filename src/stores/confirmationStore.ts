import { create } from 'zustand';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmationStore {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  askConfirm: (options: ConfirmationOptions) => void;
  closeConfirm: () => void;
}

export const useConfirmationStore = create<ConfirmationStore>((set) => ({
  isOpen: false,
  options: null,
  askConfirm: (options) => set({ isOpen: true, options }),
  closeConfirm: () => set({ isOpen: false, options: null }),
}));
