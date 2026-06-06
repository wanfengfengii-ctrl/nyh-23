export type MaterialStatus = '完好' | '轻微磨损' | '严重磨损' | '破损';

export type NoiseLevel = '低' | '中' | '高' | '严重';

export type CylinderStatus = '待转录' | '转录中' | '已完成' | '已归档' | '待修复' | '修复中' | '待质检' | '质检未通过';

export type CrackSeverity = '轻微' | '中等' | '严重';

export type RepairTaskStatus = '待指派' | '修复中' | '待质检' | '质检通过' | '质检未通过' | '已完成';

export type RepairProblemType = '裂纹' | '噪声' | '磨损' | '破损' | '其他';

export type QualityCheckResult = '通过' | '未通过';

export interface Crack {
  id: string;
  cylinderId: string;
  severity: CrackSeverity;
  location: string;
  description: string;
  discoveredAt: string;
}

export interface RepairTask {
  id: string;
  cylinderId: string;
  title: string;
  problemTypes: RepairProblemType[];
  description: string;
  status: RepairTaskStatus;
  assignee: string | null;
  createdAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  beforeRepairNote: string;
  afterRepairNote: string;
  beforeRepairImages: string[];
  afterRepairImages: string[];
  repairMethod: string;
  repairResult: string;
  responsiblePerson: string;
  qualityCheckResult: QualityCheckResult | null;
  qualityCheckNote: string;
  qualityCheckedBy: string | null;
  qualityCheckedAt: string | null;
  reworkCount: number;
}

export interface OperationLog {
  id: string;
  targetType: 'cylinder' | 'repairTask' | 'crack';
  targetId: string;
  action: string;
  description: string;
  operator: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
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
  repairTaskIds: string[];
  lastQualityCheckResult: QualityCheckResult | null;
  lastQualityCheckedAt: string | null;
}

export interface FilterState {
  search: string;
  status: CylinderStatus | '';
  noiseLevel: NoiseLevel | '';
  materialStatus: MaterialStatus | '';
  hasSevereCrack: boolean | null;
}

export interface RepairFilterState {
  search: string;
  status: RepairTaskStatus | '';
  assignee: string | '';
  problemType: RepairProblemType | '';
}

export type EditMode = 'view' | 'edit' | 'create';

export type RepairEditMode = 'view' | 'edit' | 'create' | 'qualityCheck';
