import { Check, Copy, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCopyText } from 'nhb-hooks';
import { isBrowser } from 'nhb-toolbox';
import { Fragment, useMemo, useState } from 'react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApiMutation } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
import type { BlogDetails } from '@/types/blogs';

type Props = {
    blog: BlogDetails;
};

export default function ReactionsShare({ blog }: Props) {
    const { profile } = useUserStore();
    const router = useRouter();
    const reactions = blog.reactions || {};
    const [likes, setLikes] = useState(new Set(reactions.like));
    const [dislikes, setDislikes] = useState(new Set(reactions.dislike));
    const [openPopup, setOpenPopup] = useState(false);

    const { mutate: reactToBlog } = useApiMutation<unknown, { type: 'like' | 'dislike' }>(
        `/api/blogs/${blog.slug}/react`,
        'POST',
        {
            invalidateKeys: ['blog', blog.slug],
            silentSuccessMessage: true,
            onError: (error) => console.error('Reaction failed:', error),
        }
    );

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg),
    });

    const sharableUrl = useMemo(() => (isBrowser() ? window.location.href : ''), []);

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharableUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setOpenPopup(false);
    };

    const handleShareWhatsApp = () => {
        const text = `${blog.title} by ${blog.author.name} - ${sharableUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setOpenPopup(false);
    };

    const handleCopyLink = () => {
        copyToClipboard(sharableUrl, 'Link copied to clipboard!', 'Failed to copy link');
    };

    const handleReact = (type: 'like' | 'dislike') => {
        if (!profile) {
            router.push(`/auth/login?redirectTo=/blogs/${blog.slug}`);
            return;
        }

        // Optimistically update UI
        if (type === 'like') {
            setLikes((prev) => {
                const next = new Set(prev);
                if (next.has(profile.id)) {
                    next.delete(profile.id);
                } else {
                    next.add(profile.id);
                    setDislikes((d) => {
                        const nd = new Set(d);
                        nd.delete(profile.id);
                        return nd;
                    });
                }
                return next;
            });
        }

        if (type === 'dislike') {
            setDislikes((prev) => {
                const next = new Set(prev);
                if (next.has(profile.id)) {
                    next.delete(profile.id);
                } else {
                    next.add(profile.id);
                    setLikes((l) => {
                        const nl = new Set(l);
                        nl.delete(profile.id);
                        return nl;
                    });
                }
                return next;
            });
        }

        reactToBlog({ type });
    };

    return (
        <FadeInUp delay={0.3}>
            <div className="mt-10 flex items-center gap-4 border-t border-border pt-6">
                <Button
                    className="gap-2"
                    onClick={() => handleReact('like')}
                    size="sm"
                    variant={profile && likes.has(profile.id) ? 'default' : 'outline'}
                >
                    <ThumbsUp className="h-4 w-4" />
                    {likes.size}
                </Button>
                <Button
                    className="gap-2"
                    onClick={() => handleReact('dislike')}
                    size="sm"
                    variant={profile && dislikes.has(profile.id) ? 'destructive' : 'outline'}
                >
                    <ThumbsDown className="h-4 w-4" />
                    {dislikes.size}
                </Button>

                <Popover modal onOpenChange={setOpenPopup} open={openPopup}>
                    <PopoverTrigger asChild>
                        <Button aria-label="Share this post" size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-3" sideOffset={8}>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Share this post
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
            </div>
        </FadeInUp>
    );
}
