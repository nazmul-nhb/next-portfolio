import { Star } from 'lucide-react';
import type { Numeric } from 'nhb-toolbox/types';
import { cn } from '@/lib/utils';

type Props = {
    rating: Numeric;
    totalStars?: number;
    className?: string;
    star?: {
        className?: string;
    };
};

export default function RatingStars({ rating, totalStars = 5, className, star }: Props) {
    return (
        <div className={cn('flex gap-1', className)}>
            {Array.from({ length: totalStars }).map((_, idx) => (
                <Star
                    className={cn(
                        `size-4`,
                        idx < +rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground',
                        star?.className
                    )}
                    key={idx}
                />
            ))}
        </div>
    );
}
