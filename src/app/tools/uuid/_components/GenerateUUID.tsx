'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Key, RefreshCw } from 'lucide-react';
import { useCopyText, useMount } from 'nhb-hooks';
import { isNonEmptyString } from 'nhb-toolbox';
import { isUUID, uuid } from 'nhb-toolbox/hash';
import type { $UUID } from 'nhb-toolbox/hash/types';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodeBlock from '@/components/misc/code-block';
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

const UUID_VERSIONS = ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'] as const;

const UUIDGeneratorSchema = z
    .object({
        version: z.enum(UUID_VERSIONS),
        name: z.string(),
        namespace: z.string(),
        uppercase: z.boolean(),
    })
    .superRefine(({ version, name, namespace }, ctx) => {
        if ((version === 'v3' || version === 'v5') && !isNonEmptyString(name)) {
            ctx.addIssue({
                code: 'custom',
                message: `Name is required for ${version} UUIDs`,
                path: ['name'],
            });
        }

        if ((version === 'v3' || version === 'v5') && !isNonEmptyString(namespace)) {
            ctx.addIssue({
                code: 'custom',
                message: `Namespace is required for ${version} UUIDs`,
                path: ['namespace'],
            });
        }

        if (
            (version === 'v3' || version === 'v5') &&
            isNonEmptyString(namespace) &&
            !isUUID(namespace)
        ) {
            ctx.addIssue({
                code: 'custom',
                message: 'Namespace must be a valid UUID',
                path: ['namespace'],
            });
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

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg: string) => toast.success(msg),
        onError: (msg: string) => toast.error(msg),
    });

    const version = generatorForm.watch('version');
    const name = generatorForm.watch('name');
    const namespace = generatorForm.watch('namespace');
    const uppercase = generatorForm.watch('uppercase');

    const requiresNamespace = version === 'v3' || version === 'v5';

    const handleGenerateNew = useCallback(() => {
        if (requiresNamespace) {
            if (!isNonEmptyString(name) || !isNonEmptyString(namespace)) {
                setGeneratedUUID(null);
            }
            if (!isUUID(namespace)) {
                setGeneratedUUID(null);
            }
        }

        try {
            let result: $UUID;

            if (requiresNamespace) {
                result = uuid({
                    version,
                    name,
                    namespace: namespace as $UUID,
                    uppercase,
                });
            } else {
                result = uuid({ version, uppercase });
            }

            setGeneratedUUID({
                uuid: result,
                version,
            });
        } catch {
            setGeneratedUUID(null);
        }
    }, [version, name, namespace, uppercase, requiresNamespace]);

    useEffect(() => {
        handleGenerateNew();
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
        generatorForm.setValue('namespace', uuid({ version: 'v4' }), { shouldValidate: true });
    };

    return useMount(
        <div className="grid gap-6 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="size-5" />
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

                                    {!isUUID(namespace) &&
                                    isNonEmptyString(namespace) ? null : (
                                        <Button
                                            onClick={autoGenerateNamespace}
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                        >
                                            <RefreshCw className="size-4 mr-2" />
                                            Auto-generate Namespace
                                        </Button>
                                    )}
                                </Fragment>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    disabled={!generatedUUID}
                                    onClick={handleGenerateNew}
                                    type="button"
                                >
                                    <Key className="size-4" />
                                    Generate Another
                                </Button>
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
            {generatedUUID && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="size-5 text-green-600 dark:text-green-400" />
                            Generated UUID ({generatedUUID.version.toUpperCase()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CodeBlock className="text-base py-3 px-4">
                            {generatedUUID.uuid}
                        </CodeBlock>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() =>
                                    copyToClipboard(
                                        generatedUUID.uuid,
                                        'UUID copied to clipboard!'
                                    )
                                }
                                size="sm"
                                variant="outline"
                            >
                                {copiedText === generatedUUID.uuid ? (
                                    <Fragment>
                                        <Check className="shrink-0 text-green-500" />
                                        <span className="text-green-500">UUID Copied</span>
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <Copy className="shrink-0" />
                                        Copy UUID
                                    </Fragment>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
