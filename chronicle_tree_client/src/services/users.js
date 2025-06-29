// src/services/users.js
import api from '../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/users/me').then(res => res.data)
  });
}

// Update name & email
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: data => api.patch('/users/me', { user: data }).then(res => res.data),
    onSuccess: user => {
      qc.setQueryData(['user'], user);
    }
  });
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: data => api.patch('/users/me/password', { user: data })
  });
}

// Delete account
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      // remove token & redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  });
}
