import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Stack,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReservationFilterBar from '../components/ReservationFilterBar';
import ReservationTable from '../components/ReservationTable';
import ReservationDrawer from '../components/ReservationDrawer';
import StatCard from '../components/StatCard';
import { useReservationStore } from '../store/useReservationStore';
import {
  getPriorityColor,
  getReservationStatusColor,
} from '../utils/formatters';

const ReservationPage: React.FC = () => {
  const {
    getFilteredReservations,
    getStatistics,
    getUpcomingReservations,
    openDrawer,
    markReminderSent,
    checkAndUpdateReminders,
  } = useReservationStore();

  const filtered = getFilteredReservations();
  const stats = getStatistics();
  const upcomingReservations = getUpcomingReservations(7);

  const [showReminder, setShowReminder] = useState(true);
  const [upcomingToRemind, setUpcomingToRemind] = useState<typeof upcomingReservations>([]);

  useEffect(() => {
    const toRemind = checkAndUpdateReminders(3);
    if (toRemind.length > 0) {
      setUpcomingToRemind(toRemind);
    } else {
      setUpcomingToRemind(upcomingReservations.filter((r) => r.reminderStatus === '未提醒'));
    }
  }, [upcomingReservations]);

  const handleReminderDismiss = () => {
    setShowReminder(false);
  };

  const handleSendReminder = (id: string) => {
    markReminderSent(id);
    setUpcomingToRemind((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          预约排期与冲突管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {filtered.length} 条预约记录 | 待审批 {stats.pendingApproval} 条 | 冲突 {stats.conflictCount} 条
        </Typography>
      </Box>

      {showReminder && upcomingToRemind.length > 0 && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert
            severity="info"
            action={
              <Tooltip title="关闭提醒">
                <IconButton
                  size="small"
                  onClick={handleReminderDismiss}
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
            icon={<NotificationsActiveIcon />}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              即将到期提醒（{upcomingToRemind.length} 条）
            </Typography>
            <Typography variant="body2">
              以下预约将在 3 天内开始，请及时准备：
            </Typography>
            <Box sx={{ maxHeight: 120, overflowY: 'auto', mt: 1 }}>
              <List dense>
                {upcomingToRemind.map((r) => (
                  <ListItem
                    key={r.id}
                    secondaryAction={
                      <Tooltip title="标记为已提醒">
                        <IconButton
                          size="small"
                          onClick={() => handleSendReminder(r.id)}
                          edge="end"
                        >
                          <NotificationsActiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemButton onClick={() => openDrawer(r.id, 'view')}>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {r.reservationNo}
                            </span>
                            <Chip
                              label={r.priority}
                              size="small"
                              color={getPriorityColor(r.priority)}
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Stack>
                        }
                        secondary={`${r.cylinderTitle} | ${r.startDate} ~ ${r.endDate} | ${r.applicant}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Alert>
        </Box>
      )}

      {stats.conflictCount > 0 && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              ⚠ 存在 {stats.conflictCount} 条时间冲突的预约记录
            </Typography>
            <Typography variant="body2">
              请及时协调处理冲突预约，高优先级申请可触发冲突提示但不能直接覆盖原预约。
            </Typography>
          </Alert>
        </Box>
      )}

      <Box sx={{ px: 3, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="总预约数"
              value={stats.totalReservations}
              icon={<EventIcon />}
              color="primary.main"
              subtitle="历史预约总数"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="待审批"
              value={stats.pendingApproval}
              icon={<ScheduleIcon />}
              color="warning.main"
              subtitle="等待审批中"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="已批准"
              value={stats.approved}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle="已批准预约数"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="冲突记录"
              value={stats.conflictCount}
              icon={<ErrorIcon />}
              color="error.main"
              subtitle="时间冲突记录"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="紧急预约"
              value={stats.urgentCount}
              icon={<PriorityHighIcon />}
              color="error.main"
              subtitle="紧急优先级"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="本月新增"
              value={stats.thisMonthCount}
              icon={<EventIcon />}
              color="info.main"
              subtitle="本月创建数"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="已完成"
              value={stats.completed}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle="已完成预约"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="已转借阅"
              value={stats.convertedToBorrow}
              icon={<SwapHorizIcon />}
              color="secondary.main"
              subtitle="转为正式借阅"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ReservationFilterBar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ReservationTable />
        </Box>
      </Box>

      <ReservationDrawer />
    </Box>
  );
};

export default ReservationPage;
