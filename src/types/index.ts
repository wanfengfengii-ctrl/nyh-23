export type MaterialStatus = '完好' | '轻微磨损' | '严重磨损' | '破损';

export type NoiseLevel = '低' | '中' | '高' | '严重';

export type CylinderStatus = '待转录' | '转录中' | '已完成' | '已归档' | '待修复';

export type CrackSeverity = '轻微' | '中等' | '严重';

export interface Crack {
  id: string;
  cylinderId: string;
  severity: CrackSeverity;
  location: string;
  description: string;
  discoveredAt: string;
}

export interface Cylinder {
  id: string;
  title: string;
  year: number;
  materialStatus: MaterialStatus;
  storageLocation: string;
  transcriptionProgress: number;
  noiseLevel: NoiseLevel;
  currentStatus: CylinderStatus;
  repairSuggestion: string;
  createdAt: string;
  cracks: Crack[];
}

export interface FilterState {
  search: string;
  status: CylinderStatus | '';
  noiseLevel: NoiseLevel | '';
  materialStatus: MaterialStatus | '';
  hasSevereCrack: boolean | null;
}

export type EditMode = 'view' | 'edit' | 'create';
