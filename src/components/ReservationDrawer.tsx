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
  Alert,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import { useReservationStore } from '../store/useReservationStore';
import { useCylinderStore } from '../store/useCylinderStore';
import { useBorrowStore } from '../store/useBorrowStore';
import {
  getPriorityColor,
  getReservationStatusColor,
  getConflictStatusColor,
  getReminderStatusColor,
  getBorrowTypeColor,
} from '../utils/formatters';
import { canBorrow, getBorrowRestrictionReason } from '../utils/validators';
import type { ReservationRecord, ReservationStatus, Cylinder, ReservationPriority, BorrowType } from '../types';

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

const InfoRow: React.FC<{ label: string; value: string; multiline?: boolean }> = ({ label, value, multiline }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

const ReservationDrawer: React.FC = () => {
  const {
    drawerOpen,
    closeDrawer,
    selectedReservationId,
    getReservationById,
    editMode,
    setEditMode,
    createReservation,
    approveReservation,
    adjustReservation,
    applicantList,
    approvers,
    checkConflicts,
    convertToBorrow,
  } = useReservationStore();
  const { cylinders, getCylinderById } = useCylinderStore();
  const { createBorrowRequest } = useBorrowStore();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<ReservationRecord>>({});
  const [selectedCylinderId, setSelectedCylinderId] = useState('');
  const [approvalResult, setApprovalResult] = useState<ReservationStatus | ''>('');
  const [approvalRemark, setApprovalRemark] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [approverName, setApproverName] = useState('');
  const [conflicts, setConflicts] = useState<ReservationRecord[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  const record = selectedReservationId
    ? getReservationById(selectedReservationId)
    : undefined;

  const recordCylinder = record ? getCylinderById(record.cylinderId) : undefined;
  const selectedCylinder = selectedCylinderId ? getCylinderById(selectedCylinderId) : undefined;

  const availableCylinders = cylinders.filter((c) => canBorrow(c));

  useEffect(() => {
    if (drawerOpen) {
      setTabValue(0);
      if (editMode === 'create') {
        setFormData({
          borrowType: '馆内借阅',
          priority: '普通',
          startDate: '',
          endDate: '',
          borrowPurpose: '',
          applicant: '',
          remark: '',
        });
        setSelectedCylinderId('');
        setConflicts([]);
        setShowConflictWarning(false);
      } else if (editMode === 'adjust' && record) {
        setFormData({
          startDate: record.startDate,
          endDate: record.endDate,
          priority: record.priority,
          borrowType: record.borrowType,
        });
        setAdjustReason(record.adjustReason || '');
        const conflictList = checkConflicts(record.cylinderId, record.startDate, record.endDate, record.id);
        setConflicts(conflictList);
        setShowConflictWarning(conflictList.length > 0);
      } else if (editMode === 'approve' && record) {
        setApproverName(record.approver || '');
        setApprovalResult('');
        setApprovalRemark('');
      } else if (record) {
        setFormData(record);
        setSelectedCylinderId(record.cylinderId);
        setApproverName(record.approver || '');
        const conflictList = checkConflicts(record.cylinderId, record.startDate, record.endDate, record.id);
        setConflicts(conflictList);
      }
    }
  }, [drawerOpen, editMode, record]);

  useEffect(() => {
    if ((editMode === 'create' || editMode === 'adjust') && selectedCylinderId && formData.startDate && formData.endDate) {
      const excludeId = editMode === 'adjust' ? record?.id : undefined;
      const conflictList = checkConflicts(selectedCylinderId, formData.startDate, formData.endDate, excludeId);
      setConflicts(conflictList);
      setShowConflictWarning(conflictList.length > 0);
    }
  }, [selectedCylinderId, formData.startDate, formData.endDate, editMode, record?.id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancel = () => {
    if (editMode === 'create') {
      closeDrawer();
    } else {
      setEditMode('view');
      if (record) {
        setFormData(record);
      }
    }
  };

  const handleCreate = () => {
    if (!selectedCylinder) {
      alert('请选择预约的蜡筒');
      return;
    }

    if (showConflictWarning && formData.priority !== '紧急') {
      if (!window.confirm(`检测到 ${conflicts.length} 条时间冲突的预约记录。是否仍要提交预约申请？`)) {
        return;
      }
    }

    const result = createReservation(selectedCylinder, formData);
    if (result) {
      closeDrawer();
    }
  };

  const handleApprove = () => {
    if (!approvalResult) {
      alert('请选择审批结果');
      return;
    }
    if (!approverName.trim()) {
      alert('请填写审批人');
      return;
    }

    if (approvalResult === '已批准' && conflicts.length > 0) {
      if (!window.confirm(`该预约存在 ${conflicts.length} 条冲突记录。批准后将保留冲突状态，是否继续？`)) {
        return;
      }
    }

    if (window.confirm(`确定要${approvalResult}该预约申请吗？`)) {
      const success = approveReservation(record!.id, approvalResult as ReservationStatus, approverName, approvalRemark);
      if (success) {
        setEditMode('view');
      }
    }
  };

  const handleAdjust = () => {
    if (!adjustReason.trim()) {
      alert('请填写调整原因');
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert('预约结束日期不能早于开始日期');
      return;
    }

    if (showConflictWarning && formData.priority !== '紧急') {
      if (!window.confirm(`调整后将产生 ${conflicts.length} 条时间冲突。是否确认调整？`)) {
        return;
      }
    }

    if (window.confirm('确定要调整该预约吗？')) {
      const success = adjustReservation(record!.id, formData, adjustReason);
      if (success) {
        setEditMode('view');
      }
    }
  };

  const handleConvertToBorrow = () => {
    if (!recordCylinder) {
      alert('蜡筒信息异常，无法转换');
      return;
    }

    if (!canBorrow(recordCylinder)) {
      const reasons = getBorrowRestrictionReason(recordCylinder);
      alert('蜡筒当前状态不允许借出：\n' + reasons.join('\n'));
      return;
    }

    if (window.confirm('确定要将该预约转为正式借阅吗？转换后将创建借阅申请记录。')) {
      const borrowRecord = createBorrowRequest(recordCylinder, {
        borrowType: record!.borrowType,
        borrowDate: record!.startDate,
        dueDate: record!.endDate,
        borrowPurpose: record!.borrowPurpose,
        applicant: record!.applicant,
        quantity: 1,
      });

      if (borrowRecord) {
        convertToBorrow(record!.id, borrowRecord.id);
        setEditMode('view');
        alert('已成功转为正式借阅申请');
      }
    }
  };

  const handleCylinderChange = (e: { target: { value: unknown } }) => {
    const value = e.target.value as string;
    setSelectedCylinderId(value);
  };

  const handleBorrowTypeChange = (e: { target: { value: unknown } }) => {
    setFormData({ ...formData, borrowType: e.target.value as BorrowType });
  };

  const handlePriorityChange = (e: { target: { value: unknown } }) => {
    setFormData({ ...formData, priority: e.target.value as ReservationPriority });
  };

  const isViewMode = editMode === 'view';
  const isCreateMode = editMode === 'create';
  const isApproveMode = editMode === 'approve';
  const isAdjustMode = editMode === 'adjust';
  const isConvertMode = editMode === 'convert';

  const drawerTitle =
    isCreateMode ? '新增预约申请' :
    isApproveMode ? '预约审批' :
    isAdjustMode ? '调整预约' :
    isConvertMode ? '转为借阅' :
    '预约详情';

  const canBeReserved = (cylinder: Cylinder | undefined) => {
    if (!cylinder) return false;
    return canBorrow(cylinder);
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 720 } },
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
          {isViewMode && record && record.status === '待审批' && (
            <Button
              size="small"
              startIcon={<HowToRegIcon />}
              onClick={() => setEditMode('approve')}
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
              审批
            </Button>
          )}
          {isViewMode && record && (record.status === '已批准' || record.status === '待审批') && (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditMode('adjust')}
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
              调整
            </Button>
          )}
          {isViewMode && record && record.status === '已批准' && (
            <Button
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={() => setEditMode('convert')}
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
              转借阅
            </Button>
          )}
          {isCreateMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleCreate}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              提交预约
            </Button>
          )}
          {isApproveMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleApprove}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              提交审批
            </Button>
          )}
          {isAdjustMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleAdjust}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              保存调整
            </Button>
          )}
          {isConvertMode && (
            <Button
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={handleConvertToBorrow}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              确认转换
            </Button>
          )}
          <IconButton onClick={closeDrawer} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {isCreateMode ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              提示：同一蜡筒在同一时间段不能重复预约。高优先级申请可触发冲突提示但不能直接覆盖原预约。
            </Alert>

            {showConflictWarning && (
              <Alert severity="warning">
                <strong>⚠ 时间冲突警告：</strong>
                <br />检测到 {conflicts.length} 条冲突的预约记录：
                <List dense>
                  {conflicts.map((c) => (
                    <ListItem key={c.id}>
                      <ListItemText
                        primary={c.reservationNo}
                        secondary={`${c.startDate} ~ ${c.endDate} | ${c.applicant} | ${c.priority} | ${c.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>选择蜡筒</InputLabel>
              <Select
                value={selectedCylinderId}
                label="选择蜡筒"
                onChange={handleCylinderChange}
              >
                <MenuItem value="">
                  <em>请选择要预约的蜡筒</em>
                </MenuItem>
                {availableCylinders.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.id} - {c.title} ({c.materialStatus})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCylinder && (
              <>
                {!canBeReserved(selectedCylinder) && (
                  <Alert severity="error">
                    {getBorrowRestrictionReason(selectedCylinder).map((r, i) => (
                      <div key={i}>• {r}</div>
                    ))}
                  </Alert>
                )}
                <Alert severity="info">
                  <strong>蜡筒信息：</strong>
                  <br />编号：{selectedCylinder.id}
                  <br />标题：{selectedCylinder.title}
                  <br />材质状态：{selectedCylinder.materialStatus}
                  <br />噪声等级：{selectedCylinder.noiseLevel}
                  <br />当前状态：{selectedCylinder.currentStatus}
                </Alert>
              </>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>借阅类型</InputLabel>
              <Select
                value={formData.borrowType || '馆内借阅'}
                label="借阅类型"
                onChange={handleBorrowTypeChange}
              >
                <MenuItem value="馆内借阅">馆内借阅</MenuItem>
                <MenuItem value="外部借展">外部借展</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>优先级</InputLabel>
              <Select
                value={formData.priority || '普通'}
                label="优先级"
                onChange={handlePriorityChange}
              >
                <MenuItem value="普通">普通</MenuItem>
                <MenuItem value="优先">优先</MenuItem>
                <MenuItem value="紧急">紧急</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="预约开始日期"
              type="date"
              size="small"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="预约结束日期"
              type="date"
              size="small"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="借阅用途"
              size="small"
              multiline
              rows={3}
              value={formData.borrowPurpose || ''}
              onChange={(e) => setFormData({ ...formData, borrowPurpose: e.target.value })}
              placeholder="请填写借阅用途..."
            />

            <FormControl size="small" fullWidth>
              <InputLabel>申请人</InputLabel>
              <Select
                value={formData.applicant || ''}
                label="申请人"
                onChange={(e) => setFormData({ ...formData, applicant: e.target.value as string })}
              >
                <MenuItem value="">
                  <em>请选择申请人</em>
                </MenuItem>
                {applicantList.map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="备注"
              size="small"
              multiline
              rows={2}
              value={formData.remark || ''}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="可选：备注信息"
            />
          </Stack>
        </Box>
      ) : isApproveMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              预约单号：<strong>{record.reservationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />申请人：{record.applicant}
              <br />预约时间：{record.startDate} ~ {record.endDate}
              <br />优先级：{record.priority}
              <br />借阅用途：{record.borrowPurpose}
            </Alert>

            {conflicts.length > 0 && (
              <Alert severity="warning">
                <strong>⚠ 冲突提醒：</strong>该预约与以下 {conflicts.length} 条记录存在时间冲突：
                <List dense>
                  {conflicts.map((c) => (
                    <ListItem key={c.id}>
                      <ListItemText
                        primary={`${c.reservationNo} (${c.priority})`}
                        secondary={`${c.startDate} ~ ${c.endDate} | ${c.applicant} | ${c.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="caption">
                  注意：高优先级申请可触发冲突提示但不能直接覆盖原预约。
                </Typography>
              </Alert>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>审批结果</InputLabel>
              <Select
                value={approvalResult}
                label="审批结果"
                onChange={(e) => setApprovalResult(e.target.value as ReservationStatus)}
              >
                <MenuItem value="已批准">已批准</MenuItem>
                <MenuItem value="已拒绝">已拒绝</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>审批人</InputLabel>
              <Select
                value={approverName}
                label="审批人"
                onChange={(e) => setApproverName(e.target.value as string)}
              >
                {approvers.map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="审批备注"
              size="small"
              multiline
              rows={3}
              value={approvalRemark}
              onChange={(e) => setApprovalRemark(e.target.value)}
              placeholder="可选：审批意见或备注"
            />
          </Stack>
        </Box>
      ) : isAdjustMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              预约单号：<strong>{record.reservationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />当前状态：{record.status}
            </Alert>

            {showConflictWarning && (
              <Alert severity="warning">
                <strong>⚠ 调整后冲突：</strong>
                <br />调整后将与 {conflicts.length} 条记录产生冲突：
                <List dense>
                  {conflicts.map((c) => (
                    <ListItem key={c.id}>
                      <ListItemText
                        primary={c.reservationNo}
                        secondary={`${c.startDate} ~ ${c.endDate} | ${c.applicant} | ${c.priority}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>借阅类型</InputLabel>
              <Select
                value={formData.borrowType || '馆内借阅'}
                label="借阅类型"
                onChange={handleBorrowTypeChange}
              >
                <MenuItem value="馆内借阅">馆内借阅</MenuItem>
                <MenuItem value="外部借展">外部借展</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>优先级</InputLabel>
              <Select
                value={formData.priority || '普通'}
                label="优先级"
                onChange={handlePriorityChange}
              >
                <MenuItem value="普通">普通</MenuItem>
                <MenuItem value="优先">优先</MenuItem>
                <MenuItem value="紧急">紧急</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="预约开始日期"
              type="date"
              size="small"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="预约结束日期"
              type="date"
              size="small"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="调整原因"
              size="small"
              multiline
              rows={3}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="请填写调整原因..."
              error
            />
          </Stack>
        </Box>
      ) : isConvertMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              将以下预约转为正式借阅申请：
              <br /><br />
              预约单号：<strong>{record.reservationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />借阅类型：{record.borrowType}
              <br />预约时间：{record.startDate} ~ {record.endDate}
              <br />申请人：{record.applicant}
              <br />借阅用途：{record.borrowPurpose}
            </Alert>

            {recordCylinder && !canBorrow(recordCylinder) && (
              <Alert severity="error">
                <strong>⚠ 蜡筒状态异常：</strong>
                {getBorrowRestrictionReason(recordCylinder).map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
              </Alert>
            )}

            <Alert severity="warning">
              注意：预约转正式借出时将再次校验蜡筒状态。转换后将创建新的借阅申请记录，并需要走审批流程。
            </Alert>
          </Stack>
        </Box>
      ) : record ? (
        <>
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                {record.reservationNo}
              </Typography>
              <Chip
                label={record.priority}
                color={getPriorityColor(record.priority)}
                size="small"
              />
              <Chip
                label={record.borrowType}
                color={getBorrowTypeColor(record.borrowType)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={record.status}
                color={getReservationStatusColor(record.status)}
                size="small"
              />
              <Chip
                label={record.conflictStatus}
                color={getConflictStatusColor(record.conflictStatus)}
                size="small"
                variant={record.conflictStatus === '有冲突' ? 'filled' : 'outlined'}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
              {record.cylinderTitle}
            </Typography>
            {recordCylinder && (
              <Alert severity="info" sx={{ mb: 2 }}>
                蜡筒编号：{recordCylinder.id} | 材质：{recordCylinder.materialStatus} | 噪声：{recordCylinder.noiseLevel}
              </Alert>
            )}
          </Box>

          <Divider sx={{ mt: 1 }} />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="基本信息" />
              <Tab label="预约详情" />
              <Tab label="状态追踪" />
              {conflicts.length > 0 && <Tab label={`冲突 (${conflicts.length})`} />}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="预约单号" value={record.reservationNo} />
              <InfoRow label="蜡筒编号" value={record.cylinderId} />
              <InfoRow label="蜡筒名称" value={record.cylinderTitle} />
              <InfoRow label="借阅类型" value={record.borrowType} />
              <InfoRow label="优先级" value={record.priority} />
              <InfoRow label="申请人" value={record.applicant} />
              <InfoRow label="申请时间" value={record.createdAt} />
              <InfoRow label="提醒状态" value={record.reminderStatus} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="预约开始日期" value={record.startDate || '-'} />
              <InfoRow label="预约结束日期" value={record.endDate || '-'} />
              <InfoRow label="借阅用途" value={record.borrowPurpose} multiline />
              <InfoRow label="调整原因" value={record.adjustReason || '-'} multiline />
              <InfoRow label="备注" value={record.remark || '-'} multiline />
              {record.relatedBorrowId && (
                <InfoRow label="关联借阅记录" value={record.relatedBorrowId} />
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="预约状态" value={record.status} />
              <InfoRow label="冲突状态" value={record.conflictStatus} />
              <InfoRow label="审批人" value={record.approver || '-'} />
              <InfoRow label="审批时间" value={record.approvedAt || '-'} />
            </Box>
          </TabPanel>

          {conflicts.length > 0 && (
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  该预约与以下 {conflicts.length} 条记录存在时间冲突
                </Alert>
                <List>
                  {conflicts.map((c) => (
                    <ListItem key={c.id} divider>
                      <ListItemButton>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.reservationNo}</span>
                              <Chip label={c.priority} size="small" color={getPriorityColor(c.priority)} />
                              <Chip label={c.status} size="small" color={getReservationStatusColor(c.status)} />
                            </Box>
                          }
                          secondary={
                            <>
                              {c.startDate} ~ {c.endDate}
                              <br />
                              申请人：{c.applicant}
                              <br />
                              用途：{c.borrowPurpose}
                            </>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </TabPanel>
          )}
        </>
      ) : null}
    </Drawer>
  );
};

export default ReservationDrawer;
