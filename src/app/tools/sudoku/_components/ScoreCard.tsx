import type { ComponentType } from 'react';
import CodeBlock from '@/components/misc/code-block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    Icon: ComponentType<{ className: string }>;
    className?: string;
    title: string;
    score: number | string;
};

export default function ScoreCard({ className, Icon, score, title }: Props) {
    return (
        <Card
            className={cn(
                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                className
            )}
        >
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="size-4" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CodeBlock className="text-xl lg:text-2xl font-digital font-semibold text-blue-900 dark:text-blue-100">
                    {score}
                </CodeBlock>
            </CardContent>
        </Card>
    );
}
