import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useUsers, useDeleteUser, useCreateUser, useUpdateUser, useTickets,
  User, Ticket 
} from '../features/users/api';
import { Trash2, Pencil, Plus, X, Loader2, Ticket as TicketIcon } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: UsersPage,
});

const userSchema = z.object({
  name: z.string().min(2, "Ім'я має бути мінімум 2 літери"),
  surname: z.string().min(2, "Прізвище має бути мінімум 2 літери"),
  email: z.string().email("Некоректний email"),
  phone: z.string().min(10, "Введіть коректний номер телефону"),
  dateOfBirth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: "Введіть коректну дату",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

function UsersPage() {
  const { data: users, isLoading, isError } = useUsers();
  const { data: tickets } = useTickets();
  const deleteMutation = useDeleteUser();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForTickets, setSelectedUserForTickets] = useState<User | null>(null);

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openTicketsModal = (user: User) => {
    setSelectedUserForTickets(user);
    setIsTicketsModalOpen(true);
  };

  if (isLoading) return <div className="p-8">Завантаження...</div>;
  if (isError) return <div className="p-8 text-red-500">Помилка завантаження даних.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Пасажири</h1>
          <p className="text-gray-500">Керування клієнтами та історія поїздок</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition-all"
        >
          <Plus size={20} />
          Додати пасажира
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Пасажир</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Контакти</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Дата нар.</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users?.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {user.name?.[0]}{user.surname?.[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name} {user.surname}</div>
                      <div className="text-xs text-blue-500 font-medium cursor-pointer hover:underline" onClick={() => openTicketsModal(user)}>
                         {tickets?.filter((t: Ticket) => t.user?.id === user.id).length || 0} квитків
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.phone}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openTicketsModal(user)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded">
                      <TicketIcon size={18} />
                    </button>
                    <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => { if(confirm('Видалити?')) deleteMutation.mutate(user.id) }} className="text-red-600 hover:bg-red-50 p-2 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} />
      )}

      {isTicketsModalOpen && selectedUserForTickets && (
        <TicketsListModal 
          user={selectedUserForTickets}
          allTickets={tickets || []}
          onClose={() => setIsTicketsModalOpen(false)}
        />
      )}
    </div>
  );
}

function TicketsListModal({ user, allTickets, onClose }: { user: User, allTickets: Ticket[], onClose: () => void }) {
  const userTickets = allTickets.filter(t => t.user?.id === user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            Квитки: {user.name} {user.surname}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
          <div className="space-y-3">
            {userTickets.length > 0 ? (
              userTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white border rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <TicketIcon size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                          Квиток #{ticket.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Статус: <span className="font-medium uppercase">{ticket.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(ticket.dateOfCreation).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">{ticket.price} ₴</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                 <TicketIcon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                 <p>Історія поїздок порожня</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({ user, onClose }: { user: User | null, onClose: () => void }) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isEditing = !!user;

  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    }
  });

  const onSubmit = (data: UserFormData) => {
    const payload = { ...data, dateOfBirth: new Date(data.dateOfBirth).toISOString() };
    if (isEditing) {
      updateMutation.mutate({ id: user.id, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Редагувати' : 'Новий пасажир'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Ім'я</label><input {...register('name')} className="w-full border p-2 rounded" /></div>
            <div><label className="text-sm font-medium">Прізвище</label><input {...register('surname')} className="w-full border p-2 rounded" /></div>
          </div>
          <div><label className="text-sm font-medium">Email</label><input {...register('email')} className="w-full border p-2 rounded" /></div>
          <div><label className="text-sm font-medium">Телефон</label><input {...register('phone')} className="w-full border p-2 rounded" /></div>
          <div><label className="text-sm font-medium">Дата народження</label><input type="date" {...register('dateOfBirth')} className="w-full border p-2 rounded" /></div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 p-2 border rounded">Скасувати</button>
            <button type="submit" disabled={isPending} className="flex-1 p-2 bg-blue-600 text-white rounded flex justify-center items-center gap-2">{isPending && <Loader2 className="animate-spin" size={18} />} Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
}