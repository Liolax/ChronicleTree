import { useQuery } from '@tanstack/react-query';
import api from './api';

const getTree = async (personId) => {
  const { data } = await api.get(`/api/v1/people/${personId}/tree`);
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
  const { data } = await api.get('/api/v1/people');
  return data;
};

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
  });
}

export const createPerson = (person) => api.post('/api/v1/people', { person });

export const createRelationship = (relationship) => api.post('/api/v1/relationships', { relationship });

export const updatePerson = (id, person) => api.put(`/api/v1/people/${id}`, { person });

export const deletePerson = (id) => api.delete(`/api/v1/people/${id}`);
