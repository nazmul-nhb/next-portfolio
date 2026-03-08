'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FadeInUp } from '@/components/misc/animations';
import ShareButton from '@/components/misc/share-button';
import { Button } from '@/components/ui/button';
import { useApiMutation } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
import type { BlogDetails } from '@/types/blogs';
import type { Route } from 'next';

type Props = {
    blog: BlogDetails;
};

export default function ReactionsShare({ blog }: Props) {
    const { profile } = useUserStore();
    const router = useRouter();
    const reactions = blog.reactions ?? { like: [], dislike: [] };
    const [likes, setLikes] = useState(new Set(reactions.like));
    const [dislikes, setDislikes] = useState(new Set(reactions.dislike));

    const { mutate: reactToBlog } = useApiMutation<unknown, { type: 'like' | 'dislike' }>(
        `/api/blogs/${blog.slug}/react`,
        'POST',
        {
            invalidateKeys: ['blog', blog.slug],
            silentSuccessMessage: true,
            onError: (error) => console.error('Reaction failed:', error),
        }
    );

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

                <ShareButton
                    route={`/blogs/${blog.slug}` as Route}
                    shareText={`${blog.title} by ${blog.author.name}`}
                />
            </div>
        </FadeInUp>
    );
}
