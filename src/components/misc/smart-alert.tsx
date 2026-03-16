import { Info } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    type AlertVariantProps,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Props extends AlertVariantProps {
    title?: ReactNode;
    description?: ReactNode;
    Icon?: ComponentType<{ className?: string }>;
    className?: string;
}

export default function SmartAlert({
    variant,
    Icon = Info,
    description,
    title,
    className,
}: Props) {
    return (
        <Alert className={cn('select-none', className)} variant={variant}>
            {Icon && <Icon />}
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && <AlertDescription>{description}</AlertDescription>}
        </Alert>
    );
}
