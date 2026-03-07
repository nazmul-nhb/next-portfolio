'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftRight, Binary, Check, Copy, TextCursorInput } from 'lucide-react';
import { useCopyText } from 'nhb-hooks';
import { TextCodec } from 'nhb-toolbox/hash';
import { Fragment, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { hasErrorMessage } from '@/lib/utils';

const FORMAT_OPTIONS = [
    {
        value: 'utf8',
        label: 'UTF-8 Text',
        placeholder: 'Type or paste UTF-8 text here...',
        description:
            'Plain text input. Every Unicode character is preserved through UTF-8 bytes.',
    },
    {
        value: 'hex',
        label: 'Hex',
        placeholder: 'Example: 48 65 6c 6c 6f',
        description: 'Accepts spaced or continuous hexadecimal bytes.',
    },
    {
        value: 'binary',
        label: 'Binary',
        placeholder: 'Example: 01001000 01100101 01101100 01101100 01101111',
        description: 'Accepts spaced or continuous binary bytes.',
    },
    {
        value: 'base64',
        label: 'Base64',
        placeholder: 'Example: SGVsbG8=',
        description: 'Standard Base64 input with or without padding characters.',
    },
] as const;

const FORMAT_VALUES = ['utf8', 'hex', 'binary', 'base64'] as const;

type EncodingFormat = (typeof FORMAT_VALUES)[number];
type ConversionMethod =
    | 'base64ToBinary'
    | 'base64ToHex'
    | 'base64ToUtf8'
    | 'binaryToBase64'
    | 'binaryToHex'
    | 'binaryToUtf8'
    | 'hexToBase64'
    | 'hexToBinary'
    | 'hexToUtf8'
    | 'utf8ToBase64'
    | 'utf8ToBinary'
    | 'utf8ToHex';

type ConversionConfig = {
    method: ConversionMethod;
    convert: (value: string) => string;
};

const CONVERSION_MATRIX: Record<
    EncodingFormat,
    Partial<Record<EncodingFormat, ConversionConfig>>
> = {
    utf8: {
        hex: { method: 'utf8ToHex', convert: (value) => TextCodec.utf8ToHex(value) },
        binary: {
            method: 'utf8ToBinary',
            convert: (value) => TextCodec.utf8ToBinary(value),
        },
        base64: { method: 'utf8ToBase64', convert: (value) => TextCodec.utf8ToBase64(value) },
    },
    hex: {
        utf8: { method: 'hexToUtf8', convert: (value) => TextCodec.hexToUtf8(value) },
        binary: { method: 'hexToBinary', convert: (value) => TextCodec.hexToBinary(value) },
        base64: { method: 'hexToBase64', convert: (value) => TextCodec.hexToBase64(value) },
    },
    binary: {
        utf8: { method: 'binaryToUtf8', convert: (value) => TextCodec.binaryToUtf8(value) },
        hex: { method: 'binaryToHex', convert: (value) => TextCodec.binaryToHex(value) },
        base64: {
            method: 'binaryToBase64',
            convert: (value) => TextCodec.binaryToBase64(value),
        },
    },
    base64: {
        utf8: { method: 'base64ToUtf8', convert: (value) => TextCodec.base64ToUtf8(value) },
        hex: { method: 'base64ToHex', convert: (value) => TextCodec.base64ToHex(value) },
        binary: {
            method: 'base64ToBinary',
            convert: (value) => TextCodec.base64ToBinary(value),
        },
    },
};

function normalizeInput(source: EncodingFormat, value: string) {
    return source === 'utf8' ? value : value.trim();
}

function getValidationMessage(source: EncodingFormat, value: string) {
    if (!value) return null;

    if (source === 'hex' && !TextCodec.isValidHex(value)) {
        return 'Enter a valid hexadecimal byte string. Spaced and unspaced bytes are both accepted.';
    }

    if (source === 'binary' && !TextCodec.isValidBinary(value)) {
        return 'Enter a valid binary byte string. Use 8-bit bytes, with or without spaces.';
    }

    if (source === 'base64' && !TextCodec.isValidBase64(value)) {
        return 'Enter a valid Base64 string.';
    }

    return null;
}

function getFallbackTarget(source: EncodingFormat) {
    return FORMAT_VALUES.find((format) => format !== source) ?? 'hex';
}

const BaseConverterFormSchema = z
    .object({
        payload: z.string(),
        source: z.enum(FORMAT_VALUES),
        target: z.enum(FORMAT_VALUES),
    })
    .superRefine(({ payload, source, target }, ctx) => {
        const normalizedPayload = normalizeInput(source, payload);
        const validationMessage = getValidationMessage(source, normalizedPayload);

        if (source === target) {
            ctx.addIssue({
                code: 'custom',
                message: 'Choose a different output format.',
                path: ['target'],
            });
        }

        if (validationMessage) {
            ctx.addIssue({
                code: 'custom',
                message: validationMessage,
                path: ['payload'],
            });
        }
    });

type BaseConverterFormValues = z.infer<typeof BaseConverterFormSchema>;

type ConversionState = {
    output: string;
    method: ConversionMethod | null;
    error: string | null;
};

export default function BaseConverter() {
    const form = useForm<BaseConverterFormValues>({
        resolver: zodResolver(BaseConverterFormSchema),
        mode: 'onChange',
        defaultValues: {
            payload: '',
            source: 'utf8',
            target: 'hex',
        },
    });

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg),
    });

    const payload = form.watch('payload');
    const source = form.watch('source');
    const target = form.watch('target');

    const sourceOption =
        FORMAT_OPTIONS.find((option) => option.value === source) ?? FORMAT_OPTIONS[0];
    const targetOption =
        FORMAT_OPTIONS.find((option) => option.value === target) ?? FORMAT_OPTIONS[1];

    const conversionState: ConversionState = useMemo(() => {
        const normalizedPayload = normalizeInput(source, payload);

        if (!normalizedPayload) {
            return {
                output: '',
                method: null,
                error: null,
            };
        }

        const validationMessage = getValidationMessage(source, normalizedPayload);

        if (validationMessage) {
            return {
                output: '',
                method: null,
                error: validationMessage,
            };
        }

        if (source === target) {
            return {
                output: '',
                method: null,
                error: 'Choose a different output format.',
            };
        }

        const conversion = CONVERSION_MATRIX[source][target];

        if (!conversion) {
            return {
                output: '',
                method: null,
                error: 'This conversion path is not available.',
            };
        }

        try {
            return {
                output: conversion.convert(normalizedPayload),
                method: conversion.method,
                error: null,
            };
        } catch (error) {
            return {
                output: '',
                method: conversion.method,
                error: hasErrorMessage(error)
                    ? error.message
                    : 'Conversion failed. Please verify the source input format.',
            };
        }
    }, [payload, source, target]);

    return (
        <div className="space-y-8">
            <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight">Base Conversions</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Convert UTF-8 text, hex, binary, and Base64 with a single source input and
                    byte-level transformations underneath.
                </p>
            </div>

            <SmartAlert
                className="border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-100"
                description={
                    <p>
                        Hex and binary inputs may be spaced or unspaced. Output for hex and
                        binary conversions is returned in spaced byte groups.
                    </p>
                }
                title="Input Rules"
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TextCursorInput className="size-5" />
                            Source Payload
                        </CardTitle>
                        <CardDescription>
                            Provide the original content once, then switch the source and target
                            formats as needed.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form
                                className="space-y-6"
                                onSubmit={(event) => event.preventDefault()}
                            >
                                <div className="flex items-start flex-col flex-wrap gap-4 md:flex-row">
                                    <FormField
                                        control={form.control}
                                        name="source"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>From</FormLabel>
                                                <Select
                                                    onValueChange={(
                                                        nextSource: EncodingFormat
                                                    ) => {
                                                        field.onChange(nextSource);

                                                        if (
                                                            form.getValues('target') ===
                                                            nextSource
                                                        ) {
                                                            form.setValue(
                                                                'target',
                                                                getFallbackTarget(nextSource),
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldTouch: true,
                                                                    shouldValidate: true,
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select source format" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {FORMAT_OPTIONS.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    {sourceOption.description}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="target"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>To</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select target format" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {FORMAT_OPTIONS.map((option) => (
                                                            <SelectItem
                                                                disabled={
                                                                    option.value === source
                                                                }
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Convert the source payload into{' '}
                                                    {targetOption.label}.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="payload"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Input</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y font-cascadia"
                                                    placeholder={sourceOption.placeholder}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Paste the raw {sourceOption.label.toLowerCase()}{' '}
                                                payload here. The result updates live.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={() => {
                                            form.reset({
                                                payload: '',
                                                source: 'utf8',
                                                target: 'hex',
                                            });
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Reset Tool
                                    </Button>
                                    <Button
                                        disabled={
                                            !conversionState.output || !!conversionState.error
                                        }
                                        onClick={() => {
                                            const currentSource = form.getValues('source');
                                            const currentTarget = form.getValues('target');

                                            form.setValue('payload', conversionState.output, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            });
                                            form.setValue('source', currentTarget, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            });
                                            form.setValue('target', currentSource, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            });
                                        }}
                                        type="button"
                                        variant="secondary"
                                    >
                                        <ArrowLeftRight className="size-4" />
                                        Use Output as New Input
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Binary className="size-5" />
                            Conversion Result
                        </CardTitle>
                        <CardDescription>
                            Output is generated using the selected conversion paths.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 select-none">
                            <Badge variant="outline">{sourceOption.label}</Badge>
                            <Badge variant="outline">{targetOption.label}</Badge>
                            {conversionState.method && <Badge>{conversionState.method}</Badge>}
                        </div>

                        {conversionState.error ? (
                            <SmartAlert
                                description={conversionState.error}
                                title="Conversion Error"
                                variant="destructive"
                            />
                        ) : conversionState.output ? (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex flex-wrap gap-1 items-center justify-between select-none">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Output
                                    </span>
                                    <Button
                                        onClick={() => {
                                            copyToClipboard(
                                                conversionState.output,
                                                'Result is copied to clipboard!'
                                            );
                                        }}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        {copiedText ? (
                                            <Fragment>
                                                <Check className="shrink-0 text-green-500" />
                                                <span className="text-green-500">
                                                    Result Copied!
                                                </span>
                                            </Fragment>
                                        ) : (
                                            <Fragment>
                                                <Copy className="shrink-0" />
                                                Copy Result
                                            </Fragment>
                                        )}
                                    </Button>
                                </div>
                                <pre className="mt-3 max-w-full max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg bg-background p-4 text-sm font-cascadia">
                                    {conversionState.output}
                                </pre>
                            </div>
                        ) : (
                            <EmptyData
                                description="Enter a source payload and choose a conversion path to generate the transformed output."
                                Icon={Binary}
                                title="Enter text to convert"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
