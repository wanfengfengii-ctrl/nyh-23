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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useBorrowStore } from '../store/useBorrowStore';
import { useCylinderStore } from '../store/useCylinderStore';
import {
  getApprovalStatusColor,
  getReturnStatusColor,
  getBorrowTypeColor,
} from '../utils/formatters';
import { canBorrow, getBorrowRestrictionReason } from '../utils/validators';
import type { BorrowRecord, BorrowType, BorrowApprovalStatus, Cylinder } from '../types';

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

const BorrowDrawer: React.FC = () => {
  const {
    drawerOpen,
    closeDrawer,
    selectedRecordId,
    getBorrowRecordById,
    editMode,
    setEditMode,
    createBorrowRequest,
    approveBorrow,
    returnBorrow,
    completeDamageCheck,
    approvers,
  } = useBorrowStore();
  const { cylinders, getCylinderById } = useCylinderStore();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<BorrowRecord>>({});
  const [selectedCylinderId, setSelectedCylinderId] = useState('');
  const [approvalResult, setApprovalResult] = useState<BorrowApprovalStatus | ''>('');
  const [approvalRemark, setApprovalRemark] = useState('');
  const [conditionAfter, setConditionAfter] = useState('');
  const [hasDamage, setHasDamage] = useState(false);
  const [damageNote, setDamageNote] = useState('');
  const [damageCheckNote, setDamageCheckNote] = useState('');
  const [damageChecker, setDamageChecker] = useState('');
  const [approverName, setApproverName] = useState('');

  const record = selectedRecordId
    ? getBorrowRecordById(selectedRecordId)
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
          quantity: 1,
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          borrowPurpose: '',
          handoverRemark: '',
          applicant: '',
        });
        setSelectedCylinderId('');
      } else if (record) {
        setFormData(record);
        setSelectedCylinderId(record.cylinderId);
        setConditionAfter(record.conditionAfter);
        setHasDamage(record.returnStatus === '损坏待复核');
        setDamageNote(record.damageCheckNote);
        setDamageCheckNote(record.damageCheckNote);
        setApproverName(record.approver || '');
      }
    }
  }, [drawerOpen, editMode, record]);

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
      alert('请选择借阅的蜡筒');
      return;
    }

    const result = createBorrowRequest(selectedCylinder, formData);
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
    if (window.confirm(`确定要${approvalResult}该借阅申请吗？`)) {
      approveBorrow(record!.id, approvalResult as BorrowApprovalStatus, approverName, approvalRemark);
      setEditMode('view');
    }
  };

  const handleReturn = () => {
    if (!conditionAfter.trim()) {
      alert('请填写归还时状态');
      return;
    }
    if (hasDamage && !damageNote.trim()) {
      alert('状态变差时必须登记损坏复核说明');
      return;
    }
    if (window.confirm('确定要登记归还吗？')) {
      returnBorrow(record!.id, conditionAfter, hasDamage, damageNote);
      setEditMode('view');
    }
  };

  const handleDamageCheck = () => {
    if (!damageCheckNote.trim()) {
      alert('请填写损坏复核说明');
      return;
    }
    if (!damageChecker.trim()) {
      alert('请填写复核人');
      return;
    }
    if (window.confirm('确定要完成损坏复核吗？')) {
      completeDamageCheck(record!.id, damageCheckNote, damageChecker);
      setEditMode('view');
    }
  };

  const handleCylinderChange = (e: { target: { value: unknown } }) => {
    const value = e.target.value as string;
    setSelectedCylinderId(value);
  };

  const handleBorrowTypeChange = (e: { target: { value: unknown } }) => {
    setFormData({ ...formData, borrowType: e.target.value as BorrowType });
  };

  const isViewMode = editMode === 'view';
  const isCreateMode = editMode === 'create';
  const isApproveMode = editMode === 'approve';
  const isReturnMode = editMode === 'return';
  const isDamageCheckMode = editMode === 'damageCheck';

  const drawerTitle =
    isCreateMode ? '新增借阅申请' :
    isApproveMode ? '借阅审批' :
    isReturnMode ? '归还登记' :
    isDamageCheckMode ? '损坏复核' :
    '借阅详情';

  const canBeBorrowed = (cylinder: Cylinder | undefined) => {
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
          {isViewMode && record && record.approvalStatus === '待审批' && (
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
          {isViewMode && record && record.approvalStatus === '审批通过' &&
            record.returnStatus !== '已归还' && record.returnStatus !== '损坏待复核' && (
            <Button
              size="small"
              startIcon={<AssignmentTurnedInIcon />}
              onClick={() => setEditMode('return')}
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
              归还登记
            </Button>
          )}
          {isViewMode && record && record.returnStatus === '损坏待复核' && (
            <Button
              size="small"
              startIcon={<BugReportIcon />}
              onClick={() => setEditMode('damageCheck')}
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
              损坏复核
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
              提交申请
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
          {isReturnMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleReturn}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              确认归还
            </Button>
          )}
          {isDamageCheckMode && (
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleDamageCheck}
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              完成复核
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
              提示：只有已归档且材质状态稳定的蜡筒才允许外借。存在严重裂纹或高噪声待修复的记录禁止外借。
            </Alert>

            <FormControl size="small" fullWidth>
              <InputLabel>选择蜡筒</InputLabel>
              <Select
                value={selectedCylinderId}
                label="选择蜡筒"
                onChange={handleCylinderChange}
              >
                <MenuItem value="">
                  <em>请选择要借阅的蜡筒</em>
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
                {!canBeBorrowed(selectedCylinder) && (
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

            <TextField
              label="借出数量"
              type="number"
              size="small"
              value={formData.quantity || 1}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              InputProps={{ inputProps: { min: 1 } }}
            />

            <TextField
              label="借出日期"
              type="date"
              size="small"
              value={formData.borrowDate || ''}
              onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="应还日期"
              type="date"
              size="small"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

            <TextField
              label="申请人"
              size="small"
              value={formData.applicant || ''}
              onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
            />

            <TextField
              label="交接备注"
              size="small"
              multiline
              rows={2}
              value={formData.handoverRemark || ''}
              onChange={(e) => setFormData({ ...formData, handoverRemark: e.target.value })}
              placeholder="可选：交接时的备注信息"
            />
          </Stack>
        </Box>
      ) : isApproveMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              申请单号：<strong>{record.applicationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />申请人：{record.applicant}
              <br />借阅用途：{record.borrowPurpose}
            </Alert>

            <FormControl size="small" fullWidth>
              <InputLabel>审批结果</InputLabel>
              <Select
                value={approvalResult}
                label="审批结果"
                onChange={(e) => setApprovalResult(e.target.value as BorrowApprovalStatus)}
              >
                <MenuItem value="审批通过">审批通过</MenuItem>
                <MenuItem value="审批拒绝">审批拒绝</MenuItem>
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
      ) : isReturnMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              申请单号：<strong>{record.applicationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />借出日期：{record.borrowDate}
              <br />应还日期：{record.dueDate}
              <br />借出时状态：{record.conditionBefore || '-'}
            </Alert>

            <TextField
              label="归还时状态"
              size="small"
              multiline
              rows={3}
              value={conditionAfter}
              onChange={(e) => setConditionAfter(e.target.value)}
              placeholder="请描述归还时蜡筒的状态..."
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={hasDamage}
                  onChange={(e) => setHasDamage(e.target.checked)}
                />
              }
              label="状态变差 / 有损坏"
            />

            {hasDamage && (
              <TextField
                label="损坏说明"
                size="small"
                multiline
                rows={3}
                value={damageNote}
                onChange={(e) => setDamageNote(e.target.value)}
                placeholder="请详细描述损坏情况，将进入损坏复核流程"
                error
              />
            )}

            <Alert severity="warning">
              注意：归还时若状态变差必须登记损坏复核，将启动损坏复核流程。
            </Alert>
          </Stack>
        </Box>
      ) : isDamageCheckMode && record ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="warning">
              申请单号：<strong>{record.applicationNo}</strong>
              <br />蜡筒：{record.cylinderId} - {record.cylinderTitle}
              <br />损坏说明：{record.damageCheckNote || '无'}
              <br />归还时状态：{record.conditionAfter || '-'}
            </Alert>

            <TextField
              label="损坏复核结果"
              size="small"
              multiline
              rows={4}
              value={damageCheckNote}
              onChange={(e) => setDamageCheckNote(e.target.value)}
              placeholder="请填写损坏复核的详细结果和处理建议..."
            />

            <FormControl size="small" fullWidth>
              <InputLabel>复核人</InputLabel>
              <Select
                value={damageChecker}
                label="复核人"
                onChange={(e) => setDamageChecker(e.target.value as string)}
              >
                {approvers.map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
                {record.applicationNo}
              </Typography>
              <Chip
                label={record.borrowType}
                color={getBorrowTypeColor(record.borrowType)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={record.approvalStatus}
                color={getApprovalStatusColor(record.approvalStatus)}
                size="small"
              />
              <Chip
                label={record.returnStatus}
                color={getReturnStatusColor(record.returnStatus)}
                size="small"
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
              <Tab label="借阅详情" />
              <Tab label="状态追踪" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="申请单号" value={record.applicationNo} />
              <InfoRow label="蜡筒编号" value={record.cylinderId} />
              <InfoRow label="蜡筒名称" value={record.cylinderTitle} />
              <InfoRow label="借阅类型" value={record.borrowType} />
              <InfoRow label="借出数量" value={String(record.quantity)} />
              <InfoRow label="申请人" value={record.applicant} />
              <InfoRow label="申请时间" value={record.createdAt} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="借出日期" value={record.borrowDate || '-'} />
              <InfoRow label="应还日期" value={record.dueDate || '-'} />
              <InfoRow label="实际归还日期" value={record.actualReturnDate || '-'} />
              <InfoRow label="借阅用途" value={record.borrowPurpose} multiline />
              <InfoRow label="交接备注" value={record.handoverRemark || '-'} multiline />
              <InfoRow label="借出前状态" value={record.conditionBefore || '-'} multiline />
              <InfoRow label="归还后状态" value={record.conditionAfter || '-'} multiline />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow label="审批状态" value={record.approvalStatus} />
              <InfoRow label="审批人" value={record.approver || '-'} />
              <InfoRow label="审批时间" value={record.approvedAt || '-'} />
              <InfoRow label="归还状态" value={record.returnStatus} />
              <InfoRow label="损坏复核说明" value={record.damageCheckNote || '-'} multiline />
              <InfoRow label="损坏复核人" value={record.damageCheckedBy || '-'} />
              <InfoRow label="损坏复核时间" value={record.damageCheckedAt || '-'} />
            </Box>
          </TabPanel>
        </>
      ) : null}
    </Drawer>
  );
};

export default BorrowDrawer;
