'use client';

import { Check, Copy } from 'lucide-react';
import { useCopyText } from 'nhb-hooks';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CopyProps = {
    textToCopy: string;
    successMsg?: string;
    className?: string;
    buttonText?: { before?: string; after?: string };
    buttonProps?: Omit<ButtonProps, 'className' | 'size' | 'variant'>;
    size?: ButtonProps['size'];
    variant?: ButtonProps['variant'];
};

export default function CopyButton(props: CopyProps) {
    const {
        textToCopy,
        buttonProps,
        buttonText,
        className,
        size = 'sm',
        variant = 'outline',
        successMsg = 'Successfully copied to clipboard!',
    } = props || {};

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg: string) => toast.success(msg),
        onError: (msg: string) => toast.error(msg),
    });

    return (
        <Button
            className={cn(className)}
            onClick={() => copyToClipboard(textToCopy, successMsg)}
            size={size}
            variant={variant}
            {...buttonProps}
        >
            {copiedText === textToCopy ? (
                <Fragment>
                    <Check className="shrink-0 text-green-500" />
                    {buttonText?.after && (
                        <span className="text-green-500">{buttonText?.after}</span>
                    )}
                </Fragment>
            ) : (
                <Fragment>
                    <Copy className="shrink-0" />
                    {buttonText?.before}
                </Fragment>
            )}
        </Button>
    );
}
