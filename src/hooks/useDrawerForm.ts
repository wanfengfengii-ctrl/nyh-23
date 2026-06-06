import { useState, useEffect, useCallback } from 'react';

export interface UseDrawerFormOptions<T> {
  isOpen: boolean;
  initialData?: Partial<T>;
  defaultData?: Partial<T>;
  existingData?: T;
  editMode?: string;
  onCreateMode?: () => Partial<T>;
}

export interface UseDrawerFormResult<T> {
  formData: Partial<T>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: () => void;
}

export function useDrawerForm<T>(
  options: UseDrawerFormOptions<T>
): UseDrawerFormResult<T> {
  const { isOpen, initialData = {}, defaultData = {}, existingData, editMode, onCreateMode } = options;

  const [formData, setFormData] = useState<Partial<T>>(initialData);

  useEffect(() => {
    if (isOpen) {
      if (editMode === 'create') {
        if (onCreateMode) {
          setFormData(onCreateMode());
        } else {
          setFormData(defaultData);
        }
      } else if (existingData) {
        setFormData(existingData as Partial<T>);
      } else {
        setFormData(initialData);
      }
    }
  }, [isOpen, editMode, existingData, initialData, defaultData, onCreateMode]);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    if (existingData) {
      setFormData(existingData as Partial<T>);
    } else {
      setFormData(initialData);
    }
  }, [existingData, initialData]);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
  };
}
