'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Binary, TextCursorInput } from 'lucide-react';
import { isNonEmptyString } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { Cipher } from 'nhb-toolbox/hash';
import { Fragment, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CodeBlock from '@/components/misc/code-block';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
import ShareButton from '@/components/misc/share-button';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { hasErrorMessage } from '@/lib/utils';

const MODE = ['encrypt', 'decrypt'] as const;

const EncryptionSchema = z.object({
    input: z.string().min(1, 'Text cannot be empty'),
    passphrase: z.string().min(1, 'Passphrase cannot be empty'),
    mode: z.enum(MODE),
});

type EncryptionFormValues = z.infer<typeof EncryptionSchema>;

export default function EncryptMessage() {
    const form = useForm<EncryptionFormValues>({
        resolver: zodResolver(EncryptionSchema),
        mode: 'onChange',
        defaultValues: {
            input: '',
            passphrase: '',
            mode: 'encrypt',
        },
    });

    const input = form.watch('input');
    const passphrase = form.watch('passphrase');
    const mode = form.watch('mode');

    const encryptionState = useMemo(() => {
        if (!isNonEmptyString(passphrase)) {
            return {
                output: null,
                error: null,
            };
        }
        if (!isNonEmptyString(input)) {
            return {
                output: null,
                error: null,
            };
        }

        try {
            const cipher = new Cipher(passphrase);

            const result = cipher[mode](input);

            return {
                output: result,
                error: null,
            };
        } catch (error) {
            return {
                output: null,
                error: hasErrorMessage(error)
                    ? error.message
                    : 'There is something wrong with your passphrase or input!',
            };
        }
    }, [passphrase, input, mode]);

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-start gap-2 flex-wrap justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Encrypt/decrypt Message
                    </h1>
                    <ShareButton
                        buttonLabel="Share this tool"
                        route="/tools/encrypt-message"
                        shareText="Encrypt/decrypt Message"
                    />
                </div>
                <p className="max-w-3xl mt-2 text-sm text-muted-foreground">
                    Encrypt or decrypt text using a passphrase. The same passphrase used for
                    encryption must be used again to decrypt the message.
                </p>
            </div>

            <SmartAlert
                className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100"
                description={
                    <Fragment>
                        <ol className="list-decimal ml-6">
                            <li>Choose Encrypt or Decrypt mode.</li>
                            <li>Enter a passphrase (this acts as the encryption key)</li>
                            <li>
                                Paste or type your message. The result is generated instantly.
                            </li>
                        </ol>
                        <strong>
                            To decrypt a message, you must use the same passphrase that was used
                            to encrypt it. If the passphrase is incorrect, the message cannot be
                            recovered.
                        </strong>
                    </Fragment>
                }
                title="How it works"
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TextCursorInput className="size-5" />
                            Text to {toTitleCase(mode)}
                        </CardTitle>
                        <CardDescription>
                            Provide the {mode === 'decrypt' ? 'encrypted' : 'text'} message to{' '}
                            {mode}.
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
                                        name="mode"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>Mode</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select source format" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {MODE.map((option) => (
                                                            <SelectItem
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {toTitleCase(option)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    <SmartAlert
                                                        description={
                                                            <span>
                                                                {mode === 'decrypt'
                                                                    ? 'Restore the original message using the same passphrase.'
                                                                    : 'Convert text into a protected encrypted message.'}
                                                            </span>
                                                        }
                                                    />
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="passphrase"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>Passphrase</FormLabel>
                                                <Input
                                                    className="resize-y font-cascadia"
                                                    placeholder={`Enter your passphrase to ${mode}`}
                                                    type="password"
                                                    {...field}
                                                />
                                                <FormDescription>
                                                    <SmartAlert
                                                        description={`Secret key used to ${mode} the
                                                    message. Keep it secure.`}
                                                    />
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="input"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Input</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-y font-cascadia"
                                                    placeholder={`${toTitleCase(mode)} your ${mode === 'decrypt' ? 'encrypted' : 'text'} message with provided passphrase`}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Paste or type your
                                                {mode === 'decrypt' ? ' encrypted ' : ' text '}
                                                message here. The result updates live.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    onClick={() => {
                                        form.reset();
                                    }}
                                    type="button"
                                    variant="outline"
                                >
                                    Reset Tool
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Binary className="size-5" />
                            {toTitleCase(mode)}ion Result
                        </CardTitle>
                        <CardDescription>
                            You can copy the result generated from your input and passphrase.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 select-none">
                            <Badge>{mode}</Badge>
                        </div>

                        {encryptionState.error ? (
                            <SmartAlert
                                description={encryptionState.error}
                                title={`${toTitleCase(mode)}ion Error`}
                                variant="destructive"
                            />
                        ) : encryptionState.output ? (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="flex flex-wrap gap-1 items-center justify-between select-none">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Output
                                    </span>
                                    <CopyButton
                                        buttonText={{
                                            after: 'Result Copied',
                                            before: 'Copy Result',
                                        }}
                                        successMsg="Result is copied to clipboard!"
                                        textToCopy={encryptionState.output}
                                    />
                                </div>
                                <CodeBlock className="mt-3 max-h-40 p-4 text-sm">
                                    {encryptionState.output}
                                </CodeBlock>
                            </div>
                        ) : (
                            <EmptyData
                                description={`Enter a passphrase and message to start ${mode}ing`}
                                Icon={Binary}
                                title={`Enter text to ${mode}`}
                            />
                        )}
                        <SmartAlert
                            className="bg-green-800/20"
                            description="All encryption/decryption happen locally in your browser. Your text and passphrase are never sent to a server."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
