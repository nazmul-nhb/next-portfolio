import { motion, type Variants } from 'framer-motion';
import { AlertCircle, Package } from 'lucide-react';
import EmptyData from '@/components/misc/empty-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PackageResponse } from '@/types/npm';
import { AuthorsSection } from './AuthorsSection';
import { KeywordsSection } from './KeywordsSection';
import { PackageInfo } from './PackageInfo';
import { PackageStats } from './PackageStats';
import { RepositorySection } from './RepositorySection';

interface PackageResultsProps {
    data: PackageResponse | null;
    error: Error | null;
    hasSearched: boolean;
    containerVariants: Variants;
    itemVariants: Variants;
}

export function PackageResults({
    data,
    error,
    hasSearched,
    containerVariants,
    itemVariants,
}: PackageResultsProps) {
    const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch package details';

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        );
    }

    if (!hasSearched) {
        return (
            <EmptyData
                description="Enter a package name and click search to view details"
                Icon={Package}
                title="Search for a Package"
            />
        );
    }

    if (!data) {
        return null;
    }

    return (
        <motion.div
            animate="visible"
            className="space-y-4"
            initial="hidden"
            variants={containerVariants}
        >
            <PackageStats data={data} variants={itemVariants} />
            <PackageInfo data={data} variants={itemVariants} />
            <RepositorySection data={data} variants={itemVariants} />
            <AuthorsSection data={data} variants={itemVariants} />
            <KeywordsSection data={data} variants={itemVariants} />
        </motion.div>
    );
}
