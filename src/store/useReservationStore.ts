import { create } from 'zustand';
import type {
  ReservationRecord,
  ReservationFilterState,
  ReservationEditMode,
  ReservationStatus,
  ReservationPriority,
  ReservationStatistics,
  Cylinder,
  BorrowRecord,
  BatchAdjustResult,
} from '../types';
import { mockReservations, borrowApprovers, borrowers } from '../data/mockData';
import { canBorrow, getBorrowRestrictionReason } from '../utils/validators';
import { generateId, generateNo, getCurrentTimestamp, getTodayDateString, datesOverlap, addDays, buildSearchFilter, buildDateRangeOverlapFilter, calculatePageAfterDelete, countByFieldValue, countByCondition, getMonthStart, getNextMonthStart } from '../utils/common';

interface ReservationState {
  reservations: ReservationRecord[];
  selectedReservationId: string | null;
  drawerOpen: boolean;
  editMode: ReservationEditMode;
  filters: ReservationFilterState;
  page: number;
  pageSize: number;
  approvers: string[];
  applicantList: string[];
  selectedIds: string[];

  setReservations: (records: ReservationRecord[]) => void;
  addReservation: (record: ReservationRecord) => void;
  updateReservation: (id: string, updates: Partial<ReservationRecord>) => void;
  deleteReservation: (id: string) => void;
  getReservationById: (id: string) => ReservationRecord | undefined;
  getReservationsByCylinderId: (cylinderId: string) => ReservationRecord[];

  setSelectedReservationId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setEditMode: (mode: ReservationEditMode) => void;
  openDrawer: (id: string, mode: ReservationEditMode) => void;
  closeDrawer: () => void;

  setFilters: (filters: Partial<ReservationFilterState>) => void;
  resetFilters: () => void;
  getFilteredReservations: () => ReservationRecord[];

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;

  createReservation: (cylinder: Cylinder, data: Partial<ReservationRecord>) => ReservationRecord | null;
  approveReservation: (id: string, status: ReservationStatus, approver: string, remark?: string) => boolean;
  adjustReservation: (id: string, updates: Partial<ReservationRecord>, reason: string) => boolean;
  cancelReservation: (id: string, reason: string) => void;
  convertToBorrow: (id: string, borrowRecordId: string) => boolean;

  checkConflicts: (cylinderId: string, startDate: string, endDate: string, excludeId?: string) => ReservationRecord[];
  updateConflictStatus: (cylinderId: string) => void;
  updateAllConflictStatuses: () => void;

  batchAdjust: (ids: string[], updates: Partial<ReservationRecord>, reason: string) => BatchAdjustResult;
  batchCancel: (ids: string[], reason: string) => BatchAdjustResult;

  checkAndUpdateReminders: (daysBefore: number) => ReservationRecord[];
  markReminderSent: (id: string) => void;

  getStatistics: () => ReservationStatistics;
  getUpcomingReservations: (days: number) => ReservationRecord[];

  isDateRangeAvailable: (cylinderId: string, startDate: string, endDate: string, excludeId?: string) => boolean;
}

const initialFilters: ReservationFilterState = {
  search: '',
  priority: '',
  status: '',
  conflictStatus: '',
  dateRange: null,
  cylinderId: '',
};

const searchFields: (keyof ReservationRecord)[] = ['reservationNo', 'cylinderTitle', 'cylinderId', 'applicant'];

function applyReservationFilters(records: ReservationRecord[], filters: ReservationFilterState): ReservationRecord[] {
  const searchFilter = buildSearchFilter(searchFields, filters.search);
  const dateFilter = buildDateRangeOverlapFilter<ReservationRecord>('startDate', 'endDate', filters.dateRange);

  return records.filter((r) => {
    if (!searchFilter(r)) return false;
    if (!dateFilter(r)) return false;
    if (filters.priority && r.priority !== filters.priority) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.conflictStatus && r.conflictStatus !== filters.conflictStatus) return false;
    if (filters.cylinderId && r.cylinderId !== filters.cylinderId) return false;
    return true;
  });
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: mockReservations,
  selectedReservationId: null,
  drawerOpen: false,
  editMode: 'view',
  filters: initialFilters,
  page: 0,
  pageSize: 10,
  approvers: borrowApprovers,
  applicantList: [...borrowers, '社教部李老师'],
  selectedIds: [],

  setReservations: (records) => set({ reservations: records }),

  addReservation: (record) =>
    set((state) => ({
      reservations: [...state.reservations, record],
    })),

  updateReservation: (id, updates) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteReservation: (id) =>
    set((state) => {
      const newRecords = state.reservations.filter((r) => r.id !== id);
      const filteredAfter = applyReservationFilters(newRecords, state.filters);
      const newPage = calculatePageAfterDelete(state.page, state.pageSize, filteredAfter.length);

      return {
        reservations: newRecords,
        page: newPage,
      };
    }),

  getReservationById: (id) => get().reservations.find((r) => r.id === id),

  getReservationsByCylinderId: (cylinderId) =>
    get().reservations.filter((r) => r.cylinderId === cylinderId),

  setSelectedReservationId: (id) => set({ selectedReservationId: id }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setEditMode: (mode) => set({ editMode: mode }),

  openDrawer: (id, mode) =>
    set({
      selectedReservationId: id,
      drawerOpen: true,
      editMode: mode,
    }),

  closeDrawer: () =>
    set({
      drawerOpen: false,
      selectedReservationId: null,
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

  getFilteredReservations: () => {
    const { reservations, filters } = get();
    return applyReservationFilters(reservations, filters);
  },

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 0 }),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),

  createReservation: (cylinder, data) => {
    const { reservations } = get();

    if (!canBorrow(cylinder)) {
      const reasons = getBorrowRestrictionReason(cylinder);
      alert(reasons.join('；'));
      return null;
    }

    if (!data.startDate || !data.endDate) {
      alert('请填写预约开始和结束日期');
      return null;
    }

    if (data.startDate > data.endDate) {
      alert('预约结束日期不能早于开始日期');
      return null;
    }

    if (!data.applicant || !data.applicant.trim()) {
      alert('请填写申请人');
      return null;
    }

    if (!data.borrowPurpose || !data.borrowPurpose.trim()) {
      alert('请填写借阅用途');
      return null;
    }

    const conflicts = get().checkConflicts(cylinder.id, data.startDate, data.endDate);

    const newRecord: ReservationRecord = {
      id: generateId('RES'),
      reservationNo: generateNo('YY'),
      cylinderId: cylinder.id,
      cylinderTitle: cylinder.title,
      borrowType: data.borrowType || '馆内借阅',
      priority: data.priority || '普通',
      startDate: data.startDate,
      endDate: data.endDate,
      status: '待审批',
      conflictStatus: conflicts.length > 0 ? '有冲突' : '无冲突',
      conflictReservationIds: conflicts.map((c) => c.id),
      reminderStatus: '未提醒',
      adjustReason: '',
      borrowPurpose: data.borrowPurpose || '',
      applicant: data.applicant || '',
      approver: null,
      approvedAt: null,
      createdAt: getCurrentTimestamp(),
      relatedBorrowId: null,
      remark: data.remark || '',
    };

    get().addReservation(newRecord);

    if (conflicts.length > 0) {
      conflicts.forEach((conflict) => {
        get().updateReservation(conflict.id, {
          conflictStatus: '有冲突',
          conflictReservationIds: [...conflict.conflictReservationIds, newRecord.id],
        });
      });
    }

    return newRecord;
  },

  approveReservation: (id, status, approver, remark) => {
    const record = get().getReservationById(id);
    if (!record) return false;

    if (record.status !== '待审批') {
      alert('只有待审批状态的预约才能审批');
      return false;
    }

    if (status !== '已批准' && status !== '已拒绝') {
      alert('审批状态无效');
      return false;
    }

    const now = getCurrentTimestamp();
    const updates: Partial<ReservationRecord> = {
      status,
      approver,
      approvedAt: now,
    };

    if (remark) {
      updates.remark = remark;
    }

    if (status === '已拒绝') {
      updates.reminderStatus = '无需提醒';
      get().updateAllConflictStatuses();
    }

    get().updateReservation(id, updates);
    return true;
  },

  adjustReservation: (id, updates, reason) => {
    const record = get().getReservationById(id);
    if (!record) return false;

    if (record.status !== '已批准' && record.status !== '待审批') {
      alert('只有待审批或已批准的预约才能调整');
      return false;
    }

    if (updates.startDate && updates.endDate && updates.startDate > updates.endDate) {
      alert('预约结束日期不能早于开始日期');
      return false;
    }

    const startDate = updates.startDate || record.startDate;
    const endDate = updates.endDate || record.endDate;

    const conflicts = get().checkConflicts(record.cylinderId, startDate, endDate, id);

    const fullUpdates: Partial<ReservationRecord> = {
      ...updates,
      conflictStatus: conflicts.length > 0 ? '有冲突' : '无冲突',
      conflictReservationIds: conflicts.map((c) => c.id),
      adjustReason: reason,
    };

    get().updateReservation(id, fullUpdates);

    get().updateAllConflictStatuses();

    return true;
  },

  cancelReservation: (id, reason) => {
    get().updateReservation(id, {
      status: '已取消',
      adjustReason: reason,
      reminderStatus: '无需提醒',
    });
    get().updateAllConflictStatuses();
  },

  convertToBorrow: (id, borrowRecordId) => {
    const record = get().getReservationById(id);
    if (!record) return false;

    if (record.status !== '已批准') {
      alert('只有已批准的预约才能转为正式借出');
      return false;
    }

    get().updateReservation(id, {
      status: '已转借出',
      relatedBorrowId: borrowRecordId,
      reminderStatus: '无需提醒',
    });

    get().updateAllConflictStatuses();

    return true;
  },

  checkConflicts: (cylinderId, startDate, endDate, excludeId) => {
    const { reservations } = get();
    return reservations.filter((r) => {
      if (excludeId && r.id === excludeId) return false;
      if (r.cylinderId !== cylinderId) return false;
      if (r.status !== '已批准' && r.status !== '待审批') return false;
      return datesOverlap(startDate, endDate, r.startDate, r.endDate);
    });
  },

  updateConflictStatus: (cylinderId) => {
    const { reservations } = get();
    const cylinderReservations = reservations.filter((r) => r.cylinderId === cylinderId);

    cylinderReservations.forEach((reservation) => {
      if (reservation.status === '已完成' || reservation.status === '已取消' || reservation.status === '已转借出') {
        return;
      }

      const conflicts = cylinderReservations.filter((r) => {
        if (r.id === reservation.id) return false;
        if (r.status === '已完成' || r.status === '已取消' || r.status === '已转借出') return false;
        return datesOverlap(reservation.startDate, reservation.endDate, r.startDate, r.endDate);
      });

      get().updateReservation(reservation.id, {
        conflictStatus: conflicts.length > 0 ? '有冲突' : '无冲突',
        conflictReservationIds: conflicts.map((c) => c.id),
      });
    });
  },

  updateAllConflictStatuses: () => {
    const { reservations } = get();
    const cylinderIds = [...new Set(reservations.map((r) => r.cylinderId))];
    cylinderIds.forEach((id) => get().updateConflictStatus(id));
  },

  batchAdjust: (ids, updates, reason) => {
    const result: BatchAdjustResult = {
      success: [],
      failed: [],
    };

    ids.forEach((id) => {
      const record = get().getReservationById(id);
      if (!record) {
        result.failed.push({ id, reason: '预约记录不存在' });
        return;
      }

      const success = get().adjustReservation(id, updates, reason);
      if (success) {
        result.success.push(id);
      } else {
        result.failed.push({ id, reason: '调整失败' });
      }
    });

    return result;
  },

  batchCancel: (ids, reason) => {
    const result: BatchAdjustResult = {
      success: [],
      failed: [],
    };

    ids.forEach((id) => {
      const record = get().getReservationById(id);
      if (!record) {
        result.failed.push({ id, reason: '预约记录不存在' });
        return;
      }

      get().cancelReservation(id, reason);
      result.success.push(id);
    });

    return result;
  },

  checkAndUpdateReminders: (daysBefore) => {
    const { reservations } = get();
    const today = getTodayDateString();
    const reminderDate = addDays(today, daysBefore);

    const toRemind: ReservationRecord[] = [];

    reservations.forEach((r) => {
      if (r.status !== '已批准') return;
      if (r.reminderStatus !== '未提醒') return;
      if (r.startDate <= today) return;
      if (r.startDate <= reminderDate) {
        toRemind.push(r);
      }
    });

    toRemind.forEach((r) => {
      get().markReminderSent(r.id);
    });

    return toRemind;
  },

  markReminderSent: (id) => {
    get().updateReservation(id, {
      reminderStatus: '已提醒',
    });
  },

  getStatistics: () => {
    const { reservations } = get();
    const thisMonthStart = getMonthStart();
    const nextMonthStart = getNextMonthStart();

    const totalReservations = reservations.length;
    const pendingApproval = countByFieldValue(reservations, 'status', '待审批');
    const approved = countByFieldValue(reservations, 'status', '已批准');
    const rejected = countByFieldValue(reservations, 'status', '已拒绝');
    const completed = countByFieldValue(reservations, 'status', '已完成');
    const cancelled = countByFieldValue(reservations, 'status', '已取消');
    const conflictCount = countByFieldValue(reservations, 'conflictStatus', '有冲突');
    const urgentCount = countByFieldValue(reservations, 'priority', '紧急');
    const thisMonthCount = countByCondition(reservations, (r) =>
      r.createdAt >= thisMonthStart && r.createdAt < nextMonthStart
    );
    const convertedToBorrow = countByFieldValue(reservations, 'status', '已转借出');

    return {
      totalReservations,
      pendingApproval,
      approved,
      rejected,
      completed,
      cancelled,
      conflictCount,
      urgentCount,
      thisMonthCount,
      convertedToBorrow,
    };
  },

  getUpcomingReservations: (days) => {
    const { reservations } = get();
    const today = getTodayDateString();
    const endDate = addDays(today, days);

    return reservations
      .filter((r) => {
        if (r.status !== '已批准' && r.status !== '待审批') return false;
        return r.startDate >= today && r.startDate <= endDate;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  isDateRangeAvailable: (cylinderId, startDate, endDate, excludeId) => {
    const conflicts = get().checkConflicts(cylinderId, startDate, endDate, excludeId);
    return conflicts.length === 0;
  },
}));
