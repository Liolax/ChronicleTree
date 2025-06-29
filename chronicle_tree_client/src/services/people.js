import { useQuery } from '@tanstack/react-query';
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
