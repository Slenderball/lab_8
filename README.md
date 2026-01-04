# Звіт до лабораторної роботи №8-9

## Короткий опис реалізованого функціоналу
Розроблено клієнтську частину (Frontend) для системи бронювання квитків на базі стеку React, TypeScript та Vite. Реалізовано взаємодію з REST API, відображення списку сутностей, маршрутизацію за допомогою TanStack Router та валідацію форм. Налаштовано контейнеризацію додатку за допомогою Docker та взаємодію контейнерів у єдиній мережі.

## Приклади ключового коду

### 1. Конфігурація Axios (src/lib/axios.ts)
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```
### 2. Хуки для TanStack Query (src/features/tickets/api.ts)
```typescript

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

const getTickets = async () => {
  const response = await apiClient.get('/tickets');
  return response.data;
};

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });
};

```

### 3. Схема валідації Zod (src/features/tickets/types.ts)
```typescript

import { z } from 'zod';

export const ticketSchema = z.object({
  price: z.number().positive('Price must be positive'),
  seatNumber: z.string().min(2, 'Seat number is too short'),
  status: z.enum(['new', 'used', 'refunded']),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

```


##Скріншоти, що демонструють роботу

