import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes (named cacheTime in v4, gcTime in v5, but we'll use gcTime if it's v5. TanStack v5 uses gcTime instead of cacheTime. We will use gcTime to be safe, but keep cacheTime in mind)
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});
