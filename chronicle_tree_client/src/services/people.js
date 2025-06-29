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

export const createPerson = (person) => api.post('/people', { person });

export const createRelationship = (relationship) => api.post('/relationships', { relationship });

export const updatePerson = (id, person) => api.put(`/people/${id}`, { person });

export const deletePerson = (id) => api.delete(`/people/${id}`);

export const useAddPerson = () => {
  const queryClient = useQueryClient();
  return useMutation(newPerson => api.post('/people', { person: newPerson }), {
    onSuccess: () => {
      queryClient.invalidateQueries('people');
      queryClient.invalidateQueries('tree');
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id, ...person }) => api.put(`/people/${id}`, { person }), {
    onSuccess: () => {
      queryClient.invalidateQueries('people');
      queryClient.invalidateQueries('tree');
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation(id => api.delete(`/people/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries('people');
      queryClient.invalidateQueries('tree');
    },
  });
};
