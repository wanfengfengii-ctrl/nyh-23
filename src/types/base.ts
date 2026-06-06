export interface BaseEntity {
  id: string;
  createdAt: string;
}

export type BaseEditMode = 'view' | 'edit' | 'create';

export interface BaseFilterState {
  search: string;
}

export interface BasePaginationState {
  page: number;
  pageSize: number;
}

export interface BaseDrawerState<TId = string> {
  drawerOpen: boolean;
  selectedId: TId | null;
  editMode: string;
}

export interface BaseSelectionState {
  selectedIds: string[];
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BatchOperationResult {
  success: string[];
  failed: { id: string; reason: string }[];
}

export type StatusColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface StatusColorMap {
  [status: string]: StatusColor;
}

export interface StatisticsCardData {
  label: string;
  value: number;
  color?: StatusColor;
  icon?: React.ReactNode;
}

export type FilterFunction<T, F> = (item: T, filters: F) => boolean;
