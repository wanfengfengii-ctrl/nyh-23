import type { Cylinder, NoiseLevel } from '../types';

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
