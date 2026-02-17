'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { siteConfig } from '@/configs/site';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: siteConfig.staleTime,
            refetchOnWindowFocus: false,
        },
    },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
