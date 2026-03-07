import type { ComponentType, ReactNode } from 'react';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type EmptyProps = {
    className?: string;
    Icon: ComponentType;
    title: ReactNode;
    description: ReactNode;
};

export default function EmptyData({ description, title, Icon, className }: EmptyProps) {
    return (
        <Empty className={cn('border border-dashed', className)}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
