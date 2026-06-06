import type { StatusColor, StatusColorMap } from '../types/base';

export function formatYear(year: number): string {
  return `${year}年`;
}

export function formatProgress(progress: number): string {
  return `${progress}%`;
}

export const cylinderStatusColorMap: StatusColorMap = {
  '待转录': 'default',
  '转录中': 'primary',
  '已完成': 'success',
  '已归档': 'info',
  '待修复': 'warning',
  '修复中': 'primary',
  '待质检': 'warning',
  '质检未通过': 'error',
  '待指派': 'default',
};

export const noiseLevelColorMap: StatusColorMap = {
  '低': 'success',
  '中': 'info',
  '高': 'warning',
  '严重': 'error',
};

export const crackSeverityColorMap: StatusColorMap = {
  '轻微': 'success',
  '中等': 'warning',
  '严重': 'error',
};

export const materialStatusColorMap: StatusColorMap = {
  '完好': 'success',
  '轻微磨损': 'info',
  '严重磨损': 'warning',
  '破损': 'error',
};

export const repairStatusColorMap: StatusColorMap = {
  '待指派': 'default',
  '修复中': 'primary',
  '待质检': 'warning',
  '质检通过': 'success',
  '质检未通过': 'error',
  '已完成': 'info',
};

export const problemTypeColorMap: StatusColorMap = {
  '裂纹': 'error',
  '噪声': 'warning',
  '磨损': 'info',
  '破损': 'error',
  '其他': 'default',
};

export const qualityCheckResultColorMap: StatusColorMap = {
  '通过': 'success',
  '未通过': 'error',
};

export const approvalStatusColorMap: StatusColorMap = {
  '待审批': 'warning',
  '审批通过': 'success',
  '审批拒绝': 'error',
  '已撤销': 'default',
};

export const returnStatusColorMap: StatusColorMap = {
  '未归还': 'info',
  '已归还': 'success',
  '超期': 'error',
  '损坏待复核': 'warning',
};

export const borrowTypeColorMap: StatusColorMap = {
  '馆内借阅': 'primary',
  '外部借展': 'secondary',
};

export const priorityColorMap: StatusColorMap = {
  '普通': 'default',
  '优先': 'primary',
  '紧急': 'error',
};

export const reservationStatusColorMap: StatusColorMap = {
  '待审批': 'warning',
  '已批准': 'success',
  '已拒绝': 'error',
  '已取消': 'default',
  '已完成': 'info',
  '已转借出': 'primary',
};

export const conflictStatusColorMap: StatusColorMap = {
  '无冲突': 'success',
  '有冲突': 'error',
  '冲突已解决': 'warning',
};

export const reminderStatusColorMap: StatusColorMap = {
  '未提醒': 'default',
  '已提醒': 'success',
  '无需提醒': 'info',
};

export function getStatusColorFromMap(
  status: string,
  colorMap: StatusColorMap,
  defaultColor: StatusColor = 'default'
): StatusColor {
  return colorMap[status] || defaultColor;
}

export function getStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, cylinderStatusColorMap);
}

export function getNoiseColor(level: string): StatusColor {
  return getStatusColorFromMap(level, noiseLevelColorMap, 'info');
}

export function getCrackSeverityColor(severity: string): StatusColor {
  return getStatusColorFromMap(severity, crackSeverityColorMap, 'warning');
}

export function getMaterialStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, materialStatusColorMap, 'info');
}

export function getRepairStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, repairStatusColorMap);
}

export function getProblemTypeColor(type: string): StatusColor {
  return getStatusColorFromMap(type, problemTypeColorMap);
}

export function getQualityCheckResultColor(result: string): StatusColor {
  return result === '通过' ? 'success' : 'error';
}

export function getApprovalStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, approvalStatusColorMap);
}

export function getReturnStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, returnStatusColorMap);
}

export function getBorrowTypeColor(type: string): StatusColor {
  return type === '馆内借阅' ? 'primary' : 'secondary';
}

export function getPriorityColor(priority: string): StatusColor {
  return getStatusColorFromMap(priority, priorityColorMap);
}

export function getReservationStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, reservationStatusColorMap);
}

export function getConflictStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, conflictStatusColorMap);
}

export function getReminderStatusColor(status: string): StatusColor {
  return getStatusColorFromMap(status, reminderStatusColorMap);
}
