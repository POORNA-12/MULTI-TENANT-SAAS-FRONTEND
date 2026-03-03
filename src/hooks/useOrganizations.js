import { useQuery } from '@tanstack/react-query';
import organizationService from '../services/organizationService';
import { queryKeys } from '../utils/queryKeys';

export const useOrganizations = () => {
    return useQuery({
        queryKey: queryKeys.organizations,
        queryFn: async () => {
            const data = await organizationService.getOrganizations();
            return data.organizations || [];
        },
    });
};
