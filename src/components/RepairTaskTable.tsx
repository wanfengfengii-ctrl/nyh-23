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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRepairStore } from '../store/useRepairStore';
import { useCylinderStore } from '../store/useCylinderStore';
import {
  getRepairStatusColor,
  getProblemTypeColor,
} from '../utils/formatters';
import type { RepairTask } from '../types';

const RepairTaskTable: React.FC = () => {
  const {
    getFilteredTasks,
    page,
    pageSize,
    setPage,
    setPageSize,
    openDrawer,
    deleteRepairTask,
    startRepair,
    assignTask,
  } = useRepairStore();
  const { getCylinderById } = useCylinderStore();

  const filteredTasks = getFilteredTasks();
  const paginatedTasks = filteredTasks.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const handleView = (id: string) => {
    openDrawer(id, 'view');
  };

  const handleEdit = (id: string) => {
    openDrawer(id, 'edit');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个修复任务吗？')) {
      deleteRepairTask(id);
    }
  };

  const handleStartRepair = (task: RepairTask) => {
    if (!task.assignee) {
      alert('请先指派修复人员');
      return;
    }
    if (window.confirm('确定要开始修复吗？')) {
      startRepair(task.id);
    }
  };

  const handleAssign = (taskId: string) => {
    openDrawer(taskId, 'edit');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  const getRowStyle = (task: RepairTask) => {
    if (task.status === '质检未通过') {
      return {
        borderLeft: '4px solid #C62828',
        backgroundColor: 'rgba(198, 40, 40, 0.03) !important',
        position: 'relative' as const,
      };
    }
    if (task.status === '待质检') {
      return {
        borderLeft: '4px solid #F57C00',
        backgroundColor: 'rgba(245, 124, 0, 0.03) !important',
        position: 'relative' as const,
      };
    }
    return {};
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 340px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 120, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>任务编号</TableCell>
              <TableCell sx={{ bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>任务标题</TableCell>
              <TableCell sx={{ width: 130, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>关联蜡筒</TableCell>
              <TableCell sx={{ width: 120, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>问题类型</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>负责人</TableCell>
              <TableCell sx={{ width: 100, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>状态</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>创建日期</TableCell>
              <TableCell sx={{ width: 80, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>返工</TableCell>
              <TableCell sx={{ width: 180, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }} align="center">
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  暂无修复任务
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => {
                const cylinder = getCylinderById(task.cylinderId);
                return (
                  <TableRow
                    key={task.id}
                    hover
                    sx={getRowStyle(task)}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {task.id}
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                          {task.cylinderId}
                        </span>
                        {cylinder && (
                          <span style={{ fontSize: '0.85rem' }}>{cylinder.title}</span>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {task.problemTypes.map((type) => (
                          <Chip
                            key={type}
                            label={type}
                            size="small"
                            color={getProblemTypeColor(type)}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {task.assignee || (
                        <span style={{ color: 'text.disabled' }}>未指派</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        color={getRepairStatusColor(task.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {task.createdAt}
                    </TableCell>
                    <TableCell>
                      {task.reworkCount > 0 ? (
                        <Chip
                          label={`${task.reworkCount}次`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      ) : (
                        <span style={{ color: 'text.disabled' }}>-</span>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="查看详情">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(task.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {task.status === '待指派' && (
                        <Tooltip title="指派任务">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleAssign(task.id)}
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(task.status === '待指派' || task.status === '质检未通过') && task.assignee && (
                        <Tooltip title="开始修复">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStartRepair(task)}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="编辑">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleEdit(task.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(task.id)}
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
        count={filteredTasks.length}
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

export default RepairTaskTable;
