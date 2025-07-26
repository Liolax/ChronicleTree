import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

const getTree = async (personId) => {
  const { data } = await api.get(`/people/${personId}/tree`);
  return data;
};

export function useTree(personId) {
  return useQuery({ 
    queryKey: ['tree', personId], 
    queryFn: () => getTree(personId),
    enabled: !!personId
  });
}

const getPeople = async () => {
  const { data } = await api.get('/people');
  return data;
};

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
  });
}

const getFullTree = async () => {
  const { data } = await api.get('/people/full_tree');
  return data;
};

export function useFullTree(rootPersonId = null) {
  return useQuery({
    queryKey: ['full-tree', rootPersonId],
    queryFn: () => {
      // Always get the full tree data, regardless of rootPersonId
      // The rootPersonId is used for frontend filtering only
      return getFullTree();
    },
  });
}

export const createPerson = (person) => api.post('/people', { person });

export const createRelationship = (relationship) => api.post('/relationships', { relationship });

export const updatePerson = (id, person) => api.put(`/people/${id}`, { person });

export const deletePerson = (id) => api.delete(`/people/${id}`);

export const getPerson = async (id) => {
  const { data } = await api.get(`/people/${id}`);
  return data;
};

// React Query hook for getting a single person with relationships
export const usePerson = (id) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => getPerson(id),
    enabled: !!id,
  });
};

export const useAddPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newPerson => api.post('/people', { person: newPerson }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['full-tree'] });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...person }) => api.put(`/people/${id}`, { person }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['full-tree'] });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: id => api.delete(`/people/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['full-tree'] });
    },
  });
};

export const toggleSpouseEx = async (relationshipId) => {
  const { data } = await api.patch(`/relationships/${relationshipId}/toggle_ex`);
  return data;
};

// React Query hook for toggling spouse ex status
export const useToggleSpouseEx = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleSpouseEx,
    onSuccess: () => {
      // Invalidate all relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['full-tree'] });
    },
  });
};
