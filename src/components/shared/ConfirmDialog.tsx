import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertColor,
} from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: AlertColor;
  onConfirm: () => void;
  onCancel: () => void;
  maxWidth?: 'xs' | 'sm' | 'md';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = '确认操作',
  message,
  confirmText = '确定',
  cancelText = '取消',
  severity = 'warning',
  onConfirm,
  onCancel,
  maxWidth = 'sm',
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={severity} sx={{ mb: 1 }}>
          <DialogContentText
            sx={{ whiteSpace: 'pre-wrap', color: 'inherit' }}
          >
            {message}
          </DialogContentText>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={severity === 'error' ? 'error' : 'primary'} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
