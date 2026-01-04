import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';

export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role?: string;
};

export type Ticket = {
  id: number;
  price: number;
  status: string;
  dateOfCreation: string;
  user?: {
    id: number;
    name: string;
    surname: string;
  };
  type?: string;
  seat?: string;
};

export type CreateUserPayload = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role?: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;

export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const response = await apiClient.get('/passengers');
    return Array.isArray(response.data) ? response.data : response.data.data;
  },
});

export const useTickets = () => useQuery({
  queryKey: ['tickets'],
  queryFn: async () => {
    const response = await apiClient.get('/tickets');
    return Array.isArray(response.data) ? response.data : response.data.data;
  },
});

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => apiClient.post('/passengers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('Пасажира створено успішно!');
    },
    onError: (error: any) => {
      alert(`Помилка: ${JSON.stringify(error.response?.data?.message || 'Не вдалося створити')}`);
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) => 
      apiClient.patch(`/passengers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('Дані оновлено!');
    },
    onError: (error: any) => {
      alert(`Помилка: ${JSON.stringify(error.response?.data?.message || 'Не вдалося оновити')}`);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/passengers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};