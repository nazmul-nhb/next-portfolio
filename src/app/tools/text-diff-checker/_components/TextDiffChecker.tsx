'use client';

import { motion, type Variants } from 'framer-motion';
import { ArrowLeftRight, ChartSpline, Diff, Trash2 } from 'lucide-react';
import { useDebouncedValue, useMount } from 'nhb-hooks';
import { formatWithPlural } from 'nhb-toolbox';
import { useCallback, useMemo, useState } from 'react';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { computeTextDiff } from '../../../../lib/tools/text-diff';
import DiffViewer from './DiffViewer';

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
};

export default function TextDiffChecker() {
    const [originalText, setOriginalText] = useState('');
    const [modifiedText, setModifiedText] = useState('');
    const [debouncedOriginal] = useDebouncedValue(originalText, 400);
    const [debouncedModified] = useDebouncedValue(modifiedText, 400);

    const diffResult = useMemo(() => {
        return computeTextDiff(debouncedOriginal, debouncedModified);
    }, [debouncedOriginal, debouncedModified]);

    const handleClearAll = () => {
        setOriginalText('');
        setModifiedText('');
    };

    const handleSwap = useCallback(() => {
        const temp = originalText;
        setOriginalText(modifiedText);
        setModifiedText(temp);
    }, [originalText, modifiedText]);

    const hasDifferences =
        diffResult.stats.linesAdded > 0 ||
        diffResult.stats.linesRemoved > 0 ||
        diffResult.stats.linesChanged > 0;

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Compare two texts and view detailed differences with line-by-line highlighting."
                route="/tools/text-diff-checker"
                title="Text Diff Checker"
            />

            {/* Input Section */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    {/* Original Text */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Original Text</span>
                                <Badge variant="outline">
                                    {formatWithPlural(originalText.split('\n').length, 'line')}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Paste the original or first version here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="w-full min-h-32 max-h-40 overflow-y-auto custom-scroll font-cascadia text-sm"
                                onChange={(e) => setOriginalText(e.target.value)}
                                placeholder="Enter original text..."
                                value={originalText}
                            />
                        </CardContent>
                    </Card>

                    {/* Modified Text */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Modified Text</span>
                                <Badge variant="outline">
                                    {formatWithPlural(modifiedText.split('\n').length, 'line')}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Paste the modified or second version here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="w-full min-h-32 max-h-40 overflow-y-auto custom-scroll font-cascadia text-sm"
                                onChange={(e) => setModifiedText(e.target.value)}
                                placeholder="Enter modified text..."
                                value={modifiedText}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={handleSwap} size="sm" variant="outline">
                                    <ArrowLeftRight className="size-4" />
                                    Swap
                                </Button>
                                <Button
                                    onClick={handleClearAll}
                                    size="sm"
                                    variant="destructive"
                                >
                                    <Trash2 className="size-4" />
                                    Clear All
                                </Button>
                                {hasDifferences && (
                                    <CopyButton
                                        buttonText={{ before: 'Copy Both', after: 'Copied' }}
                                        size="sm"
                                        textToCopy={`Original:\n${originalText}\n\nModified:\n${modifiedText}`}
                                        variant="outline"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Diff Viewer Section */}
                {originalText || modifiedText ? (
                    <motion.div
                        animate="visible"
                        initial="hidden"
                        transition={{ duration: 0.4 }}
                        variants={itemVariants}
                    >
                        {/* Diff View */}
                        <DiffViewer diffResult={diffResult} />

                        {/* Stats Card */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ChartSpline className="size-4" />
                                    Diff Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    animate="visible"
                                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                                    initial="hidden"
                                    variants={containerVariants}
                                >
                                    <motion.div
                                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        variants={itemVariants}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Unchanged
                                        </p>
                                        <Badge
                                            className="font-cascadia bg-gray-600"
                                            variant="default"
                                        >
                                            {diffResult.stats.linesUnchanged}
                                        </Badge>
                                    </motion.div>

                                    <motion.div
                                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        variants={itemVariants}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Changed
                                        </p>
                                        <Badge
                                            className="font-cascadia bg-amber-600"
                                            variant="default"
                                        >
                                            {diffResult.stats.linesChanged}
                                        </Badge>
                                    </motion.div>

                                    <motion.div
                                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        variants={itemVariants}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Added
                                        </p>
                                        <Badge
                                            className="font-cascadia bg-green-600"
                                            variant="default"
                                        >
                                            {diffResult.stats.linesAdded}
                                        </Badge>
                                    </motion.div>

                                    <motion.div
                                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        variants={itemVariants}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Removed
                                        </p>
                                        <Badge
                                            className="font-cascadia bg-red-600"
                                            variant="default"
                                        >
                                            {diffResult.stats.linesRemoved}
                                        </Badge>
                                    </motion.div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <EmptyData
                        description="Enter text in both areas to see the diff comparison."
                        Icon={Diff}
                        title="Nothing to compare"
                    />
                )}
            </div>
        </div>
    );
}
