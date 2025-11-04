import type { LucideProps } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconType = React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

/**
 * Describes the props for FloatingButton component.
 */
export type FloatingButtonProps = {
    /** The icon to render. */
    icon?: IconType;
    /** Optional label to show next to the icon. If omitted, the button will render icon-only. */
    label?: string;
    /** Shape of the button. */
    shape?: 'circle' | 'square';
    /** Size of the button. */
    size?: 'sm' | 'md' | 'lg';
    /** Visual variant mapped to shadcn Button variants (mapped inside). */
    variant?: 'default' | 'link' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    /** Position on the viewport. */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Click handler. */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** Additional tailwind classes applied to the wrapper. */
    className?: string;
    /** If true, show label even on small sizes (useful when you want text visible). */
    showLabel?: boolean;
};

function sizeClasses(size: FloatingButtonProps['size']) {
    switch (size) {
        case 'sm':
            return 'h-9 px-2 text-sm';
        case 'lg':
            return 'h-14 px-4 text-lg';
        default:
            return 'h-11 px-3 text-base';
    }
}

function shapeClasses(shape: FloatingButtonProps['shape']) {
    switch (shape) {
        // case 'pill':
        // 	return 'rounded-full';
        case 'square':
            return 'rounded-md';
        default:
            return 'rounded-full'; // circle visual via equal height/width
    }
}

function positionClasses(position: FloatingButtonProps['position']) {
    switch (position) {
        case 'bottom-left':
            return 'left-6 bottom-6';
        case 'top-right':
            return 'right-6 top-6';
        case 'top-left':
            return 'left-6 top-6';
        default:
            return 'right-6 bottom-6'; // bottom-right
    }
}

/**
 * FloatingButton component — a versatile FAB built with shadcn Button and lucide-react icons.
 *
 * JSDoc here is descriptive only — TypeScript types are the source of truth.
 */
export default function FloatingButton({
    icon: Icon,
    label,
    shape = 'circle',
    size = 'md',
    variant = 'default',
    position = 'bottom-right',
    onClick,
    className = '',
    showLabel = false,
}: FloatingButtonProps) {
    const isIconOnly = !label && !showLabel;

    const baseWrapper = cn(`fixed z-50`, className, positionClasses(position));

    const btnSize = sizeClasses(size);
    const btnShape = shapeClasses(shape);

    const ariaLabel = label ?? (Icon ? 'floating action' : 'button');

    return (
        <div className={baseWrapper} style={{ pointerEvents: 'auto' }} suppressHydrationWarning>
            <Button
                aria-label={ariaLabel}
                className={cn(
                    `shadow-xl transition-transform duration-150 hover:scale-105 focus:scale-100 flex items-center gap-2`,
                    btnSize,
                    btnShape
                )}
                onClick={onClick}
                variant={variant}
            >
                {/* Icon */}
                {Icon ? <Icon className={cn(`size-5`, { 'mx-auto': isIconOnly })} /> : null}

                {/* Label (optional) */}
                {!isIconOnly ? (
                    <span className="whitespace-nowrap font-medium">{label}</span>
                ) : null}
            </Button>
        </div>
    );
}
