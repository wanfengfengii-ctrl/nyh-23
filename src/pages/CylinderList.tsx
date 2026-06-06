import React from 'react';
import { Box, Typography } from '@mui/material';
import FilterBar from '../components/FilterBar';
import CylinderTable from '../components/CylinderTable';
import CylinderDrawer from '../components/CylinderDrawer';
import { useCylinderStore } from '../store/useCylinderStore';

const CylinderListPage: React.FC = () => {
  const { getFilteredCylinders } = useCylinderStore();
  const filtered = getFilteredCylinders();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          蜡筒录音档案管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {filtered.length} 条蜡筒记录
        </Typography>
      </Box>

      <Box sx={{ px: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <FilterBar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <CylinderTable />
        </Box>
      </Box>

      <CylinderDrawer />
    </Box>
  );
};

export default CylinderListPage;
