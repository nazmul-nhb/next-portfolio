import type { Tooltip as TooltipPrimitive } from 'radix-ui';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SmartTooltipProps
    extends Omit<
        React.ComponentProps<typeof TooltipPrimitive.Content>,
        'children' | 'className' | 'content'
    > {
    trigger: React.ReactNode;
    content: React.ReactNode;
    className?: string;
}

export default function SmartTooltip({
    trigger,
    content,
    className,
    ...props
}: SmartTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent className={cn(className)} {...props}>
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
