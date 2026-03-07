'use client';

import { type ExternalToast, toast } from 'sonner';
import SmartAlert from '@/components/misc/smart-alert';
import { Button, type ButtonProps } from '@/components/ui/button';

type Options = {
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    confirmButtonVariant?: ButtonProps['variant'];
    cancelButtonVariant?: ButtonProps['variant'];
    buttonSize?: ButtonProps['size'];
    toastOptions?: ExternalToast;
    isLoading?: boolean;
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
        isLoading,
    } = options;

    toast.custom(
        (toastId) => (
            <div className="rounded-lg border bg-background p-4 shadow-lg space-y-3">
                <SmartAlert description={description} title={title} />

                <div className="flex gap-2 justify-end">
                    <Button
                        loading={isLoading}
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
