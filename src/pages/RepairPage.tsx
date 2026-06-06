import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import RepairFilterBar from '../components/RepairFilterBar';
import RepairTaskTable from '../components/RepairTaskTable';
import RepairTaskDrawer from '../components/RepairTaskDrawer';
import StatCard from '../components/StatCard';
import { useRepairStore } from '../store/useRepairStore';

const RepairPage: React.FC = () => {
  const { repairTasks, getFilteredTasks } = useRepairStore();
  const filtered = getFilteredTasks();

  const stats = {
    total: repairTasks.length,
    pending: repairTasks.filter((t) => t.status === '待指派').length,
    inProgress: repairTasks.filter((t) => t.status === '修复中').length,
    pendingQC: repairTasks.filter((t) => t.status === '待质检').length,
    passed: repairTasks.filter((t) => t.status === '质检通过' || t.status === '已完成').length,
    failed: repairTasks.filter((t) => t.status === '质检未通过').length,
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.passed / stats.total) * 100)
    : 0;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          修复工作流与质检管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {filtered.length} 条修复任务 | 完成率 {completionRate}%
        </Typography>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="全部任务"
              value={stats.total}
              icon={<AssignmentIcon />}
              color="primary.main"
              subtitle="修复任务总数"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="待指派"
              value={stats.pending}
              icon={<PendingIcon />}
              color="default"
              subtitle="等待负责人"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="修复中"
              value={stats.inProgress}
              icon={<BuildIcon />}
              color="primary.main"
              subtitle="正在修复处理"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="待质检"
              value={stats.pendingQC}
              icon={<PendingIcon />}
              color="warning.main"
              subtitle="等待质检审核"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="质检通过"
              value={stats.passed}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle={`通过率 ${completionRate}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="质检未通过"
              value={stats.failed}
              icon={<ErrorIcon />}
              color="error.main"
              subtitle="需要返工"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <RepairFilterBar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <RepairTaskTable />
        </Box>
      </Box>

      <RepairTaskDrawer />
    </Box>
  );
};

export default RepairPage;
