import { motion } from 'framer-motion';
import { Diff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DiffResult } from '../_lib/diffUtils';

interface DiffViewerProps {
    diffResult: DiffResult;
}

export default function DiffViewer({ diffResult }: DiffViewerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Diff className="size-4" />
                    Diff Preview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-150 overflow-y-auto overflow-x-hidden custom-scroll">
                    <div className="space-y-1 font-cascadia text-xs bg-muted/30 rounded-lg p-4">
                        {diffResult.lines.map((line, idx) => (
                            <motion.div
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    'flex items-start gap-2 py-1 px-2 rounded',
                                    'transition-colors duration-200',
                                    line.type === 'added' && 'bg-green-500/10',
                                    line.type === 'removed' && 'bg-red-500/10',
                                    line.type === 'unchanged' && 'hover:bg-muted/50',
                                    line.type === 'modified' && 'bg-amber-500/10'
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                key={idx}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Line Number and Type Indicator */}
                                <div className="flex items-baseline gap-2 min-w-fit shrink-0">
                                    <div
                                        className={cn(
                                            'size-4 rounded-full flex items-center justify-center text-xs font-bold text-white',
                                            line.type === 'added' && 'bg-green-600',
                                            line.type === 'removed' && 'bg-red-600',
                                            line.type === 'unchanged' && 'bg-gray-600',
                                            line.type === 'modified' && 'bg-amber-600'
                                        )}
                                    >
                                        {line.type === 'added'
                                            ? '+'
                                            : line.type === 'removed'
                                              ? '−'
                                              : line.type === 'modified'
                                                ? '~'
                                                : '='}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 wrap-break-word">
                                    {line.type === 'added' && (
                                        <div className="text-green-700 dark:text-green-400">
                                            <span className="font-semibold">+</span>{' '}
                                            {line.modified}
                                        </div>
                                    )}
                                    {line.type === 'removed' && (
                                        <div className="text-red-700 dark:text-red-400">
                                            <span className="font-semibold">−</span>{' '}
                                            {line.original}
                                        </div>
                                    )}
                                    {line.type === 'unchanged' && (
                                        <div className="text-muted-foreground">
                                            <span className="font-semibold">=</span>{' '}
                                            {line.original}
                                        </div>
                                    )}
                                    {line.type === 'modified' && (
                                        <div className="space-y-1">
                                            <div className="text-amber-700 dark:text-amber-400">
                                                <span className="font-semibold">−</span>{' '}
                                                {line.original}
                                            </div>
                                            <div className="text-amber-700 dark:text-amber-400 ml-3">
                                                <span className="font-semibold">+</span>{' '}
                                                {line.modified}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
