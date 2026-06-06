import { useState } from 'react';
import { Box, Tabs, Tab, AppBar, Toolbar, Typography } from '@mui/material';
import AlbumIcon from '@mui/icons-material/Album';
import BarChartIcon from '@mui/icons-material/BarChart';
import BuildIcon from '@mui/icons-material/Build';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CylinderListPage from './pages/CylinderList';
import StatisticsPage from './pages/Statistics';
import RepairPage from './pages/RepairPage';
import BorrowPage from './pages/BorrowPage';
import ReservationPage from './pages/ReservationPage';

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'primary.dark',
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AlbumIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.5px',
                fontFamily: '"Playfair Display", "Noto Serif SC", serif',
              }}
            >
              蜡筒录音档案管理系统
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': {
                  color: '#fff',
                },
                minHeight: 56,
              },
            }}
          >
            <Tab
              label="蜡筒档案"
              icon={<AlbumIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="修复质检"
              icon={<BuildIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="借阅外借"
              icon={<LibraryBooksIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="预约排期"
              icon={<EventAvailableIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="统计分析"
              icon={<BarChartIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box sx={{ height: 'calc(100vh - 56px)' }}>
        {tabValue === 0 && <CylinderListPage />}
        {tabValue === 1 && <RepairPage />}
        {tabValue === 2 && <BorrowPage />}
        {tabValue === 3 && <ReservationPage />}
        {tabValue === 4 && <StatisticsPage />}
      </Box>
    </Box>
  );
}

export default App;
