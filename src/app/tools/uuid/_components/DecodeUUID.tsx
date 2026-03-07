'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, ListX, RefreshCw } from 'lucide-react';
import { useCopyText } from 'nhb-hooks';
import { isNonEmptyString } from 'nhb-toolbox';
import { decodeUUID, isUUID } from 'nhb-toolbox/hash';
import type { DecodedUUID } from 'nhb-toolbox/hash/types';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SmartAlert from '@/components/misc/smart-alert';
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

const DecodeUUIDSchema = z.object({
    uuidInput: z
        .string()
        .min(1, 'UUID cannot be empty')
        .superRefine((value, ctx) => {
            if (!isUUID(value)) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Enter a valid UUID format',
                });
            }
        }),
});

type DecodeUUIDFormValues = z.infer<typeof DecodeUUIDSchema>;

export default function DecodeUUID() {
    const decodeForm = useForm<DecodeUUIDFormValues>({
        resolver: zodResolver(DecodeUUIDSchema),
        mode: 'onChange',
        defaultValues: {
            uuidInput: '',
        },
    });

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg: string) => toast.success(msg),
        onError: (msg: string) => toast.error(msg),
    });

    const uuidInput = decodeForm.watch('uuidInput');

    const decodedInfo: DecodedUUID | null = useMemo(() => {
        if (!isNonEmptyString(uuidInput) || !isUUID(uuidInput)) {
            return null;
        }

        try {
            return decodeUUID(uuidInput);
        } catch {
            return null;
        }
    }, [uuidInput]);

    const handleResetDecoder = () => {
        decodeForm.reset({
            uuidInput: '',
        });
    };

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListX className="size-5" />
                        Decode UUID
                    </CardTitle>
                    <CardDescription>Analyze a UUID to view its components</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...decodeForm}>
                        <form
                            className="space-y-6"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <FormField
                                control={decodeForm.control}
                                name="uuidInput"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>UUID to Decode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Paste a UUID here" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter any valid UUID to inspect its structure
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                onClick={handleResetDecoder}
                                type="button"
                                variant="outline"
                            >
                                <RefreshCw className="size-4 mr-2" />
                                Reset
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {decodedInfo ? (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListX className="size-5 text-blue-600 dark:text-blue-400" />
                            UUID Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 text-sm">
                            <div className="border-b dark:border-gray-700 pb-3">
                                <div className="font-semibold text-gray-600 dark:text-gray-400">
                                    Original UUID
                                </div>
                                <div className="font-mono break-all mt-1 text-xs">
                                    {decodedInfo.raw}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-semibold text-gray-600 dark:text-gray-400">
                                        Version
                                    </div>
                                    <div className="font-mono mt-1">v{decodedInfo.version}</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-600 dark:text-gray-400">
                                        Variant
                                    </div>
                                    <div className="font-mono mt-1">{decodedInfo.variant}</div>
                                </div>
                            </div>

                            <div className="border-t dark:border-gray-700 pt-3">
                                <div className="font-semibold text-gray-600 dark:text-gray-400">
                                    Plain (No Hyphens)
                                </div>
                                <div className="font-mono break-all mt-1 text-xs">
                                    {decodedInfo.plain}
                                </div>
                            </div>

                            {decodedInfo.timestamp != null && (
                                <div className="border-t dark:border-gray-700 pt-3">
                                    <div className="font-semibold text-gray-600 dark:text-gray-400">
                                        Timestamp (Unix ms)
                                    </div>
                                    <div className="font-mono mt-1 text-xs">
                                        {decodedInfo.timestamp} (
                                        {new Date(decodedInfo.timestamp).toISOString()})
                                    </div>
                                </div>
                            )}

                            {decodedInfo.node != null && (
                                <div className="border-t dark:border-gray-700 pt-3">
                                    <div className="font-semibold text-gray-600 dark:text-gray-400">
                                        Node Identifier (v1)
                                    </div>
                                    <div className="font-mono mt-1 text-xs">
                                        {decodedInfo.node}
                                    </div>
                                </div>
                            )}

                            <div className="border-t dark:border-gray-700 pt-3">
                                <div className="font-semibold text-gray-600 dark:text-gray-400">
                                    BigInt Representation
                                </div>
                                <div className="font-mono text-xs mt-1 break-all">
                                    {decodedInfo.singleInt.toString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4">
                            <Button
                                onClick={() => copyToClipboard(decodedInfo.raw)}
                                size="sm"
                                variant="default"
                            >
                                <Copy className="size-4 mr-2" />
                                Copy UUID
                            </Button>
                            <Button
                                onClick={() => copyToClipboard(decodedInfo.plain)}
                                size="sm"
                                variant="outline"
                            >
                                <Copy className="size-4 mr-2" />
                                Copy Plain
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : uuidInput ? (
                <SmartAlert
                    description="The provided UUID format is invalid. Please check and try again."
                    title="Invalid UUID"
                    variant="destructive"
                />
            ) : null}
        </div>
    );
}
