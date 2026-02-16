import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { httpRequest } from '@/lib/actions/baseRequest';

type QueryKey = string | string[] | Array<QueryKey>;

/**
 * Generic query hook for GET requests
 */
export function useApiQuery<T>(
    key: QueryKey,
    endpoint: `/${string}`,
    options?: {
        enabled?: boolean;
        staleTime?: number;
        refetchInterval?: number;
    }
) {
    return useQuery({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn: async () => {
            const { data } = await httpRequest<T>(endpoint, { method: 'GET' });
            return data;
        },
        staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
        refetchInterval: options?.refetchInterval,
        enabled: options?.enabled,
    });
}

/**
 * Generic mutation hook for POST/PUT/PATCH/DELETE
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
    endpoint: `/${string}`,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: unknown) => void;
        successMessage?: string;
        errorMessage?: string;
        invalidateKeys?: QueryKey;
    }
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: TVariables) => {
            const { data } = await httpRequest<TData, TVariables>(endpoint, {
                method,
                body: variables,
            });
            return data;
        },
        onSuccess: (data) => {
            if (options?.successMessage) {
                toast.success(options.successMessage);
            }
            if (options?.invalidateKeys) {
                const keys = Array.isArray(options.invalidateKeys)
                    ? options.invalidateKeys
                    : [options.invalidateKeys];

                for (const key of keys) {
                    queryClient.invalidateQueries({ queryKey: [key] });
                }
            }
            data && options?.onSuccess?.(data);
        },
        onError: (error) => {
            const message =
                options?.errorMessage ||
                (error as { message?: string })?.message ||
                'An error occurred';
            toast.error(message);
            options?.onError?.(error);
        },
    });
}

/**
 * Hook for API mutations with route navigation
 */
export function useApiMutationWithRedirect<TData = unknown, TVariables = unknown>(
    endpoint: `/${string}`,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    redirectUrl: string,
    options?: {
        successMessage?: string;
        errorMessage?: string;
        invalidateKeys?: QueryKey;
    }
) {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useApiMutation<TData, TVariables>(endpoint, method, {
        ...options,
        onSuccess: () => {
            if (options?.successMessage) {
                toast.success(options.successMessage);
            }
            if (options?.invalidateKeys) {
                const keys = Array.isArray(options.invalidateKeys)
                    ? options.invalidateKeys
                    : [options.invalidateKeys];

                for (const key of keys) {
                    queryClient.invalidateQueries({ queryKey: [key] });
                }
            }
            router.push(redirectUrl as '/');
        },
    });
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
    queryKey: QueryKey,
    endpoint: `/${string}`,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    options?: {
        successMessage?: string;
        updateFn: (oldData: TData, variables: TVariables) => TData;
    }
) {
    const queryClient = useQueryClient();
    const key = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useMutation({
        mutationFn: async (variables: TVariables) => {
            const { data } = await httpRequest<TData, TVariables>(endpoint, {
                method,
                body: variables,
            });
            return data;
        },
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: key });

            // Snapshot previous value
            const previousData = queryClient.getQueryData<TData>(key);

            // Optimistically update
            if (previousData && options?.updateFn) {
                queryClient.setQueryData<TData>(key, options.updateFn(previousData, variables));
            }

            return { previousData };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(key, context.previousData);
            }
            toast.error('Failed to update');
        },
        onSuccess: () => {
            if (options?.successMessage) {
                toast.success(options.successMessage);
            }
        },
        onSettled: () => {
            // Refetch after success or error
            queryClient.invalidateQueries({ queryKey: key });
        },
    });
}
