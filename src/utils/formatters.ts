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
