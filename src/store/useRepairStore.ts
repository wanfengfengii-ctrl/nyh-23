import { create } from 'zustand';
import type { RepairTask, RepairFilterState, RepairEditMode, OperationLog, RepairProblemType, QualityCheckResult, Cylinder, RepairTaskStatus } from '../types';
import { mockRepairTasks, mockOperationLogs, repairStaff } from '../data/mockData';
import { validateRepairTask, validateQualityCheck } from '../utils/validators';
import { generateId, getCurrentTimestamp, buildSearchFilter, calculatePageAfterDelete } from '../utils/common';

interface RepairState {
  repairTasks: RepairTask[];
  operationLogs: OperationLog[];
  selectedTaskId: string | null;
  drawerOpen: boolean;
  editMode: RepairEditMode;
  filters: RepairFilterState;
  page: number;
  pageSize: number;

  setRepairTasks: (tasks: RepairTask[]) => void;
  addRepairTask: (task: RepairTask) => void;
  updateRepairTask: (id: string, updates: Partial<RepairTask>) => void;
  deleteRepairTask: (id: string) => void;
  getRepairTaskById: (id: string) => RepairTask | undefined;
  getRepairTasksByCylinderId: (cylinderId: string) => RepairTask[];

  setSelectedTaskId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setEditMode: (mode: RepairEditMode) => void;
  openDrawer: (id: string, mode: RepairEditMode) => void;
  closeDrawer: () => void;

  setFilters: (filters: Partial<RepairFilterState>) => void;
  resetFilters: () => void;
  getFilteredTasks: () => RepairTask[];

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  assignTask: (taskId: string, assignee: string) => void;
  startRepair: (taskId: string) => void;
  completeRepair: (taskId: string, repairData: Partial<RepairTask>) => void;
  submitQualityCheck: (taskId: string, result: QualityCheckResult, note: string, inspector: string) => void;

  addOperationLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;
  getOperationLogsByTarget: (targetType: OperationLog['targetType'], targetId: string) => OperationLog[];

  createRepairTaskForCylinder: (cylinder: Cylinder, problemTypes: RepairProblemType[], description: string) => RepairTask;
}

const initialFilters: RepairFilterState = {
  search: '',
  status: '',
  assignee: '',
  problemType: '',
};

const searchFields: (keyof RepairTask)[] = ['id', 'title'];

function applyRepairFilters(tasks: RepairTask[], filters: RepairFilterState): RepairTask[] {
  const searchFilter = buildSearchFilter(searchFields, filters.search);

  return tasks.filter((t) => {
    if (!searchFilter(t)) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignee && t.assignee !== filters.assignee) return false;
    if (filters.problemType && !t.problemTypes.includes(filters.problemType as RepairProblemType)) return false;
    return true;
  });
}

export const useRepairStore = create<RepairState>((set, get) => ({
  repairTasks: mockRepairTasks,
  operationLogs: mockOperationLogs,
  selectedTaskId: null,
  drawerOpen: false,
  editMode: 'view',
  filters: initialFilters,
  page: 0,
  pageSize: 10,

  setRepairTasks: (tasks) => set({ repairTasks: tasks }),

  addRepairTask: (task) =>
    set((state) => ({
      repairTasks: [...state.repairTasks, task],
    })),

  updateRepairTask: (id, updates) =>
    set((state) => ({
      repairTasks: state.repairTasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteRepairTask: (id) =>
    set((state) => {
      const newTasks = state.repairTasks.filter((t) => t.id !== id);
      const filteredAfter = applyRepairFilters(newTasks, state.filters);
      const newPage = calculatePageAfterDelete(state.page, state.pageSize, filteredAfter.length);

      return {
        repairTasks: newTasks,
        page: newPage,
      };
    }),

  getRepairTaskById: (id) => get().repairTasks.find((t) => t.id === id),

  getRepairTasksByCylinderId: (cylinderId) =>
    get().repairTasks.filter((t) => t.cylinderId === cylinderId),

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setEditMode: (mode) => set({ editMode: mode }),

  openDrawer: (id, mode) =>
    set({
      selectedTaskId: id,
      drawerOpen: true,
      editMode: mode,
    }),

  closeDrawer: () =>
    set({
      drawerOpen: false,
      selectedTaskId: null,
      editMode: 'view',
    }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 0,
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
      page: 0,
    }),

  getFilteredTasks: () => {
    const { repairTasks, filters } = get();
    return applyRepairFilters(repairTasks, filters);
  },

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 0 }),

  assignTask: (taskId, assignee) => {
    const task = get().getRepairTaskById(taskId);
    if (!task) return;

    const now = getCurrentTimestamp();
    get().updateRepairTask(taskId, {
      assignee,
      assignedAt: now,
      status: '待指派',
    });

    get().addOperationLog({
      targetType: 'repairTask',
      targetId: taskId,
      action: '任务指派',
      description: `将修复任务指派给${assignee}`,
      operator: '管理员',
      oldValue: task.assignee || '未指派',
      newValue: assignee,
    });
  },

  startRepair: (taskId) => {
    const task = get().getRepairTaskById(taskId);
    if (!task) return;

    const now = getCurrentTimestamp();
    get().updateRepairTask(taskId, {
      status: '修复中',
      startedAt: now,
    });

    get().addOperationLog({
      targetType: 'repairTask',
      targetId: taskId,
      action: '开始修复',
      description: `${task.assignee}开始执行修复工作`,
      operator: task.assignee || '系统',
    });
  },

  completeRepair: (taskId, repairData) => {
    const task = get().getRepairTaskById(taskId);
    if (!task) return;

    const validation = validateRepairTask({ ...task, ...repairData }, true);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const now = getCurrentTimestamp();
    get().updateRepairTask(taskId, {
      ...repairData,
      status: '待质检',
      completedAt: now,
    });

    get().addOperationLog({
      targetType: 'repairTask',
      targetId: taskId,
      action: '修复完成',
      description: '修复工作完成，提交质检',
      operator: task.assignee || '系统',
    });
  },

  submitQualityCheck: (taskId, result, note, inspector) => {
    const task = get().getRepairTaskById(taskId);
    if (!task) return;

    const validation = validateQualityCheck(result, note);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const now = getCurrentTimestamp();
    const newStatus: RepairTaskStatus = result === '通过' ? '质检通过' : '质检未通过';

    const updatedTask: Partial<RepairTask> = {
      qualityCheckResult: result,
      qualityCheckNote: note,
      qualityCheckedBy: inspector,
      qualityCheckedAt: now,
      status: newStatus,
      reworkCount: result === '未通过' ? task.reworkCount + 1 : task.reworkCount,
    };

    get().updateRepairTask(taskId, updatedTask);

    get().addOperationLog({
      targetType: 'repairTask',
      targetId: taskId,
      action: result === '通过' ? '质检通过' : '质检未通过',
      description: `${inspector}完成质检，结果：${result}`,
      operator: inspector,
      oldValue: task.qualityCheckResult || '未质检',
      newValue: result,
    });
  },

  addOperationLog: (log) => {
    const newLog: OperationLog = {
      ...log,
      id: generateId('LOG'),
      timestamp: getCurrentTimestamp(),
    };
    set((state) => ({
      operationLogs: [newLog, ...state.operationLogs],
    }));
  },

  getOperationLogsByTarget: (targetType, targetId) =>
    get().operationLogs.filter(
      (log) => log.targetType === targetType && log.targetId === targetId
    ),

  createRepairTaskForCylinder: (cylinder, problemTypes, description) => {
    const newTask: RepairTask = {
      id: generateId('REP'),
      cylinderId: cylinder.id,
      title: `${cylinder.title} - 修复任务`,
      problemTypes,
      description,
      status: '待指派',
      assignee: null,
      createdAt: getCurrentTimestamp().split(' ')[0],
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      beforeRepairNote: description,
      afterRepairNote: '',
      beforeRepairImages: [],
      afterRepairImages: [],
      repairMethod: '',
      repairResult: '',
      responsiblePerson: '',
      qualityCheckResult: null,
      qualityCheckNote: '',
      qualityCheckedBy: null,
      qualityCheckedAt: null,
      reworkCount: 0,
    };

    get().addRepairTask(newTask);

    get().addOperationLog({
      targetType: 'repairTask',
      targetId: newTask.id,
      action: '创建修复任务',
      description: `为蜡筒 ${cylinder.id} 创建修复任务`,
      operator: '系统',
    });

    return newTask;
  },
}));
