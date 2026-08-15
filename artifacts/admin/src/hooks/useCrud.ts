import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';

interface CrudApi<T> {
  list: (params?: Record<string, string | number>) => Promise<{ data: T[]; total: number }>;
  create?: (data: unknown) => Promise<T>;
  update?: (id: number | string, data: unknown) => Promise<T>;
  delete?: (id: number | string) => Promise<void>;
}

interface UseCrudOptions<T> {
  api: CrudApi<T>;
  queryKey: string;
  pageSize?: number;
}

export function useCrud<T extends { id: number | string }>({
  api,
  queryKey,
  pageSize = 20,
}: UseCrudOptions<T>) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<T | null>(null);
  const [showModal, setShowModal] = useState(false);

  const queryResult = useQuery({
    queryKey: [queryKey, page, search],
    queryFn: () =>
      api.list({
        page,
        limit: pageSize,
        ...(search ? { search } : {}),
      }),
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: [queryKey] });
  }, [qc, queryKey]);

  const createMutation = useMutation({
    mutationFn: (data: unknown) => {
      if (!api.create) throw new Error('Create not supported');
      return api.create(data);
    },
    onSuccess: () => {
      toast('บันทึกสำเร็จ', 'success');
      invalidate();
      setShowModal(false);
      setEditItem(null);
    },
    onError: (e) => {
      toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: unknown }) => {
      if (!api.update) throw new Error('Update not supported');
      return api.update(id, data);
    },
    onSuccess: () => {
      toast('อัปเดตสำเร็จ', 'success');
      invalidate();
      setShowModal(false);
      setEditItem(null);
    },
    onError: (e) => {
      toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => {
      if (!api.delete) throw new Error('Delete not supported');
      return api.delete(id);
    },
    onSuccess: () => {
      toast('ลบสำเร็จ', 'success');
      invalidate();
    },
    onError: (e) => {
      toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error');
    },
  });

  const openCreate = useCallback(() => {
    setEditItem(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditItem(null);
  }, []);

  const handleDelete = useCallback(
    (id: number | string) => {
      if (window.confirm('ต้องการลบรายการนี้?')) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation]
  );

  const handleSave = useCallback(
    (data: unknown) => {
      if (editItem) {
        updateMutation.mutate({ id: editItem.id, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [editItem, createMutation, updateMutation]
  );

  return {
    data: queryResult.data?.data ?? [],
    total: queryResult.data?.total ?? 0,
    isLoading: queryResult.isLoading,
    page,
    setPage,
    search,
    setSearch,
    editItem,
    showModal,
    openCreate,
    openEdit,
    closeModal,
    handleDelete,
    handleSave,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
