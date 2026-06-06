import type { StateCreator } from 'zustand';
import type { BaseFilterState, FilterFunction, PaginationResult } from '../types/base';
import { paginate, calculatePageAfterDelete, getSafePage } from '../utils/common';

export interface BaseCrudState<T> {
  items: T[];
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => T | undefined;
}

export interface BaseDrawerState<TId = string, TEditMode extends string = string> {
  selectedId: TId | null;
  drawerOpen: boolean;
  editMode: TEditMode;
  setSelectedId: (id: TId | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setEditMode: (mode: TEditMode) => void;
  openDrawer: (id: TId, mode: TEditMode) => void;
  closeDrawer: () => void;
}

export interface BaseFilterStateT<F extends BaseFilterState> {
  filters: F;
  setFilters: (filters: Partial<F>) => void;
  resetFilters: () => void;
  getFilteredItems: () => any[];
}

export interface BasePaginationStateT {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  getPaginatedItems: <T>(items: T[]) => PaginationResult<T>;
}

export interface BaseSelectionState {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;
}

export interface BaseStoreOptions<T, F extends BaseFilterState> {
  initialItems?: T[];
  initialFilters: F;
  initialPageSize?: number;
  getId: (item: T) => string;
  filterFn: FilterFunction<T, F>;
}

export function createCrudSlice<T>(
  options: BaseStoreOptions<T, any>
): StateCreator<BaseCrudState<T>, [], [], BaseCrudState<T>> {
  const { initialItems = [], getId } = options;

  return (set, get) => ({
    items: initialItems as T[],

    setItems: (items) => set({ items }),

    addItem: (item) =>
      set((state) => ({
        items: [...(state.items as T[]), item],
      })),

    updateItem: (id, updates) =>
      set((state) => ({
        items: (state.items as T[]).map((item) =>
          getId(item) === id ? { ...item, ...updates } : item
        ),
      })),

    deleteItem: (id) =>
      set((state) => {
        const newItems = (state.items as T[]).filter((item) => getId(item) !== id);
        return { items: newItems };
      }),

    getItemById: (id) => (get().items as T[]).find((item) => getId(item) === id),
  });
}

export function createDrawerSlice<
  TId extends string = string,
  TEditMode extends string = 'view'
>(
  defaultEditMode: TEditMode = 'view' as TEditMode
): StateCreator<BaseDrawerState<TId, TEditMode>, [], [], BaseDrawerState<TId, TEditMode>> {
  return (set) => ({
    selectedId: null,
    drawerOpen: false,
    editMode: defaultEditMode,

    setSelectedId: (id) => set({ selectedId: id }),
    setDrawerOpen: (open) => set({ drawerOpen: open }),
    setEditMode: (mode) => set({ editMode: mode }),

    openDrawer: (id, mode) =>
      set({
        selectedId: id,
        drawerOpen: true,
        editMode: mode,
      }),

    closeDrawer: () =>
      set({
        drawerOpen: false,
        selectedId: null,
        editMode: defaultEditMode,
      }),
  });
}

export function createFilterSlice<T, F extends BaseFilterState>(
  options: BaseStoreOptions<T, F>
): StateCreator<BaseFilterStateT<F> & { items: T[]; page: number }, [], [], BaseFilterStateT<F>> {
  const { initialFilters, filterFn } = options;

  return (set, get) => ({
    filters: initialFilters,

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

    getFilteredItems: () => {
      const { items, filters } = get() as { items: T[]; filters: F };
      return items.filter((item) => filterFn(item, filters));
    },
  });
}

export function createPaginationSlice(
  initialPageSize: number = 10
): StateCreator<BasePaginationStateT, [], [], BasePaginationStateT> {
  return (set, get) => ({
    page: 0,
    pageSize: initialPageSize,

    setPage: (page) => set({ page }),

    setPageSize: (size) => set({ pageSize: size, page: 0 }),

    getPaginatedItems: <T>(items: T[]) => {
      const { page, pageSize } = get();
      return paginate(items, page, pageSize);
    },
  });
}

export function createSelectionSlice(): StateCreator<
  BaseSelectionState,
  [],
  [],
  BaseSelectionState
> {
  return (set) => ({
    selectedIds: [],

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    toggleSelectId: (id) =>
      set((state) => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((i) => i !== id)
          : [...state.selectedIds, id],
      })),

    clearSelection: () => set({ selectedIds: [] }),
  });
}

export function calculatePageAfterDeleteSafe(
  currentPage: number,
  currentPageSize: number,
  filteredAfter: any[]
): number {
  return calculatePageAfterDelete(currentPage, currentPageSize, filteredAfter.length);
}

export { getSafePage };
