import type { Cylinder, NoiseLevel, RepairTask, QualityCheckResult, BorrowRecord } from '../types';

export function isIdUnique(
  cylinders: Cylinder[],
  id: string,
  excludeId?: string
): boolean {
  return !cylinders.some(
    (c) => c.id === id && c.id !== excludeId
  );
}

export function isValidProgress(progress: number): boolean {
  return Number.isInteger(progress) && progress >= 0 && progress <= 100;
}

export function canArchive(cylinder: Cylinder): boolean {
  return cylinder.transcriptionProgress === 100;
}

export function isHighNoise(level: NoiseLevel): boolean {
  return level === '高' || level === '严重';
}

export function needsRepairSuggestion(
  noiseLevel: NoiseLevel,
  repairSuggestion: string
): boolean {
  if (isHighNoise(noiseLevel)) {
    return repairSuggestion.trim().length > 0;
  }
  return true;
}

export function hasSevereCrack(cylinder: Cylinder): boolean {
  return cylinder.cracks.some((c) => c.severity === '严重');
}

export function needsRepairTask(cylinder: Cylinder): boolean {
  return isHighNoise(cylinder.noiseLevel) || hasSevereCrack(cylinder);
}

export function canArchiveWithQualityCheck(cylinder: Cylinder): boolean {
  if (cylinder.transcriptionProgress !== 100) {
    return false;
  }
  if (cylinder.repairTaskIds && cylinder.repairTaskIds.length > 0) {
    return cylinder.lastQualityCheckResult === '通过';
  }
  return true;
}

export function canCompleteRepair(task: RepairTask): boolean {
  return (
    task.afterRepairNote.trim().length > 0 &&
    task.repairMethod.trim().length > 0 &&
    task.repairResult.trim().length > 0 &&
    task.responsiblePerson.trim().length > 0
  );
}

export function canStartQualityCheck(task: RepairTask): boolean {
  return task.status === '待质检' && task.completedAt !== null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateCylinder(
  cylinder: Partial<Cylinder>,
  allCylinders: Cylinder[],
  isEdit: boolean = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!cylinder.id || cylinder.id.trim() === '') {
    errors.id = '蜡筒编号不能为空';
  } else if (!isIdUnique(allCylinders, cylinder.id, isEdit ? cylinder.id : undefined)) {
    errors.id = '蜡筒编号已存在';
  }

  if (!cylinder.title || cylinder.title.trim() === '') {
    errors.title = '录音标题不能为空';
  }

  if (cylinder.year === undefined || cylinder.year === null) {
    errors.year = '年代不能为空';
  } else if (cylinder.year < 1800 || cylinder.year > 2025) {
    errors.year = '年代范围不合理';
  }

  if (
    cylinder.transcriptionProgress === undefined ||
    cylinder.transcriptionProgress === null
  ) {
    errors.transcriptionProgress = '转录进度不能为空';
  } else if (!isValidProgress(cylinder.transcriptionProgress)) {
    errors.transcriptionProgress = '转录进度必须是 0-100 的整数';
  }

  if (cylinder.currentStatus === '已归档' && cylinder.transcriptionProgress !== 100) {
    errors.currentStatus = '未完成转录不能标记为已归档';
  }

  if (
    cylinder.noiseLevel &&
    isHighNoise(cylinder.noiseLevel) &&
    (!cylinder.repairSuggestion || cylinder.repairSuggestion.trim() === '')
  ) {
    errors.repairSuggestion = '高噪声记录必须填写修复建议';
  }

  if (!cylinder.materialStatus) {
    errors.materialStatus = '请选择材质状态';
  }

  if (!cylinder.noiseLevel) {
    errors.noiseLevel = '请选择噪声等级';
  }

  if (!cylinder.currentStatus) {
    errors.currentStatus = '请选择当前状态';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateRepairTask(
  task: Partial<RepairTask>,
  isEdit: boolean = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!task.title || task.title.trim() === '') {
    errors.title = '修复任务标题不能为空';
  }

  if (!task.cylinderId) {
    errors.cylinderId = '请选择关联的蜡筒';
  }

  if (!task.problemTypes || task.problemTypes.length === 0) {
    errors.problemTypes = '请至少选择一种问题类型';
  }

  if (!task.description || task.description.trim() === '') {
    errors.description = '请填写修复任务描述';
  }

  if (isEdit) {
    if (task.status === '修复中' && !task.assignee) {
      errors.assignee = '修复中状态必须指派负责人';
    }

    if ((task.status === '待质检' || task.status === '质检通过' || task.status === '已完成') && task.afterRepairNote?.trim() === '') {
      errors.afterRepairNote = '修复完成后必须填写修复后记录';
    }

    if ((task.status === '待质检' || task.status === '质检通过' || task.status === '已完成') && task.repairMethod?.trim() === '') {
      errors.repairMethod = '修复完成后必须填写修复方法';
    }

    if ((task.status === '待质检' || task.status === '质检通过' || task.status === '已完成') && task.repairResult?.trim() === '') {
      errors.repairResult = '修复完成后必须填写处理结果';
    }

    if ((task.status === '待质检' || task.status === '质检通过' || task.status === '已完成') && task.responsiblePerson?.trim() === '') {
      errors.responsiblePerson = '修复完成后必须填写责任人';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateQualityCheck(
  result: QualityCheckResult | null,
  note: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!result) {
    errors.result = '请选择质检结果';
  }

  if (!note || note.trim() === '') {
    errors.note = '请填写质检说明';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function canBorrow(cylinder: Cylinder): boolean {
  if (cylinder.currentStatus !== '已归档') {
    return false;
  }
  if (cylinder.cracks.some((c) => c.severity === '严重')) {
    return false;
  }
  if (cylinder.noiseLevel === '高' || cylinder.noiseLevel === '严重') {
    return false;
  }
  if (cylinder.materialStatus === '破损' || cylinder.materialStatus === '严重磨损') {
    return false;
  }
  return true;
}

export function getBorrowRestrictionReason(cylinder: Cylinder): string[] {
  const reasons: string[] = [];
  if (cylinder.currentStatus !== '已归档') {
    reasons.push('蜡筒未归档，不允许外借');
  }
  if (cylinder.cracks.some((c) => c.severity === '严重')) {
    reasons.push('存在严重裂纹，禁止外借');
  }
  if (cylinder.noiseLevel === '高' || cylinder.noiseLevel === '严重') {
    reasons.push('高噪声待修复，禁止外借');
  }
  if (cylinder.materialStatus === '破损') {
    reasons.push('材质破损，禁止外借');
  }
  if (cylinder.materialStatus === '严重磨损') {
    reasons.push('材质严重磨损，不建议外借');
  }
  return reasons;
}

export function isCylinderCurrentlyBorrowed(
  cylinderId: string,
  borrowRecords: BorrowRecord[]
): boolean {
  return borrowRecords.some(
    (r) =>
      r.cylinderId === cylinderId &&
      r.approvalStatus === '审批通过' &&
      (r.returnStatus === '未归还' || r.returnStatus === '超期' || r.returnStatus === '损坏待复核')
  );
}

export function validateBorrowRecord(
  record: Partial<BorrowRecord>,
  cylinder: Cylinder | undefined,
  allRecords: BorrowRecord[],
  isEdit: boolean = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!record.cylinderId) {
    errors.cylinderId = '请选择借阅的蜡筒';
  } else if (cylinder) {
    if (!canBorrow(cylinder)) {
      const reasons = getBorrowRestrictionReason(cylinder);
      errors.cylinderId = reasons.join('；');
    }
    if (!isEdit && isCylinderCurrentlyBorrowed(cylinder.id, allRecords)) {
      errors.cylinderId = '该蜡筒当前有未归还的借阅记录，不能重复借出';
    }
  }

  if (!record.borrowType) {
    errors.borrowType = '请选择借阅类型';
  }

  if (!record.quantity || record.quantity <= 0) {
    errors.quantity = '借出数量必须大于0';
  }

  if (!record.borrowDate) {
    errors.borrowDate = '请选择借出日期';
  }

  if (!record.dueDate) {
    errors.dueDate = '请选择应还日期';
  } else if (record.borrowDate && record.dueDate < record.borrowDate) {
    errors.dueDate = '应还日期不能早于借出日期';
  }

  if (!record.borrowPurpose || record.borrowPurpose.trim() === '') {
    errors.borrowPurpose = '请填写借阅用途';
  }

  if (!record.applicant || record.applicant.trim() === '') {
    errors.applicant = '请填写申请人';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateBorrowReturn(
  conditionAfter: string,
  hasDamage: boolean,
  damageNote: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!conditionAfter || conditionAfter.trim() === '') {
    errors.conditionAfter = '请填写归还时状态';
  }

  if (hasDamage && (!damageNote || damageNote.trim() === '')) {
    errors.damageNote = '状态变差时必须登记损坏复核说明';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateBorrowApproval(
  status: string,
  approver: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!status) {
    errors.status = '请选择审批结果';
  }

  if (!approver || approver.trim() === '') {
    errors.approver = '请填写审批人';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
