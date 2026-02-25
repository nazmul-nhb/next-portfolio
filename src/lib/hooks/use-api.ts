import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isArray } from 'nhb-toolbox';
import { toast } from 'sonner';
import { siteConfig } from '@/configs/site';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { Uncertain } from '@/types';

type $QueryKey = Uncertain<string | number | Array<string | number>>;

export type QueryKey = $QueryKey | Array<$QueryKey>;

export type QueryOptions = {
    enabled?: boolean;
    queryKey?: QueryKey;
    staleTime?: number;
    refetchInterval?: number;
};

export type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: unknown) => void;
    successMessage?: string;
    errorMessage?: string;
    prioritizeCustomMessages?: boolean;
    silentErrorMessage?: boolean;
    silentSuccessMessage?: boolean;
    invalidateKeys?: QueryKey;
};

/**
 * Generic query hook for GET requests
 */
export function useApiQuery<T>(endpoint: `/${string}`, options?: QueryOptions) {
    const { enabled, queryKey, refetchInterval, staleTime } = options || {};

    return useQuery({
        queryKey: isArray<QueryKey>(queryKey) ? queryKey : [queryKey],
        queryFn: async () => {
            const { data } = await httpRequest<T>(endpoint, { method: 'GET' });
            return data;
        },
        staleTime: staleTime ?? siteConfig.staleTime,
        refetchInterval: refetchInterval,
        enabled: enabled,
    });
}

/**
 * Generic mutation hook for POST/PUT/PATCH/DELETE
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
    endpoint: `/${string}`,
    method: MutationMethod,
    options?: MutationOptions<TData>
) {
    const queryClient = useQueryClient();
    const {
        errorMessage,
        invalidateKeys,
        onError,
        onSuccess,
        prioritizeCustomMessages = false,
        silentErrorMessage = false,
        silentSuccessMessage = false,
        successMessage,
    } = options || {};

    return useMutation({
        mutationFn: async (variables: TVariables) => {
            return await httpRequest<TData, TVariables>(endpoint, {
                method,
                body: variables,
            });
        },
        onSuccess: (data) => {
            if (!silentSuccessMessage) {
                const message =
                    (prioritizeCustomMessages
                        ? successMessage || data?.message
                        : data?.message || successMessage) || 'Operation successful';

                toast.success(message);
            }

            if (invalidateKeys) {
                const keys = isArray<QueryKey>(invalidateKeys)
                    ? invalidateKeys
                    : [invalidateKeys];

                for (const key of keys) {
                    queryClient.invalidateQueries({ queryKey: [key] });
                }
            }
            data?.data && onSuccess?.(data.data);
        },
        onError: (error) => {
            if (!silentErrorMessage) {
                const message =
                    (prioritizeCustomMessages
                        ? error?.message || errorMessage
                        : errorMessage || error?.message) || 'An error occurred';

                toast.error(message);
            }

            onError?.(error);
        },
    });
}

/**
 * Hook for API mutations with route navigation
 */
// export function useApiMutationWithRedirect<TData = unknown, TVariables = unknown>(
//     endpoint: `/${string}`,
//     method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
//     redirectUrl: string,
//     options?: {
//         successMessage?: string;
//         errorMessage?: string;
//         invalidateKeys?: QueryKey;
//     }
// ) {
//     const router = useRouter();
//     const queryClient = useQueryClient();

//     return useApiMutation<TData, TVariables>(endpoint, method, {
//         ...options,
//         onSuccess: () => {
//             if (options?.successMessage) {
//                 toast.success(options.successMessage);
//             }
//             if (options?.invalidateKeys) {
//                 const keys = isArray<QueryKey>(options.invalidateKeys)
//                     ? options.invalidateKeys
//                     : [options.invalidateKeys];

//                 for (const key of keys) {
//                     queryClient.invalidateQueries({ queryKey: [key] });
//                 }
//             }
//             router.push(redirectUrl as '/');
//         },
//     });
// }

/**
 * Hook for optimistic updates
 */
// export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
//     queryKey: QueryKey,
//     endpoint: `/${string}`,
//     method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
//     options?: {
//         successMessage?: string;
//         updateFn: (oldData: TData, variables: TVariables) => TData;
//     }
// ) {
//     const queryClient = useQueryClient();
//     const key = isArray<QueryKey>(queryKey) ? queryKey : [queryKey];

//     return useMutation({
//         mutationFn: async (variables: TVariables) => {
//             const { data } = await httpRequest<TData, TVariables>(endpoint, {
//                 method,
//                 body: variables,
//             });
//             return data;
//         },
//         onMutate: async (variables) => {
//             // Cancel outgoing refetches
//             await queryClient.cancelQueries({ queryKey: key });

//             // Snapshot previous value
//             const previousData = queryClient.getQueryData<TData>(key);

//             // Optimistically update
//             if (previousData && options?.updateFn) {
//                 queryClient.setQueryData<TData>(key, options.updateFn(previousData, variables));
//             }

//             return { previousData };
//         },
//         onError: (_err, _variables, context) => {
//             // Rollback on error
//             if (context?.previousData) {
//                 queryClient.setQueryData(key, context.previousData);
//             }
//             toast.error('Failed to update');
//         },
//         onSuccess: () => {
//             if (options?.successMessage) {
//                 toast.success(options.successMessage);
//             }
//         },
//         onSettled: () => {
//             // Refetch after success or error
//             queryClient.invalidateQueries({ queryKey: key });
//         },
//     });
// }
