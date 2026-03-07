'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import type { Route } from 'next';
import { useCopyText, useMount } from 'nhb-hooks';
import { isBrowser } from 'nhb-toolbox';
import { Fragment, useMemo, useState } from 'react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { siteConfig } from '@/configs/site';
import { cn } from '@/lib/utils';

type Props = {
    /* The route to share, used to construct the sharable URL. Should be the path part of the URL (e.g., '/blogs/my-post'). */
    route: Route | `${Route}/${string | number}`;
    /* Optional text to include when sharing to WhatsApp. */
    shareText?: string;
    /* Optional label for the share button, used for accessibility. Defaults to 'Share this post'. */
    shareLabel?: string;
    /* Optional additional CSS classes for the share button icon. */
    className?: string;
    /* Whether to show the share icon on the button. Defaults to true. */
    showIcon?: boolean;
    /* Optional props to pass to the underlying Button component. */
    buttonProps?: ButtonProps;
    /* Optional label to display next to the share icon on the button. */
    buttonLabel?: React.ReactNode;
};

export default function ShareButton({
    shareText,
    className,
    showIcon = true,
    shareLabel = 'Share this post',
    buttonProps,
    buttonLabel,
    route,
}: Props) {
    const [openPopup, setOpenPopup] = useState(false);

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg),
    });

    const sharableUrl = useMemo(() => {
        return siteConfig.baseUrl
            ? siteConfig.baseUrl.concat(route)
            : isBrowser()
              ? window.location.href
              : '';
    }, [route]);

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharableUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setOpenPopup(false);
    };

    const handleShareWhatsApp = () => {
        const text = `${shareText} - ${sharableUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(shareText ? text : sharableUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setOpenPopup(false);
    };

    const handleCopyLink = () => {
        copyToClipboard(sharableUrl, 'Link copied to clipboard!', 'Failed to copy link');
    };

    return useMount(
        <Popover modal onOpenChange={setOpenPopup} open={openPopup}>
            <PopoverTrigger asChild>
                <Button aria-label={shareLabel} size="sm" variant="outline" {...buttonProps}>
                    {showIcon && <Share2 className={cn('size-4', className)} />}{' '}
                    {buttonLabel && buttonLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-3" sideOffset={8}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {shareLabel}
                </p>
                <div className="flex flex-col gap-1">
                    <button
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
                        onClick={handleShareFacebook}
                        type="button"
                    >
                        <FaFacebook className="size-5 shrink-0" />
                        Share on Facebook
                    </button>
                    <button
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#25D366]/10 hover:text-[#25D366]"
                        onClick={handleShareWhatsApp}
                        type="button"
                    >
                        <FaWhatsapp className="size-5 shrink-0" />
                        Share on WhatsApp
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        onClick={handleCopyLink}
                        type="button"
                    >
                        {copiedText ? (
                            <Fragment>
                                <Check className="size-5 shrink-0 text-green-500" />
                                <span className="text-green-500">Link Copied!</span>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <Copy className="size-5 shrink-0" />
                                Copy Link
                            </Fragment>
                        )}
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
