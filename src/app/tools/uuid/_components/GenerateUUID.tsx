'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Key, RefreshCw, RotateCcwKey } from 'lucide-react';
import { useDebouncedValue, useMount } from 'nhb-hooks';
import { debounceAction, isNonEmptyString } from 'nhb-toolbox';
import { isUUID, uuid } from 'nhb-toolbox/hash';
import type { $UUID } from 'nhb-toolbox/hash/types';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodeBlock from '@/components/misc/code-block';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UUID_VERSIONS } from '@/lib/constants';

const UUIDGeneratorSchema = z
    .object({
        version: z.enum(UUID_VERSIONS),
        name: z.string(),
        namespace: z.string(),
        uppercase: z.boolean(),
    })
    .superRefine(({ version, name, namespace }, ctx) => {
        if (version === 'v3' || version === 'v5') {
            if (!isNonEmptyString(name)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `Name is required for ${version} UUIDs`,
                    path: ['name'],
                });
            }

            if (!isNonEmptyString(namespace)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `Namespace is required for ${version} UUIDs`,
                    path: ['namespace'],
                });
            }

            if (isNonEmptyString(namespace) && !isUUID(namespace)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Namespace must be a valid UUID',
                    path: ['namespace'],
                });
            }
        }
    });

type UUIDGeneratorFormValues = z.infer<typeof UUIDGeneratorSchema>;

type GeneratedUUID = {
    uuid: $UUID;
    version: string;
} | null;

export default function GenerateUUID() {
    const [generatedUUID, setGeneratedUUID] = useState<GeneratedUUID>(null);

    const generatorForm = useForm<UUIDGeneratorFormValues>({
        resolver: zodResolver(UUIDGeneratorSchema),
        mode: 'onChange',
        defaultValues: {
            version: 'v4',
            name: '',
            namespace: '',
            uppercase: false,
        },
    });

    const version = generatorForm.watch('version');
    const uppercase = generatorForm.watch('uppercase');

    const [debouncedName] = useDebouncedValue(generatorForm.watch('name'), 500);
    const [debouncedNamespace] = useDebouncedValue(generatorForm.watch('namespace'), 500);

    const requiresNamespace = version === 'v3' || version === 'v5';

    const handleGenerateNew = useCallback(() => {
        if (requiresNamespace) {
            if (!isNonEmptyString(debouncedName) || !isNonEmptyString(debouncedNamespace)) {
                setGeneratedUUID(null);
            }
            if (!isUUID(debouncedNamespace)) {
                setGeneratedUUID(null);
            }
        }

        try {
            let result: $UUID;

            if (requiresNamespace) {
                result = uuid({
                    version,
                    uppercase,
                    name: debouncedName,
                    namespace: debouncedNamespace as $UUID,
                });
            } else {
                result = uuid({ version, uppercase });
            }

            setGeneratedUUID({ uuid: result, version });

            toast.success(`Generated new ${version} UUID`);
        } catch {
            setGeneratedUUID(null);
        }
    }, [version, debouncedName, debouncedNamespace, uppercase, requiresNamespace]);

    useEffect(() => {
        debounceAction(handleGenerateNew, 500)();
    }, [handleGenerateNew]);

    const handleResetGenerator = () => {
        generatorForm.reset({
            version: 'v4',
            name: '',
            namespace: '',
            uppercase: false,
        });
    };

    const autoGenerateNamespace = () => {
        generatorForm.setValue('namespace', uuid(), { shouldValidate: true });
    };

    return useMount(
        <div className="grid gap-6 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RotateCcwKey className="size-5" />
                        Generate UUID
                    </CardTitle>
                    <CardDescription>
                        Create a new UUID with your preferred version
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...generatorForm}>
                        <form
                            className="space-y-6"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <div className="flex flex-wrap items-center gap-4 justify-between">
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
                                                        placeholder="Enter a name (e.g., 'user-123')"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Required for {version} UUID generation
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
                                                    Required for {version} UUID generation
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
                                {requiresNamespace || (
                                    <Button
                                        disabled={!generatedUUID}
                                        onClick={debounceAction(handleGenerateNew, 300)}
                                        type="button"
                                    >
                                        <RotateCcwKey className="size-4" />
                                        Generate Another
                                    </Button>
                                )}
                                <Button
                                    onClick={handleResetGenerator}
                                    type="button"
                                    variant="outline"
                                >
                                    <RefreshCw className="size-4" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Generated UUID Display */}
            <Card
                className={
                    generatedUUID
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-dashed bg-muted/20'
                }
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key
                            className={
                                generatedUUID
                                    ? 'size-5 text-green-600 dark:text-green-400'
                                    : 'size-5'
                            }
                        />
                        {generatedUUID
                            ? `Generated UUID (${generatedUUID.version.toUpperCase()})`
                            : 'Generated UUID'}
                    </CardTitle>
                    <CardDescription>
                        {generatedUUID
                            ? 'Copy the generated UUID or create another one from the form on the left.'
                            : 'Your generated UUID will appear here once the form is ready.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {generatedUUID ? (
                        <Fragment>
                            <CodeBlock className="text-base py-3 px-4">
                                {generatedUUID.uuid}
                            </CodeBlock>
                            <div className="flex flex-wrap gap-2">
                                <CopyButton
                                    buttonText={{ after: 'UUID Copied', before: 'Copy UUID' }}
                                    successMsg="UUID copied to clipboard!"
                                    textToCopy={generatedUUID.uuid}
                                />
                            </div>
                        </Fragment>
                    ) : (
                        <EmptyData
                            className="border-muted-foreground/20 bg-background/60"
                            description="Keep typing on the left and the result will stay anchored in this panel."
                            Icon={Key}
                            title="No UUID generated yet"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
