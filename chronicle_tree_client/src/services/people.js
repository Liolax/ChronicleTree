// API service layer for people and relationship management with React Query hooks
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
      // Retrieves complete tree data with client-side root filtering capability
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

// Query hook for retrieving individual person data with relationship details
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
    onError: (error) => {
      console.log('=== ADD PERSON ERROR DETAILS ===');
      console.log('Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Full error:', error);
      console.log('================================');
    }
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

// Mutation hook for updating spouse relationship status with cache invalidation
export const useToggleSpouseEx = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleSpouseEx,
    onSuccess: () => {
      // Refreshes cached data across all tree views after relationship update
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['full-tree'] });
    },
  });
};
