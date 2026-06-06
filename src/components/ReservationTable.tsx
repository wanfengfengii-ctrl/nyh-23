import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  TablePagination,
  Stack,
  Checkbox,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useReservationStore } from '../store/useReservationStore';
import {
  getPriorityColor,
  getReservationStatusColor,
  getConflictStatusColor,
  getReminderStatusColor,
  getBorrowTypeColor,
} from '../utils/formatters';
import type { ReservationRecord } from '../types';

const ReservationTable: React.FC = () => {
  const {
    getFilteredReservations,
    page,
    pageSize,
    setPage,
    setPageSize,
    openDrawer,
    deleteReservation,
    selectedIds,
    toggleSelectId,
    setSelectedIds,
    markReminderSent,
  } = useReservationStore();

  const filteredRecords = getFilteredReservations();
  const paginatedRecords = filteredRecords.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const handleView = (id: string) => {
    openDrawer(id, 'view');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条预约记录吗？')) {
      deleteReservation(id);
    }
  };

  const handleApprove = (id: string) => {
    openDrawer(id, 'approve');
  };

  const handleAdjust = (id: string) => {
    openDrawer(id, 'adjust');
  };

  const handleCancel = (id: string) => {
    const reason = window.prompt('请输入取消原因：');
    if (reason !== null && reason.trim()) {
      const { cancelReservation } = useReservationStore.getState();
      cancelReservation(id, reason);
    }
  };

  const handleConvert = (id: string) => {
    openDrawer(id, 'convert');
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  const getRowStyle = (record: ReservationRecord) => {
    if (record.conflictStatus === '有冲突') {
      return {
        borderLeft: '4px solid #C62828',
        backgroundColor: 'rgba(198, 40, 40, 0.03) !important',
        position: 'relative' as const,
      };
    }
    if (record.priority === '紧急') {
      return {
        borderLeft: '4px solid #D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.03) !important',
        position: 'relative' as const,
      };
    }
    if (record.status === '待审批') {
      return {
        borderLeft: '4px solid #1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.03) !important',
        position: 'relative' as const,
      };
    }
    return {};
  };

  const allSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id));
  const someSelected = paginatedRecords.some((r) => selectedIds.includes(r.id)) && !allSelected;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#6D4C41', color: '#ffffff' }}>
                <Checkbox
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={handleSelectAll}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                />
              </TableCell>
              <TableCell sx={{ width: 130, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>预约单号</TableCell>
              <TableCell sx={{ bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>蜡筒信息</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>类型</TableCell>
              <TableCell sx={{ width: 80, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>优先级</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>预约开始</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>预约结束</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>状态</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>冲突</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>提醒</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }}>申请人</TableCell>
              <TableCell sx={{ width: 280, bgcolor: '#6D4C41', color: '#ffffff', fontWeight: 600 }} align="center">
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  暂无预约记录
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => {
                return (
                  <TableRow
                    key={record.id}
                    hover
                    sx={getRowStyle(record)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(record.id)}
                        onChange={() => toggleSelectId(record.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {record.reservationNo}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {record.cylinderId}
                        </span>
                        <span style={{ fontSize: '0.85rem' }}>{record.cylinderTitle}</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.borrowType}
                        size="small"
                        color={getBorrowTypeColor(record.borrowType)}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.priority}
                        size="small"
                        color={getPriorityColor(record.priority)}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {record.startDate || '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {record.endDate || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        color={getReservationStatusColor(record.status)}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.conflictStatus}
                        size="small"
                        color={getConflictStatusColor(record.conflictStatus)}
                        variant={record.conflictStatus === '有冲突' ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.reminderStatus}
                        size="small"
                        color={getReminderStatusColor(record.reminderStatus)}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell>{record.applicant}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.3} justifyContent="center" flexWrap="wrap">
                        <Tooltip title="查看详情">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleView(record.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {record.status === '待审批' && (
                          <Tooltip title="审批">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleApprove(record.id)}
                            >
                              <HowToRegIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(record.status === '已批准' || record.status === '待审批') && (
                          <Tooltip title="调整预约">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleAdjust(record.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {record.status === '已批准' && (
                          <Tooltip title="转为借阅">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleConvert(record.id)}
                            >
                              <SwapHorizIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(record.status === '已批准' || record.status === '待审批') && (
                          <Tooltip title="取消预约">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => handleCancel(record.id)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {record.reminderStatus === '未提醒' && record.status === '已批准' && (
                          <Tooltip title="发送提醒">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => markReminderSent(record.id)}
                            >
                              <NotificationsActiveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="删除">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(record.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={filteredRecords.length}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="每页条数"
        labelDisplayedRows={({ from, to, count }) =>
          `第 ${from}-${to} 条，共 ${count} 条`
        }
      />
    </Paper>
  );
};

export default ReservationTable;
