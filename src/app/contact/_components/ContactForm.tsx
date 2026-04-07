'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApiMutation } from '@/lib/hooks/use-api';
import { hasErrorMessage } from '@/lib/utils';
import { ContactFormSchema } from '@/lib/zod-schema/messages';

type ContactFormValues = z.infer<typeof ContactFormSchema>;

/**
 * Contact form with validation and submission.
 */
export function ContactForm() {
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    });

    const { mutate: sendMessage, isPending } = useApiMutation('/api/contact', 'POST', {
        invalidateKeys: ['contact-messages', 'unread-messages'],
        onSuccess: () => setSubmitted(true),
        onError: (err) => {
            console.error('Error sending message:', err);
            setApiError(hasErrorMessage(err) ? err.message : 'Failed to send message');
        },
    });

    const onSubmit = (data: ContactFormValues) => {
        setApiError('');
        sendMessage(data);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="mb-8 size-12 text-green-500" />
                <h3 className="mb-8 text-xl font-semibold">Message Sent!</h3>
                <p className="text-muted-foreground mb-12">
                    Thanks for reaching out. I&apos;ll get back to you within 48 hours.
                </p>
                <Button
                    onClick={() => {
                        setSubmitted(false);
                        reset();
                    }}
                    size={'lg'}
                    variant="outline"
                >
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-5 flex-wrap sm:flex-row flex-col">
                <div className="flex-1">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        className="mt-1.5"
                        id="name"
                        placeholder="Your name"
                        {...register('name')}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>
                <div className="flex-1">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        className="mt-1.5"
                        id="email"
                        placeholder="you@example.com"
                        type="email"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                    className="mt-1.5"
                    id="subject"
                    placeholder="What's this about?"
                    {...register('subject')}
                />
                {errors.subject && (
                    <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    className="mt-1.5 min-h-32 max-h-48 overflow-y-auto custom-scroll"
                    id="message"
                    placeholder="Tell me about your project, idea, or just say hi..."
                    {...register('message')}
                />
                {errors.message && (
                    <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
                )}
            </div>

            {apiError && <p className="text-sm text-destructive">{apiError}</p>}

            <Button className="w-full" disabled={isPending} loading={isPending} type="submit">
                {!isPending && <Send className="mr-2 size-4" />}
                Send Message
            </Button>
        </form>
    );
}
