'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { siteConfig } from '@/configs/site';
import type { ChildrenProp } from '@/types';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: siteConfig.staleTime,
            refetchOnWindowFocus: false,
        },
    },
});

export function ReactQueryProvider({ children }: ChildrenProp) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
