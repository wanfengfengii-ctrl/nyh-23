import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  ButtonProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface DrawerHeaderAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  disabled?: boolean;
}

export interface DrawerHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  actions?: DrawerHeaderAction[];
  primaryAction?: DrawerHeaderAction;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  onClose,
  onBack,
  showBackButton = false,
  actions = [],
  primaryAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showBackButton && (
          <IconButton
            size="small"
            onClick={onBack || onClose}
            sx={{ color: 'inherit' }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            size="small"
            startIcon={action.icon}
            onClick={action.onClick}
            variant={action.variant || 'outlined'}
            color={action.color || 'inherit'}
            disabled={action.disabled}
            sx={
              action.variant === 'outlined'
                ? {
                    color: 'inherit',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'inherit',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }
                : undefined
            }
          >
            {action.label}
          </Button>
        ))}
        {primaryAction && (
          <Button
            size="small"
            startIcon={primaryAction.icon}
            onClick={primaryAction.onClick}
            variant={primaryAction.variant || 'contained'}
            color={primaryAction.color || 'secondary'}
            disabled={primaryAction.disabled}
            sx={{
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              '&:hover': {
                bgcolor: 'secondary.dark',
              },
            }}
          >
            {primaryAction.label}
          </Button>
        )}
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DrawerHeader;
