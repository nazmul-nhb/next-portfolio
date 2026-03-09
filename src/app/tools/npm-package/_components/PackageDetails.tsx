'use client';

import type { Variants } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMount } from 'nhb-hooks';
import { generateQueryParams, getTimestamp } from 'nhb-toolbox';
import { useCallback, useMemo, useState } from 'react';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import { NPM_START } from '@/lib/constants';
import { useApiQuery } from '@/lib/hooks/use-api';
import type { PackageResponse, PackageSearch } from '@/types/npm';
import { PackageResults } from './PackageResults';
import { PackageSearchForm } from './PackageSearchForm';

export default function NpmPackageDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasSearched, setHasSearched] = useState(false);

    const initialPackage = searchParams.get('package') || '';
    const initialStart = searchParams.get('start') || NPM_START;
    const initialEnd =
        searchParams.get('end') || getTimestamp({ format: 'local' }).split('T')[0];

    // Check if we should auto-search on mount
    const shouldAutoSearch = useMemo(
        () => initialPackage && !hasSearched,
        [initialPackage, hasSearched]
    );

    const apiEndpoint = useMemo(() => {
        if (!initialPackage.trim()) return '/api/npm';

        const params = generateQueryParams({
            package: initialPackage.trim(),
            start: initialStart,
            end: initialEnd,
        });

        return `/api/npm${params}` as const;
    }, [initialPackage, initialStart, initialEnd]);

    const { data, isLoading, error } = useApiQuery<PackageResponse>(apiEndpoint, {
        enabled: !!apiEndpoint && hasSearched,
        queryKey: [apiEndpoint],
    });

    // Auto-search if URL has params on mount
    if (shouldAutoSearch && !hasSearched) {
        setHasSearched(true);
    }

    const handleSearch = useCallback(
        (values: PackageSearch) => {
            setHasSearched(true);

            const params = generateQueryParams({
                package: values.packageName,
                start: values.startDate,
                end: values.endDate,
            });

            router.push(`/tools/npm-package${params}`);
        },
        [router]
    );

    const handleReset = () => {
        setHasSearched(false);
        router.push('/tools/npm-package');
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.2 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    const content = (
        <div className="space-y-8">
            <TitleWithShare
                description="Search for any npm package and view comprehensive details including downloads, maintainers, repository, license, and more."
                route="/tools/npm-package"
                title="NPM Package Details"
            />

            <SmartAlert
                className="bg-teal-800/20"
                description="The download dates and counts are fetched from the official npm registry. Data may have a slight delay."
                Icon={AlertCircle}
                title="Data Source"
                variant="default"
            />

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <PackageSearchForm
                    hasSearched={hasSearched}
                    initialValues={{
                        package: initialPackage,
                        start: initialStart,
                        end: initialEnd,
                    }}
                    isLoading={isLoading}
                    onReset={handleReset}
                    onSearch={handleSearch}
                />

                <PackageResults
                    containerVariants={containerVariants}
                    data={data || null}
                    error={error as Error | null}
                    hasSearched={hasSearched}
                    isLoading={isLoading}
                    itemVariants={itemVariants}
                />
            </div>
        </div>
    );

    return useMount(content);
}
