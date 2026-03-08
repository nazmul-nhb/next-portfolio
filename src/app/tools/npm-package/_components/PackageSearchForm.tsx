import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Package } from 'lucide-react';
import { getTimestamp } from 'nhb-toolbox';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { NPM_START, type PackageSearch } from '@/types/npm';

const NpmPackageSchema = z.object({
    package: z.string().min(1, 'Package name is required'),
    start: z.string().optional(),
    end: z.string().optional(),
});

type NpmPackageFormValues = z.infer<typeof NpmPackageSchema>;

interface PackageSearchFormProps {
    isLoading: boolean;
    onSearch: (values: PackageSearch) => void;
    onReset: () => void;
    hasSearched: boolean;
    initialValues?: NpmPackageFormValues;
}

export function PackageSearchForm({
    isLoading,
    onSearch,
    onReset,
    hasSearched,
    initialValues,
}: PackageSearchFormProps) {
    const form = useForm<NpmPackageFormValues>({
        resolver: zodResolver(NpmPackageSchema),
        mode: 'onChange',
        defaultValues: initialValues || {
            package: '',
            start: NPM_START,
            end: getTimestamp({ format: 'local' }).split('T')[0],
        },
    });

    const packageName = form.watch('package');
    const startDate = form.watch('start');
    const endDate = form.watch('end');

    const handleSubmit = useCallback(() => {
        if (!packageName.trim()) return;
        onSearch({
            packageName: packageName.trim(),
            startDate: startDate || '',
            endDate: endDate || '',
        });
    }, [packageName, startDate, endDate, onSearch]);

    const handleReset = () => {
        form.reset({
            package: '',
            start: NPM_START,
            end: getTimestamp({ format: 'local' }).split('T')[0],
        });

        onReset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="size-5" />
                    Search Package
                </CardTitle>
                <CardDescription>
                    Enter a package name and optional date range to view download statistics.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
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
                                                max={endDate}
                                                min={NPM_START}
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
                            <Button disabled={isLoading || !packageName.trim()} type="submit">
                                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
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
    );
}
