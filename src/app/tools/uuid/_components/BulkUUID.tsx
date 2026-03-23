'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileJson, FileText, Key, RefreshCw, Sheet, UserKey } from 'lucide-react';
import { useDebouncedValue, useMount } from 'nhb-hooks';
import { debounceAction, isNonEmptyString, isNumber } from 'nhb-toolbox';
import { isUUID, uuid } from 'nhb-toolbox/hash';
import type { $UUID } from 'nhb-toolbox/hash/types';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
import Loading from '@/components/misc/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BULK_UUID_LIMIT, UUID_VERSIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { BulkUUIDGeneratorSchema } from '@/lib/zod-schema/tools';

type BulkUUIDGeneratorFormValues = z.infer<typeof BulkUUIDGeneratorSchema>;

type GeneratedBulkUUID = {
    uuid: $UUID;
    index: number;
    version: string;
    name: string | null;
    namespace: $UUID | null;
};

function escapeCsvValue(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function BulkGenerateUUID() {
    const [generatedUUIDs, setGeneratedUUIDs] = useState<GeneratedBulkUUID[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generatorForm = useForm<BulkUUIDGeneratorFormValues>({
        resolver: zodResolver(BulkUUIDGeneratorSchema),
        mode: 'onChange',
        defaultValues: {
            version: 'v4',
            name: '',
            namespace: '',
            uppercase: false,
            count: 10,
        },
    });

    const version = generatorForm.watch('version');
    const uppercase = generatorForm.watch('uppercase');

    const [debouncedName] = useDebouncedValue(generatorForm.watch('name'), 500);
    const [debouncedNamespace] = useDebouncedValue(generatorForm.watch('namespace'), 500);
    const [debouncedCount] = useDebouncedValue(generatorForm.watch('count'), 500);

    const requiresNamespace = version === 'v3' || version === 'v5';

    const handleGenerateBulkUUIDs = useCallback(() => {
        const countValue = Number(debouncedCount);

        if (!isNumber(countValue) || countValue < 1 || countValue > BULK_UUID_LIMIT) {
            setGeneratedUUIDs([]);
            return;
        }

        if (requiresNamespace) {
            if (!isNonEmptyString(debouncedName) || !isNonEmptyString(debouncedNamespace)) {
                setGeneratedUUIDs([]);
                return;
            }

            if (!isUUID(debouncedNamespace)) {
                setGeneratedUUIDs([]);
                return;
            }
        }

        try {
            setIsLoading(true);

            const generated = Array.from({ length: countValue }, (_, index) => {
                const position = index + 1;
                const currentName =
                    requiresNamespace && countValue > 1
                        ? `${debouncedName}-${position}`
                        : debouncedName;

                const result = requiresNamespace
                    ? uuid({
                          version,
                          uppercase,
                          name: currentName,
                          namespace: debouncedNamespace as $UUID,
                      })
                    : uuid({ version, uppercase });

                return {
                    uuid: result,
                    index: position,
                    version,
                    name: requiresNamespace ? currentName : null,
                    namespace: requiresNamespace ? (debouncedNamespace as $UUID) : null,
                };
            });

            setGeneratedUUIDs(generated);

            toast.success(`Generated ${generated.length} ${version} UUIDs`);
        } catch {
            setGeneratedUUIDs([]);
        } finally {
            setIsLoading(false);
        }
    }, [
        version,
        debouncedName,
        debouncedNamespace,
        debouncedCount,
        uppercase,
        requiresNamespace,
    ]);

    useEffect(() => {
        debounceAction(handleGenerateBulkUUIDs, 500)();
    }, [handleGenerateBulkUUIDs]);

    const handleResetGenerator = () => {
        generatorForm.reset({
            version: 'v4',
            name: '',
            namespace: '',
            uppercase: false,
            count: 10,
        });
    };

    const autoGenerateNamespace = () => {
        generatorForm.setValue('namespace', uuid(), { shouldValidate: true });
    };

    const handleExport = (format: 'csv' | 'txt' | 'json') => {
        if (!generatedUUIDs.length) return;

        const filename = `uuid-batch-${Date.now()}.${format}`;

        if (format === 'txt') {
            const content = generatedUUIDs.map((item) => item.uuid).join('\n');
            triggerDownload(content, filename, 'text/plain;charset=utf-8');
            toast.success('Exported UUID batch as TXT');
            return;
        }

        if (format === 'csv') {
            const rows = generatedUUIDs.map((item) =>
                [
                    item.index,
                    escapeCsvValue(item.uuid),
                    escapeCsvValue(item.version),
                    escapeCsvValue(String(uppercase)),
                    escapeCsvValue(item.name ?? ''),
                    escapeCsvValue(item.namespace ?? ''),
                ].join(',')
            );

            const content = ['index,uuid,version,uppercase,name,namespace', ...rows].join('\n');

            triggerDownload(content, filename, 'text/csv;charset=utf-8');
            toast.success('Exported UUID batch as CSV');
            return;
        }

        const content = JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                version,
                uppercase,
                count: generatedUUIDs.length,
                items: generatedUUIDs,
            },
            null,
            2
        );

        triggerDownload(content, filename, 'application/json;charset=utf-8');
        toast.success('Exported UUID batch as JSON');
    };

    return useMount(
        <div className="grid gap-6 xl:grid-cols-2">
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserKey className="size-4" />
                        Bulk UUID Generator
                    </CardTitle>
                    <CardDescription>
                        Generate a batch of UUIDs and export them as CSV, TXT, or JSON.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...generatorForm}>
                        <form
                            className="space-y-6"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <FormField
                                    control={generatorForm.control}
                                    name="version"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Badge className="pr-0.5 gap-2" variant="outline">
                                                <FormLabel>UUID Version</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a UUID version" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {UUID_VERSIONS.map((ver) => (
                                                            <SelectItem key={ver} value={ver}>
                                                                {ver.toUpperCase()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </Badge>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={generatorForm.control}
                                    name="uppercase"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center">
                                            <Badge
                                                className="px-4 py-3 gap-2"
                                                variant="outline"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="mt-0 cursor-pointer">
                                                    Uppercase
                                                </FormLabel>
                                            </Badge>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={generatorForm.control}
                                name="count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bulk Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                max={BULK_UUID_LIMIT}
                                                min={1}
                                                onChange={(event) => {
                                                    const value = event.target.valueAsNumber;

                                                    field.onChange(
                                                        Number.isNaN(value) ? 1 : value
                                                    );
                                                }}
                                                placeholder="10"
                                                step={1}
                                                type="number"
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Generate between 1 and {BULK_UUID_LIMIT} UUIDs at
                                            once.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {requiresNamespace && (
                                <Fragment>
                                    <FormField
                                        control={generatorForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter a base name (e.g., 'user-123')"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Required for {version} UUID generation. When
                                                    generating multiple UUIDs, a numeric suffix
                                                    is appended to keep each one unique.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={generatorForm.control}
                                        name="namespace"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Namespace UUID</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Paste a UUID or auto-generate"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Required for {version} UUID generation.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        onClick={autoGenerateNamespace}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        <RefreshCw className="size-4" />
                                        Auto-generate Namespace
                                    </Button>
                                </Fragment>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    disabled={!generatedUUIDs.length}
                                    onClick={debounceAction(handleGenerateBulkUUIDs, 300)}
                                    type="button"
                                >
                                    <UserKey className="size-4 mb-0.5" />
                                    Generate Another Batch
                                </Button>
                                <Button
                                    onClick={handleResetGenerator}
                                    type="button"
                                    variant="outline"
                                >
                                    <RefreshCw className="size-4 mb-0.5" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card
                className={cn(
                    'h-fit',
                    generatedUUIDs.length
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-dashed bg-muted/20'
                )}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserKey
                            className={cn('size-5', {
                                'size-5 text-blue-600 dark:text-blue-400':
                                    generatedUUIDs.length > 0,
                            })}
                        />
                        {generatedUUIDs.length
                            ? `Bulk UUIDs (${generatedUUIDs.length})`
                            : 'Bulk UUIDs'}
                    </CardTitle>
                    <CardDescription>
                        {generatedUUIDs.length
                            ? 'Copy each UUID individually or export the batch in your preferred format.'
                            : 'Your generated batch will appear here and stay on the right side.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && !generatedUUIDs.length ? (
                        <Loading />
                    ) : generatedUUIDs.length ? (
                        <Fragment>
                            <div className="flex flex-wrap items-center gap-2 select-none">
                                <Badge variant="outline">{generatedUUIDs.length} items</Badge>
                                <Badge variant="outline">{version.toUpperCase()}</Badge>
                                <Badge variant="outline">
                                    {uppercase ? 'Uppercase' : 'Lowercase'}
                                </Badge>
                                {requiresNamespace && (
                                    <Badge variant="outline">Name-based batch</Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => handleExport('csv')}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    <Sheet className="size-3 mb-0.5" />
                                    CSV
                                </Button>
                                <Button
                                    onClick={() => handleExport('txt')}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    <FileText className="size-3 mb-0.5" />
                                    TXT
                                </Button>
                                <Button
                                    onClick={() => handleExport('json')}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    <FileJson className="size-3 mb-0.5" />
                                    JSON
                                </Button>
                            </div>

                            <ScrollArea className="h-100 rounded-xl border border-border/60 bg-background/70">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16 text-center">
                                                #
                                            </TableHead>
                                            <TableHead>UUID</TableHead>
                                            <TableHead className="w-20 text-center">
                                                Copy
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {generatedUUIDs.map((item) => (
                                            <TableRow key={item.index}>
                                                <TableCell className="font-medium text-center text-muted-foreground">
                                                    {item.index}
                                                </TableCell>
                                                <TableCell className="font-cascadia whitespace-normal break-all text-xs">
                                                    {item.uuid}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <CopyButton
                                                        buttonProps={{
                                                            'aria-label': `Copy UUID ${item.index}`,
                                                        }}
                                                        size="icon-sm"
                                                        successMsg={`UUID ${item.index} copied to clipboard!`}
                                                        textToCopy={item.uuid}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </Fragment>
                    ) : (
                        <EmptyData
                            className="border-muted-foreground/20 bg-background/60"
                            description="Generate a batch on the left, then copy individual UUIDs or export the full list as CSV, TXT, or JSON."
                            Icon={Key}
                            title="No batch generated yet"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
