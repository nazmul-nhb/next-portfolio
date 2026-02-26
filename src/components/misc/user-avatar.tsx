import { User } from 'lucide-react';
import Image from 'next/image';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { Uncertain } from '@/types';

type AvatarProps = {
    image: Uncertain<string>;
    name: Uncertain<string>;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};
/** Reusable avatar component. */
export default function UserAvatar({ image, name, size = 'md', className }: AvatarProps) {
    const sizes = {
        sm: 'size-8',
        md: 'size-11',
        lg: 'size-14',
    };

    const pixels = { sm: 32, md: 44, lg: 56 };

    return image ? (
        <Image
            alt={name ?? 'User Avatar'}
            className={cn(sizes[size], 'shrink-0 rounded-full object-cover', className)}
            height={pixels[size]}
            src={buildCloudinaryUrl(image)}
            width={pixels[size]}
        />
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
