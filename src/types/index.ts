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

export type BorrowType = '馆内借阅' | '外部借展';

export type BorrowApprovalStatus = '待审批' | '审批通过' | '审批拒绝' | '已撤销';

export type BorrowReturnStatus = '未归还' | '已归还' | '超期' | '损坏待复核';

export interface BorrowRecord {
  id: string;
  applicationNo: string;
  cylinderId: string;
  cylinderTitle: string;
  borrowType: BorrowType;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  actualReturnDate: string | null;
  approvalStatus: BorrowApprovalStatus;
  borrowPurpose: string;
  handoverRemark: string;
  returnStatus: BorrowReturnStatus;
  applicant: string;
  approver: string | null;
  approvedAt: string | null;
  createdAt: string;
  damageCheckNote: string;
  damageCheckedBy: string | null;
  damageCheckedAt: string | null;
  conditionBefore: string;
  conditionAfter: string;
}

export interface BorrowFilterState {
  search: string;
  borrowType: BorrowType | '';
  approvalStatus: BorrowApprovalStatus | '';
  returnStatus: BorrowReturnStatus | '';
  dateRange: [string, string] | null;
}

export type BorrowEditMode = 'view' | 'create' | 'approve' | 'return' | 'damageCheck';

export interface BorrowStatistics {
  totalBorrows: number;
  currentlyBorrowed: number;
  overdue: number;
  returned: number;
  internalBorrows: number;
  externalExhibitions: number;
  pendingApproval: number;
  damagePending: number;
}

export type ReservationPriority = '普通' | '优先' | '紧急';

export type ReservationStatus = '待审批' | '已批准' | '已拒绝' | '已取消' | '已完成' | '已转借出';

export type ConflictStatus = '无冲突' | '有冲突' | '冲突已解决';

export type ReminderStatus = '未提醒' | '已提醒' | '无需提醒';

export interface ReservationRecord {
  id: string;
  reservationNo: string;
  cylinderId: string;
  cylinderTitle: string;
  borrowType: BorrowType;
  priority: ReservationPriority;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  conflictStatus: ConflictStatus;
  conflictReservationIds: string[];
  reminderStatus: ReminderStatus;
  adjustReason: string;
  borrowPurpose: string;
  applicant: string;
  approver: string | null;
  approvedAt: string | null;
  createdAt: string;
  relatedBorrowId: string | null;
  remark: string;
}

export interface ReservationFilterState {
  search: string;
  priority: ReservationPriority | '';
  status: ReservationStatus | '';
  conflictStatus: ConflictStatus | '';
  dateRange: [string, string] | null;
  cylinderId: string;
}

export type ReservationEditMode = 'view' | 'create' | 'edit' | 'approve' | 'adjust' | 'convert';

export interface ReservationStatistics {
  totalReservations: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
  conflictCount: number;
  urgentCount: number;
  thisMonthCount: number;
  convertedToBorrow: number;
}

export interface BatchAdjustResult {
  success: string[];
  failed: { id: string; reason: string }[];
}
