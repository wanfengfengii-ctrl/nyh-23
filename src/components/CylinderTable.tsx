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
  LinearProgress,
  IconButton,
  Tooltip,
  Box,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useCylinderStore } from '../store/useCylinderStore';
import {
  getStatusColor,
  getNoiseColor,
  getMaterialStatusColor,
} from '../utils/formatters';
import { hasSevereCrack } from '../utils/validators';
import type { Cylinder } from '../types';

const CylinderTable: React.FC = () => {
  const {
    getFilteredCylinders,
    page,
    pageSize,
    setPage,
    setPageSize,
    openDrawer,
    deleteCylinder,
  } = useCylinderStore();

  const filteredCylinders = getFilteredCylinders();
  const paginatedCylinders = filteredCylinders.slice(
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
    if (window.confirm('确定要删除这个蜡筒档案吗？')) {
      deleteCylinder(id);
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

  const getRowStyle = (cylinder: Cylinder) => {
    if (hasSevereCrack(cylinder)) {
      return {
        borderLeft: '4px solid #C62828',
        backgroundColor: 'rgba(198, 40, 40, 0.03) !important',
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
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>蜡筒编号</TableCell>
              <TableCell sx={{ bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>录音标题</TableCell>
              <TableCell sx={{ width: 80, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>年代</TableCell>
              <TableCell sx={{ width: 110, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>材质状态</TableCell>
              <TableCell sx={{ width: 130, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>保存位置</TableCell>
              <TableCell sx={{ width: 160, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>转录进度</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>噪声等级</TableCell>
              <TableCell sx={{ width: 90, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }}>当前状态</TableCell>
              <TableCell sx={{ width: 120, bgcolor: '#5D4037', color: '#ffffff', fontWeight: 600 }} align="center">
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCylinders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedCylinders.map((cylinder) => (
                <TableRow
                  key={cylinder.id}
                  hover
                  sx={getRowStyle(cylinder)}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {cylinder.id}
                      {hasSevereCrack(cylinder) && (
                        <Tooltip title="存在严重裂纹">
                          <WarningIcon
                            color="error"
                            sx={{ fontSize: 16 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{cylinder.title}</TableCell>
                  <TableCell>{cylinder.year}年</TableCell>
                  <TableCell>
                    <Chip
                      label={cylinder.materialStatus}
                      size="small"
                      color={getMaterialStatusColor(cylinder.materialStatus)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {cylinder.storageLocation}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 80 }}>
                        <LinearProgress
                          variant="determinate"
                          value={cylinder.transcriptionProgress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(93, 64, 55, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#5D4037',
                            },
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          minWidth: 40,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        {cylinder.transcriptionProgress}%
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cylinder.noiseLevel}
                      size="small"
                      color={getNoiseColor(cylinder.noiseLevel)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cylinder.currentStatus}
                      size="small"
                      color={getStatusColor(cylinder.currentStatus)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="查看详情">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(cylinder.id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEdit(cylinder.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cylinder.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={filteredCylinders.length}
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

export default CylinderTable;
