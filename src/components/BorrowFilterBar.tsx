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
import { useBorrowStore } from '../store/useBorrowStore';
import type { BorrowType, BorrowApprovalStatus, BorrowReturnStatus } from '../types';

const BorrowFilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, openDrawer } = useBorrowStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleBorrowTypeChange = (e: { target: { value: unknown } }) => {
    setFilters({ borrowType: e.target.value as BorrowType | '' });
  };

  const handleApprovalStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ approvalStatus: e.target.value as BorrowApprovalStatus | '' });
  };

  const handleReturnStatusChange = (e: { target: { value: unknown } }) => {
    setFilters({ returnStatus: e.target.value as BorrowReturnStatus | '' });
  };

  const handleAdd = () => {
    openDrawer('', 'create');
  };

  const borrowTypeOptions: BorrowType[] = ['馆内借阅', '外部借展'];
  const approvalStatusOptions: BorrowApprovalStatus[] = ['待审批', '审批通过', '审批拒绝', '已撤销'];
  const returnStatusOptions: BorrowReturnStatus[] = ['未归还', '已归还', '超期', '损坏待复核'];

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
          placeholder="搜索申请单号、蜡筒名称、申请人..."
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 260, flex: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>借阅类型</InputLabel>
          <Select value={filters.borrowType} label="借阅类型" onChange={handleBorrowTypeChange}>
            <MenuItem value="">全部类型</MenuItem>
            {borrowTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>审批状态</InputLabel>
          <Select value={filters.approvalStatus} label="审批状态" onChange={handleApprovalStatusChange}>
            <MenuItem value="">全部状态</MenuItem>
            {approvalStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>归还状态</InputLabel>
          <Select value={filters.returnStatus} label="归还状态" onChange={handleReturnStatusChange}>
            <MenuItem value="">全部状态</MenuItem>
            {returnStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
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
          新增借阅
        </Button>
      </Stack>
    </Box>
  );
};

export default BorrowFilterBar;
