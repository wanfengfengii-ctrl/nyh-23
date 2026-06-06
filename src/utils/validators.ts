import type { Cylinder, NoiseLevel, RepairTask, QualityCheckResult } from '../types';

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
