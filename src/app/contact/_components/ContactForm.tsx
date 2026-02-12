'use client';

import { CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { httpRequest } from '@/lib/actions/baseRequest';

/**
 * Contact form with validation and submission.
 */
export function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await httpRequest('/api/contact', {
                method: 'POST',
                body: formData,
            });
            setSubmitted(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send message';
            setError(
                typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: string }).message)
                    : message
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
                <p className="text-muted-foreground">
                    Thanks for reaching out. I&apos;ll get back to you within 24-48 hours.
                </p>
                <Button
                    className="mt-6"
                    onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    variant="outline"
                >
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        className="mt-1.5"
                        id="name"
                        name="name"
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        value={formData.name}
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        className="mt-1.5"
                        id="email"
                        name="email"
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        type="email"
                        value={formData.email}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                    className="mt-1.5"
                    id="subject"
                    name="subject"
                    onChange={handleChange}
                    placeholder="What's this about?"
                    value={formData.subject}
                />
            </div>

            <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    className="mt-1.5 min-h-37.5 resize-y"
                    id="message"
                    name="message"
                    onChange={handleChange}
                    placeholder="Tell me about your project, idea, or just say hi..."
                    required
                    value={formData.message}
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button className="w-full" disabled={submitting} type="submit">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Sending...' : 'Send Message'}
            </Button>
        </form>
    );
}
