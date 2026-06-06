import React from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { useRepairStore } from '../store/useRepairStore';
import { repairStaff } from '../data/mockData';
import type { RepairTaskStatus, RepairProblemType } from '../types';

const RepairFilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, openDrawer } = useRepairStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ status: e.target.value as RepairTaskStatus | '' });
  };

  const handleAssigneeChange = (e: { target: { value: unknown } }) => {
    setFilters({ assignee: e.target.value as string | '' });
  };

  const handleProblemTypeChange = (e: { target: { value: unknown } }) => {
    setFilters({ problemType: e.target.value as RepairProblemType | '' });
  };

  const handleAdd = () => {
    openDrawer('', 'create');
  };

  const statusOptions: RepairTaskStatus[] = [
    '待指派',
    '修复中',
    '待质检',
    '质检通过',
    '质检未通过',
    '已完成',
  ];

  const problemTypeOptions: RepairProblemType[] = [
    '裂纹',
    '噪声',
    '磨损',
    '破损',
    '其他',
  ];

  return (
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
          placeholder="搜索任务编号或标题..."
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 220, flex: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>任务状态</InputLabel>
          <Select value={filters.status} label="任务状态" onChange={handleStatusChange}>
            <MenuItem value="">全部状态</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>负责人</InputLabel>
          <Select value={filters.assignee} label="负责人" onChange={handleAssigneeChange}>
            <MenuItem value="">全部人员</MenuItem>
            {repairStaff.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>问题类型</InputLabel>
          <Select value={filters.problemType} label="问题类型" onChange={handleProblemTypeChange}>
            <MenuItem value="">全部类型</MenuItem>
            {problemTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

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
          新增修复任务
        </Button>
      </Stack>
    </Box>
  );
};

export default RepairFilterBar;
