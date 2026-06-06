import { create } from 'zustand';
import type {
  BorrowRecord,
  BorrowFilterState,
  BorrowEditMode,
  BorrowApprovalStatus,
  BorrowReturnStatus,
  BorrowStatistics,
  Cylinder,
} from '../types';
import { mockBorrowRecords, borrowApprovers, borrowers } from '../data/mockData';
import {
  validateBorrowRecord,
  validateBorrowReturn,
  validateBorrowApproval,
} from '../utils/validators';
import { generateId, generateNo, getCurrentTimestamp, getTodayDateString, buildSearchFilter, buildDateRangeFilter, calculatePageAfterDelete, countByFieldValue, countByCondition } from '../utils/common';

interface BorrowState {
  borrowRecords: BorrowRecord[];
  selectedRecordId: string | null;
  drawerOpen: boolean;
  editMode: BorrowEditMode;
  filters: BorrowFilterState;
  page: number;
  pageSize: number;
  approvers: string[];
  borrowerList: string[];

  setBorrowRecords: (records: BorrowRecord[]) => void;
  addBorrowRecord: (record: BorrowRecord) => void;
  updateBorrowRecord: (id: string, updates: Partial<BorrowRecord>) => void;
  deleteBorrowRecord: (id: string) => void;
  getBorrowRecordById: (id: string) => BorrowRecord | undefined;
  getBorrowRecordsByCylinderId: (cylinderId: string) => BorrowRecord[];

  setSelectedRecordId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setEditMode: (mode: BorrowEditMode) => void;
  openDrawer: (id: string, mode: BorrowEditMode) => void;
  closeDrawer: () => void;

  setFilters: (filters: Partial<BorrowFilterState>) => void;
  resetFilters: () => void;
  getFilteredRecords: () => BorrowRecord[];

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  createBorrowRequest: (cylinder: Cylinder, data: Partial<BorrowRecord>) => BorrowRecord | null;
  approveBorrow: (id: string, status: BorrowApprovalStatus, approver: string, remark?: string) => void;
  returnBorrow: (id: string, conditionAfter: string, hasDamage: boolean, damageNote: string) => void;
  completeDamageCheck: (id: string, note: string, checker: string) => void;

  getStatistics: () => BorrowStatistics;
  getBorrowHistory: (cylinderId: string) => BorrowRecord[];
  getActualReturnStatus: (record: BorrowRecord) => BorrowReturnStatus;
}

const initialFilters: BorrowFilterState = {
  search: '',
  borrowType: '',
  approvalStatus: '',
  returnStatus: '',
  dateRange: null,
};

const searchFields: (keyof BorrowRecord)[] = ['applicationNo', 'cylinderTitle', 'cylinderId', 'applicant'];

function getActualReturnStatus(record: BorrowRecord): BorrowReturnStatus {
  if (record.returnStatus === '已归还' || record.returnStatus === '损坏待复核') {
    return record.returnStatus;
  }
  if (record.approvalStatus !== '审批通过') {
    return record.returnStatus;
  }
  if (!record.dueDate || record.actualReturnDate) {
    return record.returnStatus;
  }
  const today = getTodayDateString();
  if (record.dueDate < today) {
    return '超期';
  }
  return record.returnStatus;
}

function applyBorrowFilters(records: BorrowRecord[], filters: BorrowFilterState, getStatus: (r: BorrowRecord) => BorrowReturnStatus): BorrowRecord[] {
  const searchFilter = buildSearchFilter(searchFields, filters.search);
  const dateFilter = buildDateRangeFilter<BorrowRecord>('borrowDate', filters.dateRange);

  return records.filter((r) => {
    if (!searchFilter(r)) return false;
    if (!dateFilter(r)) return false;
    if (filters.borrowType && r.borrowType !== filters.borrowType) return false;
    if (filters.approvalStatus && r.approvalStatus !== filters.approvalStatus) return false;
    if (filters.returnStatus && getStatus(r) !== filters.returnStatus) return false;
    return true;
  });
}

export const useBorrowStore = create<BorrowState>((set, get) => ({
  borrowRecords: mockBorrowRecords,
  selectedRecordId: null,
  drawerOpen: false,
  editMode: 'view',
  filters: initialFilters,
  page: 0,
  pageSize: 10,
  approvers: borrowApprovers,
  borrowerList: borrowers,

  setBorrowRecords: (records) => set({ borrowRecords: records }),

  addBorrowRecord: (record) =>
    set((state) => ({
      borrowRecords: [...state.borrowRecords, record],
    })),

  updateBorrowRecord: (id, updates) =>
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteBorrowRecord: (id) =>
    set((state) => {
      const newRecords = state.borrowRecords.filter((r) => r.id !== id);
      const filteredAfter = applyBorrowFilters(newRecords, state.filters, getActualReturnStatus);
      const newPage = calculatePageAfterDelete(state.page, state.pageSize, filteredAfter.length);

      return {
        borrowRecords: newRecords,
        page: newPage,
      };
    }),

  getBorrowRecordById: (id) => get().borrowRecords.find((r) => r.id === id),

  getBorrowRecordsByCylinderId: (cylinderId) =>
    get().borrowRecords.filter((r) => r.cylinderId === cylinderId),

  setSelectedRecordId: (id) => set({ selectedRecordId: id }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setEditMode: (mode) => set({ editMode: mode }),

  openDrawer: (id, mode) =>
    set({
      selectedRecordId: id,
      drawerOpen: true,
      editMode: mode,
    }),

  closeDrawer: () =>
    set({
      drawerOpen: false,
      selectedRecordId: null,
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

  getFilteredRecords: () => {
    const { borrowRecords, filters } = get();
    return applyBorrowFilters(borrowRecords, filters, getActualReturnStatus);
  },

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 0 }),

  createBorrowRequest: (cylinder, data) => {
    const { borrowRecords } = get();

    const tempRecord: Partial<BorrowRecord> = {
      cylinderId: cylinder.id,
      cylinderTitle: cylinder.title,
      ...data,
    };

    const validation = validateBorrowRecord(tempRecord, cylinder, borrowRecords, false);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return null;
    }

    const newRecord: BorrowRecord = {
      id: generateId('BOR'),
      applicationNo: generateNo('JY'),
      cylinderId: cylinder.id,
      cylinderTitle: cylinder.title,
      borrowType: data.borrowType || '馆内借阅',
      quantity: data.quantity || 1,
      borrowDate: data.borrowDate || '',
      dueDate: data.dueDate || '',
      actualReturnDate: null,
      approvalStatus: '待审批',
      borrowPurpose: data.borrowPurpose || '',
      handoverRemark: data.handoverRemark || '',
      returnStatus: '未归还',
      applicant: data.applicant || '',
      approver: null,
      approvedAt: null,
      createdAt: getCurrentTimestamp(),
      damageCheckNote: '',
      damageCheckedBy: null,
      damageCheckedAt: null,
      conditionBefore: `${cylinder.materialStatus}，${cylinder.noiseLevel}噪声`,
      conditionAfter: '',
    };

    get().addBorrowRecord(newRecord);
    return newRecord;
  },

  approveBorrow: (id, status, approver, remark) => {
    const record = get().getBorrowRecordById(id);
    if (!record) return;

    const validation = validateBorrowApproval(status, approver);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const now = getCurrentTimestamp();
    const updates: Partial<BorrowRecord> = {
      approvalStatus: status,
      approver,
      approvedAt: now,
    };

    if (remark) {
      updates.handoverRemark = remark;
    }

    get().updateBorrowRecord(id, updates);
  },

  returnBorrow: (id, conditionAfter, hasDamage, damageNote) => {
    const record = get().getBorrowRecordById(id);
    if (!record) return;

    const validation = validateBorrowReturn(conditionAfter, hasDamage, damageNote);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const now = getCurrentTimestamp();
    const returnStatus: BorrowReturnStatus = hasDamage ? '损坏待复核' : '已归还';

    const updates: Partial<BorrowRecord> = {
      actualReturnDate: now.split(' ')[0],
      returnStatus,
      conditionAfter,
    };

    if (hasDamage) {
      updates.damageCheckNote = damageNote;
    }

    get().updateBorrowRecord(id, updates);
  },

  completeDamageCheck: (id, note, checker) => {
    const record = get().getBorrowRecordById(id);
    if (!record) return;

    const now = getCurrentTimestamp();
    get().updateBorrowRecord(id, {
      damageCheckNote: note,
      damageCheckedBy: checker,
      damageCheckedAt: now,
      returnStatus: '已归还',
    });
  },

  getStatistics: () => {
    const { borrowRecords, getActualReturnStatus: getStatus } = get();

    const totalBorrows = borrowRecords.length;
    const currentlyBorrowed = countByCondition(borrowRecords, (r) => {
      const actualStatus = getStatus(r);
      return r.approvalStatus === '审批通过' &&
        (actualStatus === '未归还' || actualStatus === '超期' || actualStatus === '损坏待复核');
    });
    const overdue = countByCondition(borrowRecords, (r) => getStatus(r) === '超期');
    const returned = countByCondition(borrowRecords, (r) => getStatus(r) === '已归还');
    const internalBorrows = countByFieldValue(borrowRecords, 'borrowType', '馆内借阅');
    const externalExhibitions = countByFieldValue(borrowRecords, 'borrowType', '外部借展');
    const pendingApproval = countByFieldValue(borrowRecords, 'approvalStatus', '待审批');
    const damagePending = countByCondition(borrowRecords, (r) => getStatus(r) === '损坏待复核');

    return {
      totalBorrows,
      currentlyBorrowed,
      overdue,
      returned,
      internalBorrows,
      externalExhibitions,
      pendingApproval,
      damagePending,
    };
  },

  getBorrowHistory: (cylinderId) => {
    return get()
      .borrowRecords.filter((r) => r.cylinderId === cylinderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getActualReturnStatus: (record) => getActualReturnStatus(record),
}));
