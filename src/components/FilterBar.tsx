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
import FilterListIcon from '@mui/icons-material/FilterList';
import { useCylinderStore } from '../store/useCylinderStore';
import type { CylinderStatus, NoiseLevel, MaterialStatus } from '../types';

const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, openDrawer } = useCylinderStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ status: e.target.value as CylinderStatus | '' });
  };

  const handleNoiseLevelChange = (e: { target: { value: unknown } }) => {
    setFilters({ noiseLevel: e.target.value as NoiseLevel | '' });
  };

  const handleMaterialStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ materialStatus: e.target.value as MaterialStatus | '' });
  };

  const handleSevereCrackChange = (e: { target: { value: unknown } }) => {
    const value = e.target.value as string;
    setFilters({
      hasSevereCrack: value === '' ? null : value === 'true',
    });
  };

  const handleAdd = () => {
    openDrawer('', 'create');
  };

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
          placeholder="搜索编号或标题..."
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 220, flex: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>状态</InputLabel>
          <Select value={filters.status} label="状态" onChange={handleStatusChange}>
            <MenuItem value="">全部状态</MenuItem>
            <MenuItem value="待转录">待转录</MenuItem>
            <MenuItem value="转录中">转录中</MenuItem>
            <MenuItem value="已完成">已完成</MenuItem>
            <MenuItem value="已归档">已归档</MenuItem>
            <MenuItem value="待修复">待修复</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>噪声等级</InputLabel>
          <Select value={filters.noiseLevel} label="噪声等级" onChange={handleNoiseLevelChange}>
            <MenuItem value="">全部等级</MenuItem>
            <MenuItem value="低">低</MenuItem>
            <MenuItem value="中">中</MenuItem>
            <MenuItem value="高">高</MenuItem>
            <MenuItem value="严重">严重</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>材质状态</InputLabel>
          <Select
            value={filters.materialStatus}
            label="材质状态"
            onChange={handleMaterialStatusChange}
          >
            <MenuItem value="">全部材质</MenuItem>
            <MenuItem value="完好">完好</MenuItem>
            <MenuItem value="轻微磨损">轻微磨损</MenuItem>
            <MenuItem value="严重磨损">严重磨损</MenuItem>
            <MenuItem value="破损">破损</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>裂纹筛选</InputLabel>
          <Select
            value={filters.hasSevereCrack === null ? '' : String(filters.hasSevereCrack)}
            label="裂纹筛选"
            onChange={handleSevereCrackChange}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="true">严重裂纹</MenuItem>
            <MenuItem value="false">无严重裂纹</MenuItem>
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
          sx={{ minWidth: 110 }}
        >
          新增蜡筒
        </Button>
      </Stack>
    </Box>
  );
};

export default FilterBar;
