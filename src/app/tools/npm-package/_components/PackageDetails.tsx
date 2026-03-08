'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, type Variants } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Code,
    Download,
    FileText,
    Link as LinkIcon,
    Loader2,
    Package,
    User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMount } from 'nhb-hooks';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ShareButton from '@/components/misc/share-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/lib/hooks/use-api';
import type { PackageResponse } from '@/types/npm';
import { hasErrorMessage } from '@/lib/utils';

function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
}

const NpmPackageSchema = z.object({
    package: z.string().min(1, 'Package name is required'),
    start: z.string().optional(),
    end: z.string().optional(),
});

type NpmPackageFormValues = z.infer<typeof NpmPackageSchema>;

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'emerald' | 'purple' | 'amber' | 'pink';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'text-blue-600 dark:text-blue-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        purple: 'text-purple-600 dark:text-purple-400',
        amber: 'text-amber-600 dark:text-amber-400',
        pink: 'text-pink-600 dark:text-pink-400',
    };

    return (
        <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="h-full">
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <div className={colorClasses[color]}>{icon}</div>
                        </div>
                        <motion.p
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xl md:text-2xl font-bold tracking-tight"
                            initial={{ opacity: 0, scale: 0.8 }}
                            key={value}
                            transition={{ duration: 0.25 }}
                        >
                            {value}
                        </motion.p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function NpmPackageDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasSearched, setHasSearched] = useState(false);

    const form = useForm<NpmPackageFormValues>({
        resolver: zodResolver(NpmPackageSchema),
        mode: 'onChange',
        defaultValues: {
            package: searchParams.get('package') || '',
            start: searchParams.get('start') || '',
            end: searchParams.get('end') || '',
        },
    });

    const packageName = form.watch('package');
    const startDate = form.watch('start');
    const endDate = form.watch('end');

    const apiEndpoint = useMemo(() => {
        if (!packageName.trim()) return null;

        const params = new URLSearchParams({
            package: packageName.trim(),
        });

        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);

        return `/api/npm?${params.toString()}` as const;
    }, [packageName, startDate, endDate]);

    const { data, isLoading, error } = useApiQuery<PackageResponse>(
        (apiEndpoint || '/api/npm') as `/${string}`,
        {
            enabled: !!apiEndpoint && hasSearched,
            queryKey: [apiEndpoint],
        }
    );

    const handleSearch = useCallback(() => {
        if (!packageName.trim()) return;

        setHasSearched(true);

        const params = new URLSearchParams({
            package: packageName.trim(),
        });

        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);

        router.push(`/tools/npm-package?${params.toString()}`);
    }, [packageName, startDate, endDate, router]);

    const handleReset = () => {
        form.reset({
            package: '',
            start: '',
            end: '',
        });
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

    const errorMessage = hasErrorMessage(error)
        ? error.message
        : 'Failed to fetch package details';

    return useMount(
        <div className="space-y-8">
            <div>
                <div className="flex items-start gap-2 flex-wrap justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        NPM Package Details
                    </h1>
                    <ShareButton
                        buttonLabel="Share this tool"
                        route="/tools/npm-package"
                        shareText="NPM Package Details Tool"
                    />
                </div>
                <p className="max-w-3xl mt-2 text-sm text-muted-foreground">
                    Search for any npm package and view comprehensive details including
                    downloads, maintainers, repository, license, and more.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="size-5" />
                        Search Package
                    </CardTitle>
                    <CardDescription>
                        Enter a package name and optional date range to view download
                        statistics.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch();
                            }}
                        >
                            <FormField
                                control={form.control}
                                name="package"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Package Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., react, axios, lodash..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The exact name of the package as it appears on npm.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="start"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    max={endDate || undefined}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Download count start date
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="end"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    min={startDate || undefined}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Download count end date
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    disabled={isLoading || !packageName.trim()}
                                    type="submit"
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {isLoading ? 'Searching...' : 'Search Package'}
                                </Button>
                                {hasSearched && (
                                    <Button
                                        disabled={isLoading}
                                        onClick={handleReset}
                                        type="button"
                                        variant="outline"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {data && !error && (
                <motion.div
                    animate="visible"
                    className="space-y-6"
                    initial="hidden"
                    variants={containerVariants}
                >
                    {/* Download Statistics */}
                    <motion.div variants={itemVariants}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <StatCard
                                color="emerald"
                                icon={<Download className="size-4" />}
                                label="Total Downloads"
                                value={formatNumber(data.downloads)}
                            />
                            <StatCard
                                color="blue"
                                icon={<Calendar className="size-4" />}
                                label="Period"
                                value={`${data.start} to ${data.end}`}
                            />
                            <StatCard
                                color="purple"
                                icon={<Package className="size-4" />}
                                label="Package"
                                value={data.package}
                            />
                        </div>
                    </motion.div>

                    {/* Package Information */}
                    {(data.description ||
                        data['dist-tags'] ||
                        data.license ||
                        data.homepage) && (
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="size-5" />
                                        Package Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {data.description && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Description
                                            </p>
                                            <p className="text-sm text-foreground">
                                                {data.description}
                                            </p>
                                        </div>
                                    )}

                                    {data['dist-tags'] &&
                                        Object.keys(data['dist-tags']).length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Version Tags
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(data['dist-tags']).map(
                                                        ([tag, version]) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                            >
                                                                <Code className="size-3 mr-1" />
                                                                {tag}: {version}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {data.license && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    License
                                                </p>
                                                <Badge>{data.license}</Badge>
                                            </div>
                                        )}

                                        {data.homepage && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Homepage
                                                </p>
                                                <a
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    href={data.homepage}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    <LinkIcon className="size-3" />
                                                    View Homepage
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Repository Information */}
                    {data.repository && (
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="size-5" />
                                        Repository
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {data.repository.url && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                URL
                                            </p>
                                            <a
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                                                href={data.repository.url}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {data.repository.url}
                                            </a>
                                        </div>
                                    )}
                                    {data.repository.type && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Type
                                            </p>
                                            <Badge variant="secondary">
                                                {data.repository.type}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Author & Contributors */}
                    {(data.author || data.maintainers?.length || data.contributors?.length) && (
                        <motion.div variants={itemVariants}>
                            <div className="grid gap-4 md:grid-cols-2">
                                {data.author && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <User className="size-4" />
                                                Author
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {data.author.name && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Name
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {data.author.name}
                                                    </p>
                                                </div>
                                            )}
                                            {data.author.email && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Email
                                                    </p>
                                                    <a
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                        href={`mailto:${data.author.email}`}
                                                    >
                                                        {data.author.email}
                                                    </a>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {data.maintainers && data.maintainers.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">
                                                Maintainers
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {data.maintainers.map((maintainer, idx) => (
                                                    <div
                                                        className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                                                        key={idx}
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {maintainer.name}
                                                        </span>
                                                        {maintainer.email && (
                                                            <a
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                                href={`mailto:${maintainer.email}`}
                                                            >
                                                                Email
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Keywords */}
                    {data.keywords && data.keywords.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Keywords</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {data.keywords.map((keyword, idx) => (
                                            <Badge key={idx} variant="outline">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {!hasSearched && (
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Package className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">
                            Enter a package name and click search to view details
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
