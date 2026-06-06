export function formatYear(year: number): string {
  return `${year}年`;
}

export function formatProgress(progress: number): string {
  return `${progress}%`;
}

export function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case '待转录':
      return 'default';
    case '转录中':
      return 'primary';
    case '已完成':
      return 'success';
    case '已归档':
      return 'info';
    case '待修复':
      return 'warning';
    case '修复中':
      return 'primary';
    case '待质检':
      return 'warning';
    case '质检未通过':
      return 'error';
    case '待指派':
      return 'default';
    default:
      return 'default';
  }
}

export function getNoiseColor(level: string): 'success' | 'info' | 'warning' | 'error' {
  switch (level) {
    case '低':
      return 'success';
    case '中':
      return 'info';
    case '高':
      return 'warning';
    case '严重':
      return 'error';
    default:
      return 'info';
  }
}

export function getCrackSeverityColor(severity: string): 'success' | 'warning' | 'error' {
  switch (severity) {
    case '轻微':
      return 'success';
    case '中等':
      return 'warning';
    case '严重':
      return 'error';
    default:
      return 'warning';
  }
}

export function getMaterialStatusColor(status: string): 'success' | 'info' | 'warning' | 'error' {
  switch (status) {
    case '完好':
      return 'success';
    case '轻微磨损':
      return 'info';
    case '严重磨损':
      return 'warning';
    case '破损':
      return 'error';
    default:
      return 'info';
  }
}

export function getRepairStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case '待指派':
      return 'default';
    case '修复中':
      return 'primary';
    case '待质检':
      return 'warning';
    case '质检通过':
      return 'success';
    case '质检未通过':
      return 'error';
    case '已完成':
      return 'info';
    default:
      return 'default';
  }
}

export function getProblemTypeColor(type: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (type) {
    case '裂纹':
      return 'error';
    case '噪声':
      return 'warning';
    case '磨损':
      return 'info';
    case '破损':
      return 'error';
    case '其他':
      return 'default';
    default:
      return 'default';
  }
}

export function getQualityCheckResultColor(result: string): 'success' | 'error' {
  return result === '通过' ? 'success' : 'error';
}

export function getApprovalStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case '待审批':
      return 'warning';
    case '审批通过':
      return 'success';
    case '审批拒绝':
      return 'error';
    case '已撤销':
      return 'default';
    default:
      return 'default';
  }
}

export function getReturnStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case '未归还':
      return 'info';
    case '已归还':
      return 'success';
    case '超期':
      return 'error';
    case '损坏待复核':
      return 'warning';
    default:
      return 'default';
  }
}

export function getBorrowTypeColor(type: string): 'primary' | 'secondary' {
  return type === '馆内借阅' ? 'primary' : 'secondary';
}

export function getPriorityColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
  switch (priority) {
    case '普通':
      return 'default';
    case '优先':
      return 'primary';
    case '紧急':
      return 'error';
    default:
      return 'default';
  }
}

export function getReservationStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case '待审批':
      return 'warning';
    case '已批准':
      return 'success';
    case '已拒绝':
      return 'error';
    case '已取消':
      return 'default';
    case '已完成':
      return 'info';
    case '已转借出':
      return 'primary';
    default:
      return 'default';
  }
}

export function getConflictStatusColor(status: string): 'default' | 'success' | 'error' | 'warning' {
  switch (status) {
    case '无冲突':
      return 'success';
    case '有冲突':
      return 'error';
    case '冲突已解决':
      return 'warning';
    default:
      return 'default';
  }
}

export function getReminderStatusColor(status: string): 'default' | 'info' | 'success' | 'warning' {
  switch (status) {
    case '未提醒':
      return 'default';
    case '已提醒':
      return 'success';
    case '无需提醒':
      return 'info';
    default:
      return 'default';
  }
}
