import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCylinderStore } from '../store/useCylinderStore';
import CylinderForm from './CylinderForm';
import CrackList from './CrackList';
import {
  getStatusColor,
  getNoiseColor,
  getMaterialStatusColor,
} from '../utils/formatters';
import { validateCylinder, hasSevereCrack } from '../utils/validators';
import type { Cylinder } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ padding: '16px 24px 24px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const CylinderDrawer: React.FC = () => {
  const {
    drawerOpen,
    closeDrawer,
    selectedCylinderId,
    getCylinderById,
    addCylinder,
    updateCylinder,
    editMode,
    setEditMode,
  } = useCylinderStore();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Cylinder>>({});

  const cylinder = selectedCylinderId
    ? getCylinderById(selectedCylinderId)
    : undefined;

  useEffect(() => {
    if (drawerOpen) {
      setTabValue(0);
      if (editMode === 'create') {
        setFormData({
          id: '',
          title: '',
          year: new Date().getFullYear(),
          materialStatus: '完好',
          storageLocation: '',
          transcriptionProgress: 0,
          noiseLevel: '低',
          currentStatus: '待转录',
          repairSuggestion: '',
          createdAt: new Date().toISOString().split('T')[0],
          cracks: [],
        });
      } else if (cylinder) {
        setFormData(cylinder);
      }
    }
  }, [drawerOpen, editMode, cylinder]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditMode('edit');
  };

  const handleCancel = () => {
    if (editMode === 'create') {
      closeDrawer();
    } else {
      setEditMode('view');
      if (cylinder) {
        setFormData(cylinder);
      }
    }
  };

  const handleSave = () => {
    const { cylinders } = useCylinderStore.getState();
    const result = validateCylinder(formData, cylinders, editMode !== 'create');

    if (!result.valid) {
      const firstError = Object.values(result.errors)[0];
      alert(firstError);
      return;
    }

    if (editMode === 'create') {
      addCylinder({
        ...formData,
        cracks: [],
      } as Cylinder);
      closeDrawer();
    } else if (editMode === 'edit' && cylinder) {
      updateCylinder(cylinder.id, formData);
      setEditMode('view');
    }
  };

  const isEditable = editMode === 'edit' || editMode === 'create';
  const isViewMode = editMode === 'view';
  const drawerTitle =
    editMode === 'create'
      ? '新增蜡筒档案'
      : isViewMode
      ? '蜡筒详情'
      : '编辑蜡筒档案';

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 560, md: 640 } },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isViewMode && (
            <IconButton
              size="small"
              onClick={handleCancel}
              sx={{ color: 'inherit' }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {drawerTitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isViewMode && cylinder && (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                color: 'inherit',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'inherit',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
              variant="outlined"
            >
              编辑
            </Button>
          )}
          {!isViewMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              保存
            </Button>
          )}
          <IconButton onClick={closeDrawer} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {cylinder && isViewMode && (
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              {cylinder.id}
            </Typography>
            {hasSevereCrack(cylinder) && (
              <Chip
                label="严重裂纹"
                color="error"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1.5 }}>
            {cylinder.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${cylinder.year}年`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={cylinder.materialStatus}
              size="small"
              color={getMaterialStatusColor(cylinder.materialStatus)}
              variant="outlined"
            />
            <Chip
              label={`噪声：${cylinder.noiseLevel}`}
              size="small"
              color={getNoiseColor(cylinder.noiseLevel)}
            />
            <Chip
              label={cylinder.currentStatus}
              size="small"
              color={getStatusColor(cylinder.currentStatus)}
            />
          </Box>
        </Box>
      )}

      {isViewMode && cylinder ? (
        <>
          <Divider sx={{ mt: 1 }} />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="基本信息" />
              <Tab label={`裂纹记录 (${cylinder.cracks.length})`} />
              <Tab label="修复建议" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="保存位置" value={cylinder.storageLocation} />
              <InfoRow
                label="转录进度"
                value={`${cylinder.transcriptionProgress}%`}
              />
              <InfoRow label="噪声等级" value={cylinder.noiseLevel} />
              <InfoRow label="材质状态" value={cylinder.materialStatus} />
              <InfoRow label="创建日期" value={cylinder.createdAt} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CrackList cylinderId={cylinder.id} editable />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                修复建议
              </Typography>
              {cylinder.repairSuggestion ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {cylinder.repairSuggestion}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无修复建议
                </Typography>
              )}
            </Box>
          </TabPanel>
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <CylinderForm
            cylinder={cylinder}
            isEdit={editMode === 'edit'}
            formData={formData}
            setFormData={setFormData}
          />
        </Box>
      )}
    </Drawer>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value || '-'}
    </Typography>
  </Box>
);

export default CylinderDrawer;
