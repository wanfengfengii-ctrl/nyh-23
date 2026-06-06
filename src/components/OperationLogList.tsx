import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRepairStore } from '../store/useRepairStore';
import type { OperationLog } from '../types';

interface OperationLogListProps {
  targetType: OperationLog['targetType'];
  targetId: string;
}

const getActionIcon = (action: string) => {
  if (action.includes('创建') || action.includes('新增')) {
    return <AddIcon />;
  }
  if (action.includes('编辑') || action.includes('修改')) {
    return <EditIcon />;
  }
  if (action.includes('删除')) {
    return <DeleteIcon />;
  }
  if (action.includes('指派')) {
    return <PersonIcon />;
  }
  if (action.includes('开始') || action.includes('修复')) {
    return <BuildIcon />;
  }
  if (action.includes('通过') || action.includes('完成')) {
    return <CheckCircleIcon />;
  }
  if (action.includes('未通过') || action.includes('失败')) {
    return <ErrorIcon />;
  }
  return <HistoryIcon />;
};

const getActionColor = (action: string) => {
  if (action.includes('通过') || action.includes('完成')) {
    return 'success';
  }
  if (action.includes('未通过') || action.includes('失败') || action.includes('删除')) {
    return 'error';
  }
  if (action.includes('创建') || action.includes('新增')) {
    return 'info';
  }
  if (action.includes('指派') || action.includes('开始')) {
    return 'primary';
  }
  return 'default';
};

const OperationLogList: React.FC<OperationLogListProps> = ({ targetType, targetId }) => {
  const { getOperationLogsByTarget } = useRepairStore();
  const logs = getOperationLogsByTarget(targetType, targetId);

  if (logs.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          暂无操作记录
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {logs.map((log, index) => (
          <React.Fragment key={log.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${getActionColor(log.action)}.main`,
                  }}
                >
                  <Box sx={{ fontSize: 16 }}>{getActionIcon(log.action)}</Box>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action) as any}
                      sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {log.operator}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                      {log.description}
                    </Typography>
                    {log.oldValue && log.newValue && (
                      <Typography variant="caption" color="text.secondary">
                        {log.oldValue} → {log.newValue}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                      {log.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default OperationLogList;
