import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useReservationStore } from '../store/useReservationStore';
import type { ReservationPriority, ReservationStatus, ConflictStatus } from '../types';

const ReservationFilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    openDrawer,
    selectedIds,
    clearSelection,
    batchCancel,
    batchAdjust,
  } = useReservationStore();

  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'adjust' | 'cancel'>('cancel');
  const [batchReason, setBatchReason] = useState('');
  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchEndDate, setBatchEndDate] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handlePriorityChange = (e: { target: { value: unknown } }) => {
    setFilters({ priority: e.target.value as ReservationPriority | '' });
  };

  const handleStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ status: e.target.value as ReservationStatus | '' });
  };

  const handleConflictStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ conflictStatus: e.target.value as ConflictStatus | '' });
  };

  const handleAdd = () => {
    openDrawer('', 'create');
  };

  const handleBatchCancel = () => {
    if (selectedIds.length === 0) {
      alert('请先选择要操作的预约记录');
      return;
    }
    setBatchAction('cancel');
    setBatchReason('');
    setBatchDialogOpen(true);
  };

  const handleBatchAdjust = () => {
    if (selectedIds.length === 0) {
      alert('请先选择要操作的预约记录');
      return;
    }
    setBatchAction('adjust');
    setBatchReason('');
    setBatchStartDate('');
    setBatchEndDate('');
    setBatchDialogOpen(true);
  };

  const handleBatchConfirm = () => {
    if (batchAction === 'cancel') {
      if (!batchReason.trim()) {
        alert('请填写取消原因');
        return;
      }
      const result = batchCancel(selectedIds, batchReason);
      alert(`批量取消完成：成功 ${result.success.length} 条，失败 ${result.failed.length} 条`);
    } else {
      if (!batchReason.trim()) {
        alert('请填写调整原因');
        return;
      }
      const updates: { startDate?: string; endDate?: string } = {};
      if (batchStartDate) updates.startDate = batchStartDate;
      if (batchEndDate) updates.endDate = batchEndDate;

      if (!batchStartDate && !batchEndDate) {
        alert('请至少填写一个要调整的日期');
        return;
      }

      if (batchStartDate && batchEndDate && batchStartDate > batchEndDate) {
        alert('结束日期不能早于开始日期');
        return;
      }

      const result = batchAdjust(selectedIds, updates, batchReason);
      alert(`批量调整完成：成功 ${result.success.length} 条，失败 ${result.failed.length} 条`);
    }

    setBatchDialogOpen(false);
    clearSelection();
  };

  const priorityOptions: ReservationPriority[] = ['普通', '优先', '紧急'];
  const statusOptions: ReservationStatus[] = ['待审批', '已批准', '已拒绝', '已取消', '已完成', '已转借出'];
  const conflictStatusOptions: ConflictStatus[] = ['无冲突', '有冲突', '冲突已解决'];

  return (
    <>
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            placeholder="搜索预约单号、蜡筒名称、申请人..."
            value={filters.search}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 260, flex: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>优先级</InputLabel>
            <Select value={filters.priority} label="优先级" onChange={handlePriorityChange}>
              <MenuItem value="">全部</MenuItem>
              {priorityOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>预约状态</InputLabel>
            <Select value={filters.status} label="预约状态" onChange={handleStatusChange}>
              <MenuItem value="">全部状态</MenuItem>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>冲突状态</InputLabel>
            <Select value={filters.conflictStatus} label="冲突状态" onChange={handleConflictStatusChange}>
              <MenuItem value="">全部</MenuItem>
              {conflictStatusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {selectedIds.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                已选 {selectedIds.length} 项
              </Typography>
              <Tooltip title="批量调整">
                <IconButton size="small" color="primary" onClick={handleBatchAdjust}>
                  <DateRangeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="批量取消">
                <IconButton size="small" color="error" onClick={handleBatchCancel}>
                  <CancelScheduleSendIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          <Tooltip title="重置筛选">
            <IconButton onClick={resetFilters} size="small" color="default">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ minWidth: 130 }}
          >
            新增预约
          </Button>
        </Stack>
      </Box>

      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {batchAction === 'cancel' ? '批量取消预约' : '批量调整预约'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              已选择 {selectedIds.length} 条预约记录
            </Typography>

            {batchAction === 'adjust' && (
              <>
                <TextField
                  label="新的开始日期"
                  type="date"
                  size="small"
                  value={batchStartDate}
                  onChange={(e) => setBatchStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="留空则不修改"
                />
                <TextField
                  label="新的结束日期"
                  type="date"
                  size="small"
                  value={batchEndDate}
                  onChange={(e) => setBatchEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="留空则不修改"
                />
              </>
            )}

            <TextField
              label={batchAction === 'cancel' ? '取消原因' : '调整原因'}
              size="small"
              multiline
              rows={3}
              value={batchReason}
              onChange={(e) => setBatchReason(e.target.value)}
              placeholder={`请填写${batchAction === 'cancel' ? '取消' : '调整'}原因...`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            color={batchAction === 'cancel' ? 'error' : 'primary'}
            onClick={handleBatchConfirm}
          >
            确认{batchAction === 'cancel' ? '取消' : '调整'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReservationFilterBar;
