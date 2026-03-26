/** biome-ignore-all lint/performance/noImgElement:img tag is needed for external images */

import { User } from 'lucide-react';
import Image from 'next/image';
import { getColorForInitial } from 'nhb-toolbox';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { Uncertain } from '@/types';

const sizes = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-11',
    lg: 'size-14',
} as const;

type AvatarProps = {
    image: Uncertain<string>;
    name: Uncertain<string>;
    size?: keyof typeof sizes;
    className?: string;
};

/** Reusable avatar component. */
export default function UserAvatar({ image, name, size = 'md', className }: AvatarProps) {
    const imgClasses = cn(sizes[size], 'shrink-0 rounded-full object-cover', className);

    return image ? (
        image.startsWith('http') ? (
            <img
                alt={name ?? 'User Avatar'}
                className={imgClasses}
                height={128}
                loading="eager"
                src={image}
                width={128}
            />
        ) : (
            <Image
                alt={name ?? 'User Avatar'}
                className={imgClasses}
                height={128}
                loading="eager"
                src={buildCloudinaryUrl(image)}
                width={128}
            />
        )
    ) : name ? (
        <div
            className={cn(
                sizes[size],
                'flex items-center justify-center select-none rounded-full text-sm font-bold text-white',
                className
            )}
            style={{
                backgroundColor: getColorForInitial(name),
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    ) : (
        <div
            className={cn(
                sizes[size],
                'flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
                className
            )}
        >
            <User className="size-1/2" />
        </div>
    );
}
