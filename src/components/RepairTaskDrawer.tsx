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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRepairStore } from '../store/useRepairStore';
import { useCylinderStore } from '../store/useCylinderStore';
import {
  getRepairStatusColor,
  getProblemTypeColor,
  getQualityCheckResultColor,
} from '../utils/formatters';
import { validateRepairTask } from '../utils/validators';
import { repairStaff, qualityInspectors } from '../data/mockData';
import type { RepairTask, RepairProblemType, QualityCheckResult } from '../types';
import OperationLogList from './OperationLogList';

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

const RepairTaskDrawer: React.FC = () => {
  const {
    drawerOpen,
    closeDrawer,
    selectedTaskId,
    getRepairTaskById,
    addRepairTask,
    updateRepairTask,
    editMode,
    setEditMode,
    startRepair,
    completeRepair,
    submitQualityCheck,
    assignTask,
  } = useRepairStore();
  const { cylinders, getCylinderById } = useCylinderStore();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<RepairTask>>({});
  const [qualityCheckResult, setQualityCheckResult] = useState<QualityCheckResult | null>(null);
  const [qualityCheckNote, setQualityCheckNote] = useState('');
  const [qualityInspector, setQualityInspector] = useState('');

  const task = selectedTaskId
    ? getRepairTaskById(selectedTaskId)
    : undefined;

  const cylinder = task ? getCylinderById(task.cylinderId) : undefined;

  useEffect(() => {
    if (drawerOpen) {
      setTabValue(0);
      if (editMode === 'create') {
        setFormData({
          id: '',
          cylinderId: '',
          title: '',
          problemTypes: [],
          description: '',
          status: '待指派',
          assignee: null,
          createdAt: new Date().toISOString().split('T')[0],
          assignedAt: null,
          startedAt: null,
          completedAt: null,
          beforeRepairNote: '',
          afterRepairNote: '',
          beforeRepairImages: [],
          afterRepairImages: [],
          repairMethod: '',
          repairResult: '',
          responsiblePerson: '',
          qualityCheckResult: null,
          qualityCheckNote: '',
          qualityCheckedBy: null,
          qualityCheckedAt: null,
          reworkCount: 0,
        });
      } else if (task) {
        setFormData(task);
        setQualityCheckResult(task.qualityCheckResult);
        setQualityCheckNote(task.qualityCheckNote);
        setQualityInspector(task.qualityCheckedBy || '');
      }
    }
  }, [drawerOpen, editMode, task]);

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
      if (task) {
        setFormData(task);
      }
    }
  };

  const handleSave = () => {
    const result = validateRepairTask(formData, editMode !== 'create');

    if (!result.valid) {
      const firstError = Object.values(result.errors)[0];
      alert(firstError);
      return;
    }

    if (editMode === 'create') {
      const newTask = {
        ...formData,
        id: `REP-${Date.now()}`,
        beforeRepairNote: formData.description || '',
      } as RepairTask;
      addRepairTask(newTask);
      closeDrawer();
    } else if (editMode === 'edit' && task) {
      updateRepairTask(task.id, formData);
      setEditMode('view');
    }
  };

  const handleStartRepair = () => {
    if (!formData.assignee) {
      alert('请先指派修复人员');
      return;
    }
    if (window.confirm('确定要开始修复吗？')) {
      startRepair(task!.id);
    }
  };

  const handleCompleteRepair = () => {
    if (!formData.afterRepairNote?.trim()) {
      alert('请填写修复后记录');
      return;
    }
    if (!formData.repairMethod?.trim()) {
      alert('请填写修复方法');
      return;
    }
    if (!formData.repairResult?.trim()) {
      alert('请填写处理结果');
      return;
    }
    if (!formData.responsiblePerson?.trim()) {
      alert('请填写责任人');
      return;
    }
    if (window.confirm('确定要提交修复完成并申请质检吗？')) {
      completeRepair(task!.id, {
        afterRepairNote: formData.afterRepairNote,
        repairMethod: formData.repairMethod,
        repairResult: formData.repairResult,
        responsiblePerson: formData.responsiblePerson,
      });
    }
  };

  const handleSubmitQualityCheck = () => {
    if (!qualityCheckResult) {
      alert('请选择质检结果');
      return;
    }
    if (!qualityCheckNote.trim()) {
      alert('请填写质检说明');
      return;
    }
    if (!qualityInspector.trim()) {
      alert('请选择质检人员');
      return;
    }
    if (window.confirm(`确定要提交质检结果（${qualityCheckResult}）吗？`)) {
      submitQualityCheck(task!.id, qualityCheckResult, qualityCheckNote, qualityInspector);
      setEditMode('view');
    }
  };

  const handleAssign = () => {
    if (!formData.assignee) {
      alert('请选择修复人员');
      return;
    }
    assignTask(task!.id, formData.assignee);
  };

  const handleProblemTypeChange = (type: RepairProblemType, checked: boolean) => {
    const currentTypes = formData.problemTypes || [];
    let newTypes: RepairProblemType[];
    if (checked) {
      newTypes = [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter((t) => t !== type);
    }
    setFormData({ ...formData, problemTypes: newTypes });
  };

  const isEditable = editMode === 'edit' || editMode === 'create';
  const isViewMode = editMode === 'view';
  const isQualityCheckMode = editMode === 'qualityCheck';
  const drawerTitle =
    editMode === 'create'
      ? '新增修复任务'
      : isViewMode
      ? '修复任务详情'
      : isQualityCheckMode
      ? '质检登记'
      : '编辑修复任务';

  const problemTypeOptions: RepairProblemType[] = ['裂纹', '噪声', '磨损', '破损', '其他'];

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 700 } },
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
          {isViewMode && task && task.status === '待指派' && (
            <Button
              size="small"
              startIcon={<AssignmentIcon />}
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
              指派
            </Button>
          )}
          {isViewMode && task && (task.status === '待指派' || task.status === '质检未通过') && task.assignee && (
            <Button
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartRepair}
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
              开始修复
            </Button>
          )}
          {isViewMode && task && task.status === '修复中' && (
            <Button
              size="small"
              startIcon={<CheckCircleIcon />}
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
              完成修复
            </Button>
          )}
          {isViewMode && task && task.status === '待质检' && (
            <Button
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() => setEditMode('qualityCheck')}
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
              质检登记
            </Button>
          )}
          {isViewMode && task && (
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
          {isQualityCheckMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSubmitQualityCheck}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              提交质检
            </Button>
          )}
          {isEditable && (
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

      {task && isViewMode && (
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
              {task.id}
            </Typography>
            <Chip
              label={task.status}
              color={getRepairStatusColor(task.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {task.reworkCount > 0 && (
              <Chip
                label={`返工${task.reworkCount}次`}
                color="error"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {task.problemTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                color={getProblemTypeColor(type)}
                variant="outlined"
              />
            ))}
          </Box>
          {cylinder && (
            <Alert severity="info" sx={{ mb: 2 }}>
              关联蜡筒：{cylinder.id} - {cylinder.title}
            </Alert>
          )}
        </Box>
      )}

      {(isViewMode || isQualityCheckMode) && task ? (
        <>
          <Divider sx={{ mt: 1 }} />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="基本信息" />
              <Tab label="修复前后对比" />
              <Tab label="质检结果" />
              <Tab label="操作历史" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="任务编号" value={task.id} />
              <InfoRow label="任务标题" value={task.title} />
              <InfoRow
                label="关联蜡筒"
                value={cylinder ? `${cylinder.id} - ${cylinder.title}` : task.cylinderId}
              />
              <InfoRow
                label="问题类型"
                value={task.problemTypes.join('、')}
              />
              <InfoRow label="负责人" value={task.assignee || '未指派'} />
              <InfoRow label="创建日期" value={task.createdAt} />
              <InfoRow label="指派日期" value={task.assignedAt || '-'} />
              <InfoRow label="开始日期" value={task.startedAt || '-'} />
              <InfoRow label="完成日期" value={task.completedAt || '-'} />
              <InfoRow label="任务描述" value={task.description} />

              {task.status === '待指派' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'warning.main' }}>
                    任务指派
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>选择修复人员</InputLabel>
                    <Select
                      value={formData.assignee || ''}
                      label="选择修复人员"
                      onChange={(e) => setFormData({ ...formData, assignee: e.target.value || null })}
                    >
                      <MenuItem value="">未指派</MenuItem>
                      {repairStaff.map((person) => (
                        <MenuItem key={person} value={person}>
                          {person}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<AssignmentIcon />}
                    onClick={handleAssign}
                    disabled={!formData.assignee}
                  >
                    确认指派
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'error.main' }}>
                  修复前记录
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'error.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.100',
                  }}
                >
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {task.beforeRepairNote || '暂无记录'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'success.main' }}>
                  修复后记录
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'success.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.100',
                  }}
                >
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {task.afterRepairNote || '暂无记录'}
                  </Typography>
                </Box>
              </Box>

              <InfoRow label="修复方法" value={task.repairMethod || '-'} />
              <InfoRow label="处理结果" value={task.repairResult || '-'} />
              <InfoRow label="责任人" value={task.responsiblePerson || '-'} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {isQualityCheckMode ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>质检结果</InputLabel>
                  <Select
                    value={qualityCheckResult || ''}
                    label="质检结果"
                    onChange={(e) => setQualityCheckResult(e.target.value as QualityCheckResult)}
                    size="small"
                  >
                    <MenuItem value="通过">通过</MenuItem>
                    <MenuItem value="未通过">未通过</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>质检人员</InputLabel>
                  <Select
                    value={qualityInspector}
                    label="质检人员"
                    onChange={(e) => setQualityInspector(e.target.value)}
                    size="small"
                  >
                    {qualityInspectors.map((inspector) => (
                      <MenuItem key={inspector} value={inspector}>
                        {inspector}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="质检说明"
                  value={qualityCheckNote}
                  onChange={(e) => setQualityCheckNote(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="请详细描述质检情况..."
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {task.qualityCheckResult ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        质检结果：
                      </Typography>
                      <Chip
                        label={task.qualityCheckResult}
                        color={getQualityCheckResultColor(task.qualityCheckResult)}
                        size="small"
                      />
                    </Box>
                    <InfoRow label="质检人员" value={task.qualityCheckedBy || '-'} />
                    <InfoRow label="质检日期" value={task.qualityCheckedAt || '-'} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        质检说明
                      </Typography>
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
                          {task.qualityCheckNote || '暂无说明'}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    暂无质检记录
                  </Typography>
                )}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <OperationLogList targetType="repairTask" targetId={task.id} />
          </TabPanel>
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {editMode === 'create' && (
              <FormControl fullWidth>
                <InputLabel>关联蜡筒</InputLabel>
                <Select
                  value={formData.cylinderId || ''}
                  label="关联蜡筒"
                  onChange={(e) => setFormData({ ...formData, cylinderId: e.target.value })}
                  size="small"
                >
                  {cylinders.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.id} - {c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="任务标题"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              size="small"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                问题类型
              </Typography>
              <FormGroup row>
                {problemTypeOptions.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={(formData.problemTypes || []).includes(type)}
                        onChange={(e) => handleProblemTypeChange(type, e.target.checked)}
                        size="small"
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Box>

            <TextField
              label="任务描述"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            {(editMode === 'edit' || editMode === 'create') && (
              <FormControl fullWidth size="small">
                <InputLabel>负责人</InputLabel>
                <Select
                  value={formData.assignee || ''}
                  label="负责人"
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value || null })}
                >
                  <MenuItem value="">未指派</MenuItem>
                  {repairStaff.map((person) => (
                    <MenuItem key={person} value={person}>
                      {person}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {(task?.status === '修复中' || task?.status === '质检未通过' || editMode === 'edit') && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  修复信息
                </Typography>

                <TextField
                  label="修复前记录"
                  value={formData.beforeRepairNote || ''}
                  onChange={(e) => setFormData({ ...formData, beforeRepairNote: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="修复后记录"
                  value={formData.afterRepairNote || ''}
                  onChange={(e) => setFormData({ ...formData, afterRepairNote: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="修复方法"
                  value={formData.repairMethod || ''}
                  onChange={(e) => setFormData({ ...formData, repairMethod: e.target.value })}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="处理结果"
                  value={formData.repairResult || ''}
                  onChange={(e) => setFormData({ ...formData, repairResult: e.target.value })}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="责任人"
                  value={formData.responsiblePerson || ''}
                  onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  fullWidth
                  size="small"
                />

                {(task?.status === '修复中' || task?.status === '质检未通过') && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleCompleteRepair}
                    sx={{ mt: 2 }}
                  >
                    提交修复完成并申请质检
                  </Button>
                )}
              </>
            )}
          </Stack>
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
    <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', flex: 1, ml: 2 }}>
      {value || '-'}
    </Typography>
  </Box>
);

export default RepairTaskDrawer;
