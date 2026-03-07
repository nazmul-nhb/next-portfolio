import { cn } from '@/lib/utils';
import type { ChildrenProp } from '@/types';

interface Props extends ChildrenProp {
    className?: string;
}

export default function CodeBlock({ children, className }: Props) {
    return (
        <code
            className={cn(
                'block max-w-full overflow-x-auto rounded-md bg-background px-3 py-2 font-cascadia text-xs',
                className
            )}
        >
            {children}
        </code>
    );
}
