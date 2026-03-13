import { motion } from 'framer-motion';
import { Diff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DiffResult } from '../_lib/diffUtils';
import { getCharacterDifferences } from '../_lib/diffUtils';

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
                <div className="max-h-[min(380px,calc(100vh-20rem))] overflow-y-auto overflow-x-hidden custom-scroll">
                    <div className="space-y-1 font-cascadia text-xs bg-muted/30 rounded-lg p-4">
                        {diffResult.lines.map((line, idx) => (
                            <motion.div
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    'flex items-start gap-2 py-1 px-2 rounded',
                                    'transition-colors duration-200',
                                    {
                                        'bg-green-500/10': line.type === 'added',
                                        'bg-red-500/10': line.type === 'removed',
                                        'bg-gray-600/10': line.type === 'unchanged',
                                        'bg-amber-500/10': line.type === 'modified',
                                    }
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                key={idx}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Type Indicator and Line Numbers */}
                                <div className="flex items-baseline gap-2 min-w-fit shrink-0">
                                    <div
                                        className={cn(
                                            'size-4 rounded-full flex items-center justify-center text-xs font-bold text-white',
                                            {
                                                'bg-green-500/25': line.type === 'added',
                                                'bg-red-500/25': line.type === 'removed',
                                                'bg-gray-600/25': line.type === 'unchanged',
                                                'bg-amber-600/25': line.type === 'modified',
                                            }
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
                                    {/* Line numbers */}
                                    <div className="text-xs text-muted-foreground text-right">
                                        {line.type !== 'added' ? (
                                            <span>{line.originalLineNum}</span>
                                        ) : (
                                            <span className="text-transparent">0</span>
                                        )}
                                        {line.type === 'modified' && (
                                            <span className="ml-1">→</span>
                                        )}
                                    </div>
                                    {line.type === 'modified' && (
                                        <div className="text-xs text-muted-foreground">
                                            <span>{line.modifiedLineNum}</span>
                                        </div>
                                    )}
                                    {(line.type === 'added' || line.type === 'unchanged') && (
                                        <div className="text-xs text-muted-foreground">
                                            <span>{line.modifiedLineNum}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 wrap-break-word">
                                    {line.type === 'added' && (
                                        <CharacterDiffDisplay
                                            color="green"
                                            isAdded
                                            modified={line.modified || ''}
                                            original=""
                                        />
                                    )}
                                    {line.type === 'removed' && (
                                        <CharacterDiffDisplay
                                            color="red"
                                            isRemoved
                                            modified=""
                                            original={line.original || ''}
                                        />
                                    )}
                                    {line.type === 'unchanged' && (
                                        <div className="text-muted-foreground">
                                            <span className="font-semibold">=</span>{' '}
                                            {line.original}
                                        </div>
                                    )}
                                    {line.type === 'modified' && (
                                        <CharacterDiffDisplay
                                            color="amber"
                                            modified={line.modified || ''}
                                            original={line.original || ''}
                                        />
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

interface CharacterDiffDisplayProps {
    original: string;
    modified: string;
    color: 'green' | 'red' | 'amber';
    isAdded?: boolean;
    isRemoved?: boolean;
}

function CharacterDiffDisplay({
    original,
    modified,
    color,
    isAdded,
    isRemoved,
}: CharacterDiffDisplayProps) {
    const charDiff = getCharacterDifferences(original, modified);

    const colorClasses = {
        green: 'text-green-700 dark:text-green-400',
        red: 'text-red-700 dark:text-red-400',
        amber: 'text-amber-700 dark:text-amber-400',
    };

    const highlightClasses = {
        green: 'bg-green-200/50 dark:bg-green-900/40 font-semibold',
        red: 'bg-red-200/50 dark:bg-red-900/40 font-semibold',
        amber: 'bg-amber-200/50 dark:bg-amber-900/40 font-semibold',
    };

    return (
        <div className={cn('space-y-1', colorClasses[color])}>
            {/* Show original text if not added */}
            {!isAdded && (
                <div>
                    <span className="font-semibold">{isRemoved ? '−' : '−'}</span>{' '}
                    {charDiff.original.length > 0 ? (
                        <span>
                            {charDiff.original.map((char, idx) => (
                                <span
                                    className={cn({
                                        [highlightClasses[color]]: char.highlighted,
                                    })}
                                    key={idx}
                                >
                                    {char.text}
                                </span>
                            ))}
                        </span>
                    ) : (
                        <span>-</span>
                    )}
                </div>
            )}

            {/* Show modified text if not removed */}
            {!isRemoved && (
                <div className={isAdded ? '' : 'ml-3'}>
                    <span className="font-semibold">+</span>{' '}
                    {charDiff.modified.length > 0 ? (
                        <span>
                            {charDiff.modified.map((char, idx) => (
                                <span
                                    className={cn({
                                        [highlightClasses[color]]: char.highlighted,
                                    })}
                                    key={idx}
                                >
                                    {char.text}
                                </span>
                            ))}
                        </span>
                    ) : (
                        <span>-</span>
                    )}
                </div>
            )}
        </div>
    );
}
