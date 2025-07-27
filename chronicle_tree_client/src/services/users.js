// User account management service with authentication and profile operations
import api from '../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query hook for retrieving current user profile data
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/users/me').then(res => res.data)
  });
}

// Mutation hook for updating user profile information with cache update
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: data => api.patch('/users/me', { user: data }).then(res => res.data),
    onSuccess: user => {
      qc.setQueryData(['user'], user);
    }
  });
}

// Mutation hook for secure password change functionality
export function useChangePassword() {
  return useMutation({
    mutationFn: data => api.patch('/users/me/password', { user: data })
  });
}

// Mutation hook for permanent account deletion with cleanup
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      // Clears authentication token and redirects to login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  });
}
