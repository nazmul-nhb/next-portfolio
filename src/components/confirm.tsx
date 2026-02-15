'use client';

import { InfoIcon } from 'lucide-react';
import { type ExternalToast, toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, type ButtonProps } from '@/components/ui/button';

type Options = {
    onConfirm: () => void;
    onCancel?: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    confirmButtonVariant?: ButtonProps['variant'];
    cancelButtonVariant?: ButtonProps['variant'];
    buttonSize?: ButtonProps['size'];
    toastOptions?: ExternalToast;
};

export function confirmToast(options: Options) {
    const {
        onCancel,
        onConfirm,
        title,
        cancelText = 'Cancel',
        confirmText = 'Confirm',
        description,
        toastOptions,
        cancelButtonVariant = 'outline',
        confirmButtonVariant = 'destructive',
        buttonSize = 'sm',
    } = options;

    toast.custom(
        (toastId) => (
            <div className="rounded-lg border bg-background p-4 shadow-lg space-y-3">
                <Alert>
                    <InfoIcon />
                    <AlertTitle>{title}</AlertTitle>
                    {description && <AlertDescription>{description}</AlertDescription>}
                </Alert>

                <div className="flex gap-2 justify-end">
                    <Button
                        onClick={() => {
                            onConfirm();
                            queueMicrotask(() => toast.dismiss(toastId));
                        }}
                        size={buttonSize}
                        variant={confirmButtonVariant}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        onClick={() => {
                            onCancel?.();
                            queueMicrotask(() => toast.dismiss(toastId));
                        }}
                        size={buttonSize}
                        variant={cancelButtonVariant}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        ),
        { duration: 5000, ...toastOptions }
    );
}
