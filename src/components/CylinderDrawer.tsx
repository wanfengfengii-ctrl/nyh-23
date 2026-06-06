import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabPanel, InfoRow } from './shared';
import { useCylinderStore } from '../store/useCylinderStore';
import { useRepairStore } from '../store/useRepairStore';
import CylinderForm from './CylinderForm';
import CrackList from './CrackList';
import OperationLogList from './OperationLogList';
import {
  getStatusColor,
  getNoiseColor,
  getMaterialStatusColor,
  getRepairStatusColor,
} from '../utils/formatters';
import {
  validateCylinder,
  hasSevereCrack,
  needsRepairTask,
  canArchiveWithQualityCheck,
} from '../utils/validators';
import type { Cylinder, RepairProblemType } from '../types';

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
  const { getRepairTasksByCylinderId, createRepairTaskForCylinder, openDrawer: openRepairDrawer } = useRepairStore();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Cylinder>>({});

  const cylinder = selectedCylinderId
    ? getCylinderById(selectedCylinderId)
    : undefined;

  const repairTasks = cylinder ? getRepairTasksByCylinderId(cylinder.id) : [];
  const needRepair = cylinder ? needsRepairTask(cylinder) : false;
  const hasActiveRepair = repairTasks.length > 0 && repairTasks.some(
    (t) => t.status !== '已完成' && t.status !== '质检通过'
  );

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
          repairTaskIds: [],
          lastQualityCheckResult: null,
          lastQualityCheckedAt: null,
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

    if (formData.currentStatus === '已归档' && cylinder && !canArchiveWithQualityCheck({ ...cylinder, ...formData } as Cylinder)) {
      alert('存在未通过质检的修复任务，不能归档');
      return;
    }

    const tempCylinder = {
      ...(cylinder || {}),
      ...formData,
    } as Cylinder;

    const needsRepair = needsRepairTask(tempCylinder);
    const currentRepairTasks = cylinder ? getRepairTasksByCylinderId(cylinder.id) : [];
    const hasActiveRepair = currentRepairTasks.some(
      (t) => t.status !== '已完成' && t.status !== '质检通过'
    );

    if (needsRepair && !hasActiveRepair && !window.confirm(
      '该蜡筒存在高噪声或严重裂纹问题，根据规则必须创建修复任务。\n\n是否立即创建修复任务？\n\n点击"确定"创建修复任务，点击"取消"返回修改。'
    )) {
      return;
    }

    if (editMode === 'create') {
      const newCylinder = {
        ...formData,
        cracks: [],
        repairTaskIds: [],
        lastQualityCheckResult: null,
        lastQualityCheckedAt: null,
      } as Cylinder;
      addCylinder(newCylinder);

      if (needsRepairTask(newCylinder)) {
        const problemTypes: RepairProblemType[] = [];
        if (newCylinder.noiseLevel === '高' || newCylinder.noiseLevel === '严重') {
          problemTypes.push('噪声');
        }
        if (hasSevereCrack(newCylinder)) {
          problemTypes.push('裂纹');
        }
        if (newCylinder.materialStatus === '严重磨损') {
          problemTypes.push('磨损');
        }
        if (newCylinder.materialStatus === '破损') {
          problemTypes.push('破损');
        }
        if (problemTypes.length === 0) {
          problemTypes.push('其他');
        }

        const newTask = createRepairTaskForCylinder(
          newCylinder,
          problemTypes,
          `系统自动创建：${problemTypes.join('、')}问题需要修复处理`
        );

        updateCylinder(newCylinder.id, {
          repairTaskIds: [newTask.id],
        });
      }

      closeDrawer();
    } else if (editMode === 'edit' && cylinder) {
      updateCylinder(cylinder.id, formData);

      if (needsRepair && !hasActiveRepair) {
        const problemTypes: RepairProblemType[] = [];
        if (tempCylinder.noiseLevel === '高' || tempCylinder.noiseLevel === '严重') {
          problemTypes.push('噪声');
        }
        if (hasSevereCrack(tempCylinder)) {
          problemTypes.push('裂纹');
        }
        if (tempCylinder.materialStatus === '严重磨损') {
          problemTypes.push('磨损');
        }
        if (tempCylinder.materialStatus === '破损') {
          problemTypes.push('破损');
        }
        if (problemTypes.length === 0) {
          problemTypes.push('其他');
        }

        const newTask = createRepairTaskForCylinder(
          tempCylinder,
          problemTypes,
          `系统自动创建：${problemTypes.join('、')}问题需要修复处理`
        );

        const updatedTaskIds = [...(cylinder.repairTaskIds || []), newTask.id];
        updateCylinder(cylinder.id, {
          repairTaskIds: updatedTaskIds,
        });

        setTimeout(() => {
          openRepairDrawer(newTask.id, 'edit');
        }, 300);
      }

      setEditMode('view');
    }
  };

  const handleCreateRepairTask = () => {
    if (!cylinder) return;

    const problemTypes: RepairProblemType[] = [];
    if (cylinder.noiseLevel === '高' || cylinder.noiseLevel === '严重') {
      problemTypes.push('噪声');
    }
    if (hasSevereCrack(cylinder)) {
      problemTypes.push('裂纹');
    }
    if (cylinder.materialStatus === '严重磨损') {
      problemTypes.push('磨损');
    }
    if (cylinder.materialStatus === '破损') {
      problemTypes.push('破损');
    }
    if (problemTypes.length === 0) {
      problemTypes.push('其他');
    }

    const newTask = createRepairTaskForCylinder(
      cylinder,
      problemTypes,
      cylinder.repairSuggestion || `需要进行${problemTypes.join('、')}修复处理`
    );

    updateCylinder(cylinder.id, {
      repairTaskIds: [...cylinder.repairTaskIds, newTask.id],
      currentStatus: '待修复',
    });

    alert('修复任务已创建');
  };

  const handleViewRepairTask = (taskId: string) => {
    closeDrawer();
    setTimeout(() => {
      openRepairDrawer(taskId, 'view');
    }, 300);
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
            {needRepair && !hasActiveRepair && (
              <Chip
                label="需创建修复任务"
                color="warning"
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

          {needRepair && !hasActiveRepair && (
            <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  该蜡筒存在高噪声或严重裂纹问题，根据规则必须创建修复任务。
                </Typography>
                <Button
                  size="small"
                  color="warning"
                  startIcon={<AddIcon />}
                  onClick={handleCreateRepairTask}
                  sx={{ ml: 2, whiteSpace: 'nowrap' }}
                >
                  创建修复任务
                </Button>
              </Box>
            </Alert>
          )}

          {cylinder.lastQualityCheckResult && cylinder.lastQualityCheckResult === '未通过' && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              质检未通过，不能归档。请完成修复后重新提交质检。
            </Alert>
          )}
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
              <Tab label={`修复任务 (${repairTasks.length})`} />
              <Tab label="操作历史" />
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
              <InfoRow
                label="最近质检结果"
                value={cylinder.lastQualityCheckResult || '暂无'}
              />
              <InfoRow
                label="最近质检日期"
                value={cylinder.lastQualityCheckedAt || '-'}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CrackList cylinderId={cylinder.id} editable={isEditable} />
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

          <TabPanel value={tabValue} index={3}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  修复任务列表
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateRepairTask}
                  variant="outlined"
                >
                  新建修复任务
                </Button>
              </Box>
              {repairTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  暂无修复任务
                </Typography>
              ) : (
                <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {repairTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      disablePadding
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleViewRepairTask(task.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemButton>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {task.id}
                              </span>
                              <Chip
                                label={task.status}
                                size="small"
                                color={getRepairStatusColor(task.status)}
                                sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                              />
                            </Box>
                          }
                          secondary={task.title}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <OperationLogList targetType="cylinder" targetId={cylinder.id} />
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

export default CylinderDrawer;
