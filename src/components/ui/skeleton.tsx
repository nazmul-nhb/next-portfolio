import { cn } from '@/lib/utils';
import type { LooseLiteral } from 'nhb-toolbox/utils/types';

type SkeletonProps = React.ComponentProps<'div'>;

/** Base skeleton primitive — an animated shimmer block. */
function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-muted', className)}
            {...props}
        />
    );
}

/** A circular skeleton (avatar, profile image). */
function SkeletonCircle({
    size = 'md',
    className,
}: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}) {
    const sizes = {
        xs: 'size-6',
        sm: 'size-8',
        md: 'size-11',
        lg: 'size-14',
        xl: 'size-20',
    };

    return <Skeleton className={cn(sizes[size], 'shrink-0 rounded-full', className)} />;
}

/** A text-line skeleton. */
function SkeletonLine({
    width = 'full',
    height = 'sm',
    className,
}: {
    width?: LooseLiteral<'xs' | 'sm' | 'md' | 'lg' | 'full'>;
    height?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const widths: Record<string, string> = {
        xs: 'w-12',
        sm: 'w-24',
        md: 'w-40',
        lg: 'w-64',
        full: 'w-full',
    };

    const heights = {
        xs: 'h-2.5',
        sm: 'h-3.5',
        md: 'h-4',
        lg: 'h-5',
    };

    return (
        <Skeleton
            className={cn(
                heights[height],
                widths[width] ?? width,
                'rounded',
                className
            )}
        />
    );
}

/** Repeats a skeleton pattern `count` times. */
function SkeletonRepeat({
    count = 3,
    children,
    className,
}: {
    count?: number;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i}>{children}</div>
            ))}
        </div>
    );
}

/** A rectangular block skeleton (image placeholder, card). */
function SkeletonBlock({
    className,
    aspectRatio,
}: {
    className?: string;
    aspectRatio?: 'video' | 'square';
}) {
    const ratios = {
        video: 'aspect-video',
        square: 'aspect-square',
    };

    return (
        <Skeleton
            className={cn(
                'w-full',
                aspectRatio ? ratios[aspectRatio] : 'h-32',
                className
            )}
        />
    );
}

export { Skeleton, SkeletonBlock, SkeletonCircle, SkeletonLine, SkeletonRepeat };
