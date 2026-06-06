import { useState, useCallback } from 'react';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface UseConfirmDialogResult {
  open: boolean;
  options: ConfirmDialogOptions | null;
  showConfirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export function useConfirmDialog(): UseConfirmDialogResult {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const showConfirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (resolver) {
      resolver(true);
      setResolver(null);
    }
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
  }, [resolver]);

  return {
    open,
    options,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
}
