import { motion, type Variants } from 'framer-motion';
import { AlertCircle, Package } from 'lucide-react';
import EmptyData from '@/components/misc/empty-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { hasErrorMessage } from '@/lib/utils';
import type { PackageResponse } from '@/types/npm';
import { AuthorsSection } from './AuthorsSection';
import { PackageInfo } from './PackageInfo';
import { PackageStats } from './PackageStats';

interface PackageResultsProps {
    data: PackageResponse | null;
    error: Error | null;
    hasSearched: boolean;
    isLoading: boolean;
    containerVariants: Variants;
    itemVariants: Variants;
}

function PackageResultsSkeleton() {
    return (
        <div className="space-y-4">
            {/* Stats Cards Skeleton */}
            <div className="flex flex-wrap gap-4 justify-between">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card className="h-full shrink-0 flex-1" key={i}>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="size-4 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Period Skeleton */}
            <Card>
                <CardContent className="space-y-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="size-4 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Package Info Skeleton */}
            <Card>
                <CardContent className="space-y-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-12 rounded" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function PackageResults({
    data,
    error,
    hasSearched,
    isLoading,
    containerVariants,
    itemVariants,
}: PackageResultsProps) {
    const errorMessage = hasErrorMessage(error)
        ? error.message
        : 'Failed to fetch package details';

    if (error) {
        return (
            <Alert className="w-full border-2 h-full min-h-96" variant="destructive">
                <AlertCircle className="size-5" />
                <AlertTitle>Error Loading Package</AlertTitle>
                <AlertDescription className="mt-2 text-sm">{errorMessage}</AlertDescription>
            </Alert>
        );
    }

    // Loading state - show skeleton
    if (isLoading) {
        return <PackageResultsSkeleton />;
    }

    // Empty state - no search performed yet
    if (!isLoading && !hasSearched) {
        return (
            <EmptyData
                description="Enter a package name and click search to view details"
                Icon={Package}
                title="Search for a Package"
            />
        );
    }

    // No data state - show empty
    if (!data) {
        return (
            <EmptyData
                description="No data available for this package"
                Icon={Package}
                title="No Results"
            />
        );
    }

    // Data state - show results
    return (
        <motion.div
            animate="visible"
            className="space-y-4"
            initial="hidden"
            variants={containerVariants}
        >
            <PackageStats data={data} variants={itemVariants} />
            <PackageInfo data={data} variants={itemVariants} />
            <AuthorsSection data={data} variants={itemVariants} />
        </motion.div>
    );
}
