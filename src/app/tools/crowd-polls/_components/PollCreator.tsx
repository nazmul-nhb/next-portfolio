'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import type { GenericObject } from 'nhb-toolbox/object/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApiMutation } from '@/lib/hooks/use-api';
import { eliminateEmptyStrings } from '@/lib/utils';
import { CreatePollSchema } from '@/lib/zod-schema/polls';
import type { PollCreationResponse } from '@/types/polls';
import type { CreatePollFormData } from './types';

interface PollCreatorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PollCreator({ isOpen, onOpenChange }: PollCreatorProps) {
    const [optionCount, setOptionCount] = useState(2);

    const form = useForm({
        resolver: zodResolver(CreatePollSchema),
        defaultValues: {
            question: '',
            options: ['', ''],
            is_anonymous: false,
        },
    });

    const { mutate: createPoll, isPending } = useApiMutation<
        PollCreationResponse,
        CreatePollFormData
    >('/api/tools/polls', 'POST', {
        successMessage: 'Poll created successfully!',
        invalidateKeys: ['polls-list'],
        onSuccess: () => {
            form.reset();
            setOptionCount(2);
            onOpenChange(false);
        },
    });

    const handleAddOption = () => {
        if (optionCount < 10) {
            setOptionCount(optionCount + 1);
            const currentOptions = form.getValues('options');
            form.setValue('options', [...currentOptions, '']);
        }
    };

    const handleRemoveOption = (index: number) => {
        if (optionCount > 2) {
            setOptionCount(optionCount - 1);
            const currentOptions = form.getValues('options');
            form.setValue(
                'options',
                currentOptions.filter((_, i) => i !== index)
            );
        }
    };

    const onSubmit = (data: GenericObject) => {
        // Filter out empty options
        const filteredOptions = eliminateEmptyStrings(data.options);

        if (filteredOptions.length < 2) {
            toast.error('Please provide at least 2 options');
            return;
        }
        createPoll({
            question: data.question,
            options: filteredOptions,
            is_anonymous: data.is_anonymous,
            start_date: data.start_date,
            end_date: data.end_date,
        } as CreatePollFormData);
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={isOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDescription>
                        Ask a question and provide options for others to vote on
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="What would you like to ask?"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <FormLabel>Options</FormLabel>
                            {form.getValues('options').map((_, index) => (
                                <FormField
                                    control={form.control}
                                    key={index}
                                    name={`options.${index}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder={`Option ${index + 1}`}
                                                        {...field}
                                                    />
                                                    {optionCount > 2 && (
                                                        <Button
                                                            onClick={() =>
                                                                handleRemoveOption(index)
                                                            }
                                                            size="icon-lg"
                                                            type="button"
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                            {optionCount < 10 && (
                                <Button
                                    className="w-full"
                                    onClick={handleAddOption}
                                    size="lg"
                                    type="button"
                                    variant="outline"
                                >
                                    <Plus className="size-4 mb-0.5" />
                                    Add Option
                                </Button>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="is_anonymous"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer mt-0.5">
                                        Keep this poll anonymous
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                onClick={() => onOpenChange(false)}
                                type="button"
                                variant="destructive"
                            >
                                Cancel
                            </Button>
                            <Button disabled={isPending} loading={isPending} type="submit">
                                Create Poll
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
