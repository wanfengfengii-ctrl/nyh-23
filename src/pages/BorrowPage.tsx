import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BugReportIcon from '@mui/icons-material/BugReport';
import BorrowFilterBar from '../components/BorrowFilterBar';
import BorrowTable from '../components/BorrowTable';
import BorrowDrawer from '../components/BorrowDrawer';
import StatCard from '../components/StatCard';
import { useBorrowStore } from '../store/useBorrowStore';

const BorrowPage: React.FC = () => {
  const { getFilteredRecords, getStatistics } = useBorrowStore();
  const filtered = getFilteredRecords();
  const stats = getStatistics();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          借阅与外借追踪
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {filtered.length} 条借阅记录 | 借阅中 {stats.currentlyBorrowed} 件
        </Typography>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="总借阅数"
              value={stats.totalBorrows}
              icon={<AssignmentIcon />}
              color="primary.main"
              subtitle="历史借阅总数"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="借阅中"
              value={stats.currentlyBorrowed}
              icon={<LibraryBooksIcon />}
              color="primary.main"
              subtitle="当前借出数量"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="已归还"
              value={stats.returned}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle="正常归还数量"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="超期"
              value={stats.overdue}
              icon={<ErrorIcon />}
              color="error.main"
              subtitle="超期未归还"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="待审批"
              value={stats.pendingApproval}
              icon={<HowToRegIcon />}
              color="warning.main"
              subtitle="等待审批中"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="损坏待复核"
              value={stats.damagePending}
              icon={<BugReportIcon />}
              color="warning.main"
              subtitle="需损坏复核"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="馆内借阅"
              value={stats.internalBorrows}
              icon={<LibraryBooksIcon />}
              color="info.main"
              subtitle="馆内使用"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="外部借展"
              value={stats.externalExhibitions}
              icon={<LocalShippingIcon />}
              color="secondary.main"
              subtitle="外展使用"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <BorrowFilterBar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <BorrowTable />
        </Box>
      </Box>

      <BorrowDrawer />
    </Box>
  );
};

export default BorrowPage;
