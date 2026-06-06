import { create } from 'zustand';
import type { Cylinder, FilterState, EditMode, Crack } from '../types';
import { mockCylinders } from '../data/mockData';

interface CylinderState {
  cylinders: Cylinder[];
  selectedCylinderId: string | null;
  drawerOpen: boolean;
  editMode: EditMode;
  filters: FilterState;
  page: number;
  pageSize: number;

  setCylinders: (cylinders: Cylinder[]) => void;
  addCylinder: (cylinder: Cylinder) => void;
  updateCylinder: (id: string, updates: Partial<Cylinder>) => void;
  deleteCylinder: (id: string) => void;
  getCylinderById: (id: string) => Cylinder | undefined;

  setSelectedCylinderId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setEditMode: (mode: EditMode) => void;
  openDrawer: (id: string, mode: EditMode) => void;
  closeDrawer: () => void;

  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  getFilteredCylinders: () => Cylinder[];

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  addCrack: (cylinderId: string, crack: Crack) => void;
  updateCrack: (cylinderId: string, crackId: string, updates: Partial<Crack>) => void;
  deleteCrack: (cylinderId: string, crackId: string) => void;
}

const initialFilters: FilterState = {
  search: '',
  status: '',
  noiseLevel: '',
  materialStatus: '',
  hasSevereCrack: null,
};

export const useCylinderStore = create<CylinderState>((set, get) => ({
  cylinders: mockCylinders,
  selectedCylinderId: null,
  drawerOpen: false,
  editMode: 'view',
  filters: initialFilters,
  page: 0,
  pageSize: 10,

  setCylinders: (cylinders) => set({ cylinders }),

  addCylinder: (cylinder) =>
    set((state) => ({
      cylinders: [...state.cylinders, cylinder],
    })),

  updateCylinder: (id, updates) =>
    set((state) => ({
      cylinders: state.cylinders.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteCylinder: (id) =>
    set((state) => {
      const newCylinders = state.cylinders.filter((c) => c.id !== id);

      const filteredAfter = newCylinders.filter((c) => {
        if (state.filters.search) {
          const searchLower = state.filters.search.toLowerCase();
          if (
            !c.id.toLowerCase().includes(searchLower) &&
            !c.title.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }
        if (state.filters.status && c.currentStatus !== state.filters.status) return false;
        if (state.filters.noiseLevel && c.noiseLevel !== state.filters.noiseLevel) return false;
        if (state.filters.materialStatus && c.materialStatus !== state.filters.materialStatus) return false;
        if (state.filters.hasSevereCrack !== null) {
          const hasSevere = c.cracks.some((cr) => cr.severity === '严重');
          if (state.filters.hasSevereCrack !== hasSevere) return false;
        }
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
        cylinders: newCylinders,
        page: newPage,
      };
    }),

  getCylinderById: (id) => get().cylinders.find((c) => c.id === id),

  setSelectedCylinderId: (id) => set({ selectedCylinderId: id }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setEditMode: (mode) => set({ editMode: mode }),

  openDrawer: (id, mode) =>
    set({
      selectedCylinderId: id,
      drawerOpen: true,
      editMode: mode,
    }),

  closeDrawer: () =>
    set({
      drawerOpen: false,
      selectedCylinderId: null,
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

  getFilteredCylinders: () => {
    const { cylinders, filters } = get();
    return cylinders.filter((c) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !c.id.toLowerCase().includes(searchLower) &&
          !c.title.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.status && c.currentStatus !== filters.status) return false;
      if (filters.noiseLevel && c.noiseLevel !== filters.noiseLevel) return false;
      if (filters.materialStatus && c.materialStatus !== filters.materialStatus) return false;
      if (filters.hasSevereCrack !== null) {
        const hasSevere = c.cracks.some((cr) => cr.severity === '严重');
        if (filters.hasSevereCrack !== hasSevere) return false;
      }
      return true;
    });
  },

  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 0 }),

  addCrack: (cylinderId, crack) =>
    set((state) => ({
      cylinders: state.cylinders.map((c) =>
        c.id === cylinderId ? { ...c, cracks: [...c.cracks, crack] } : c
      ),
    })),

  updateCrack: (cylinderId, crackId, updates) =>
    set((state) => ({
      cylinders: state.cylinders.map((c) =>
        c.id === cylinderId
          ? {
              ...c,
              cracks: c.cracks.map((cr) =>
                cr.id === crackId ? { ...cr, ...updates } : cr
              ),
            }
          : c
      ),
    })),

  deleteCrack: (cylinderId, crackId) =>
    set((state) => ({
      cylinders: state.cylinders.map((c) =>
        c.id === cylinderId
          ? { ...c, cracks: c.cracks.filter((cr) => cr.id !== crackId) }
          : c
      ),
    })),
}));
