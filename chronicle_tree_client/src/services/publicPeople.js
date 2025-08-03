// Public API service layer for shared family trees (no authentication required)
import { useQuery } from '@tanstack/react-query';
import publicApi from '../api/publicApi';

const getPublicTree = async (personId) => {
  const { data } = await publicApi.get(`/public_api/people/${personId}/tree`);
  return data;
};

export function usePublicTree(personId) {
  return useQuery({ 
    queryKey: ['public_tree', personId], 
    queryFn: () => getPublicTree(personId),
    enabled: !!personId
  });
}

const getPublicFullTree = async () => {
  const { data } = await publicApi.get('/public_api/people/full_tree');
  return data;
};

export function usePublicFullTree() {
  return useQuery({
    queryKey: ['public_full_tree'],
    queryFn: getPublicFullTree,
  });
}
