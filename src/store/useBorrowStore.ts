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

function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

function generateApplicationNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JY-${year}-${random}`;
}

function getCurrentTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

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
      const filteredAfter = newRecords.filter((r) => {
        if (state.filters.search) {
          const searchLower = state.filters.search.toLowerCase();
          if (
            !r.applicationNo.toLowerCase().includes(searchLower) &&
            !r.cylinderTitle.toLowerCase().includes(searchLower) &&
            !r.cylinderId.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }
        if (state.filters.borrowType && r.borrowType !== state.filters.borrowType) return false;
        if (state.filters.approvalStatus && r.approvalStatus !== state.filters.approvalStatus) return false;
        if (state.filters.returnStatus && r.returnStatus !== state.filters.returnStatus) return false;
        return true;
      });

      const totalPages = Math.ceil(filteredAfter.length / state.pageSize);
      let newPage = state.page;
      if (totalPages > 0 && state.page >= totalPages) {
        newPage = totalPages - 1;
      }
      if (totalPages === 0) {
        newPage = 0;
      }

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
    return borrowRecords.filter((r) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !r.applicationNo.toLowerCase().includes(searchLower) &&
          !r.cylinderTitle.toLowerCase().includes(searchLower) &&
          !r.cylinderId.toLowerCase().includes(searchLower) &&
          !r.applicant.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.borrowType && r.borrowType !== filters.borrowType) return false;
      if (filters.approvalStatus && r.approvalStatus !== filters.approvalStatus) return false;
      if (filters.returnStatus && getActualReturnStatus(r) !== filters.returnStatus) return false;
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        if (r.borrowDate < filters.dateRange[0] || r.borrowDate > filters.dateRange[1]) {
          return false;
        }
      }
      return true;
    });
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
      applicationNo: generateApplicationNo(),
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
    const currentlyBorrowed = borrowRecords.filter(
      (r) => {
        const actualStatus = getStatus(r);
        return r.approvalStatus === '审批通过' &&
          (actualStatus === '未归还' || actualStatus === '超期' || actualStatus === '损坏待复核');
      }
    ).length;
    const overdue = borrowRecords.filter(
      (r) => getStatus(r) === '超期'
    ).length;
    const returned = borrowRecords.filter((r) => getStatus(r) === '已归还').length;
    const internalBorrows = borrowRecords.filter((r) => r.borrowType === '馆内借阅').length;
    const externalExhibitions = borrowRecords.filter((r) => r.borrowType === '外部借展').length;
    const pendingApproval = borrowRecords.filter((r) => r.approvalStatus === '待审批').length;
    const damagePending = borrowRecords.filter((r) => getStatus(r) === '损坏待复核').length;

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
