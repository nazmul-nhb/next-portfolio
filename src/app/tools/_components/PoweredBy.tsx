import { ExternalLink } from 'lucide-react';
import CodeBlock from '@/components/misc/code-block';
import SmartAlert from '@/components/misc/smart-alert';
import { cn } from '@/lib/utils';

/**
 * Displays a small banner indicating which internal package powers a tool.
 */
type PoweredByProps = {
    /** Package or library name */
    name?: string;
    /** External URL to the package or repository */
    url: string;
    /** Short description explaining usage */
    description: string;
    className?: string;
};

export function PoweredBy({
    className,
    name = 'nhb-toolbox',
    url,
    description,
}: PoweredByProps) {
    return (
        <SmartAlert
            className={cn(
                'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
                className
            )}
            description={
                <div className="space-y-4">
                    <span>{description}</span>
                    <a
                        className="flex items-center w-fit gap-1 underline hover:opacity-80"
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <ExternalLink size={14} /> Learn more
                    </a>
                </div>
            }
            title={
                <span>
                    Powered by{' '}
                    <CodeBlock className="inline px-1.5 rounded-lg">{name}</CodeBlock>
                </span>
            }
        />
    );
}
