import React from 'react';
import { useConfirmationStore } from '../../stores/confirmationStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2, HelpCircle, CheckCircle } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { isOpen, options, closeConfirm } = useConfirmationStore();

  if (!isOpen || !options) return null;

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    closeConfirm();
  };

  const handleConfirm = () => {
    options.onConfirm();
    closeConfirm();
  };

  const typeConfig = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      iconBg: 'bg-rose-100 dark:bg-rose-950/30',
      confirmVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-100 dark:bg-amber-950/30',
      confirmVariant: 'primary' as const,
    },
    success: {
      icon: <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
      confirmVariant: 'primary' as const,
    },
    primary: {
      icon: <HelpCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      iconBg: 'bg-primary-100 dark:bg-primary-950/30',
      confirmVariant: 'primary' as const,
    },
  };

  const currentType = typeConfig[options.type || 'primary'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options.title}
      size="sm"
    >
      <div className="flex items-start gap-4 py-4">
        <div className={`p-3 rounded-full shrink-0 ${currentType.iconBg}`}>
          {currentType.icon}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            {options.message}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
        <Button variant="outline" onClick={handleCancel}>
          {options.cancelLabel || 'Cancel'}
        </Button>
        <Button variant={currentType.confirmVariant} onClick={handleConfirm}>
          {options.confirmLabel || 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
};
