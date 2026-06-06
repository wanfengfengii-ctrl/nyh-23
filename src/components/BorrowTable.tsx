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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useBorrowStore } from '../store/useBorrowStore';
import {
  getApprovalStatusColor,
  getReturnStatusColor,
  getBorrowTypeColor,
} from '../utils/formatters';
import type { BorrowRecord } from '../types';

const BorrowTable: React.FC = () => {
  const {
    getFilteredRecords,
    page,
    pageSize,
    setPage,
    setPageSize,
    openDrawer,
    deleteBorrowRecord,
    getActualReturnStatus,
  } = useBorrowStore();

  const filteredRecords = getFilteredRecords();
  const paginatedRecords = filteredRecords.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const handleView = (id: string) => {
    openDrawer(id, 'view');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条借阅记录吗？')) {
      deleteBorrowRecord(id);
    }
  };

  const handleApprove = (id: string) => {
    openDrawer(id, 'approve');
  };

  const handleReturn = (id: string) => {
    openDrawer(id, 'return');
  };

  const handleDamageCheck = (id: string) => {
    openDrawer(id, 'damageCheck');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  const getRowStyle = (record: BorrowRecord) => {
    const actualReturnStatus = getActualReturnStatus(record);
    if (actualReturnStatus === '超期') {
      return {
        borderLeft: '4px solid #C62828',
        backgroundColor: 'rgba(198, 40, 40, 0.03) !important',
        position: 'relative' as const,
      };
    }
    if (actualReturnStatus === '损坏待复核') {
      return {
        borderLeft: '4px solid #F57C00',
        backgroundColor: 'rgba(245, 124, 0, 0.03) !important',
        position: 'relative' as const,
      };
    }
    if (record.approvalStatus === '待审批') {
      return {
        borderLeft: '4px solid #1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.03) !important',
        position: 'relative' as const,
      };
    }
    return {};
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 130, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>申请单号</TableCell>
              <TableCell sx={{ bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>借阅对象</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>类型</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>数量</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>借出日期</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>应还日期</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>实际归还</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>审批状态</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>归还状态</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>申请人</TableCell>
              <TableCell sx={{ width: 200, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }} align="center">
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  暂无借阅记录
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
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {record.applicationNo}
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
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {record.borrowDate || '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {record.dueDate || '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {record.actualReturnDate || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.approvalStatus}
                        size="small"
                        color={getApprovalStatusColor(record.approvalStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={getActualReturnStatus(record)}
                          size="small"
                          color={getReturnStatusColor(getActualReturnStatus(record))}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>{record.applicant}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="查看详情">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(record.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {record.approvalStatus === '待审批' && (
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
                      {record.approvalStatus === '审批通过' &&
                        record.returnStatus !== '已归还' &&
                        record.returnStatus !== '损坏待复核' && (
                          <Tooltip title="归还登记">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleReturn(record.id)}
                            >
                              <AssignmentTurnedInIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      {record.returnStatus === '损坏待复核' && (
                        <Tooltip title="损坏复核">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleDamageCheck(record.id)}
                          >
                            <BugReportIcon fontSize="small" />
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

export default BorrowTable;
