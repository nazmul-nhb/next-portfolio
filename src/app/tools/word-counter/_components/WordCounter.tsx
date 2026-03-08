'use client';

import { motion, type Variants } from 'framer-motion';
import { CaseSensitive, Pilcrow, TextWrap, Type, WholeWord } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { countWords, formatWithPlural, parseMSec, roundNumber } from 'nhb-toolbox';
import { type ChangeEvent, useMemo, useState } from 'react';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

const statVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

interface StatItem {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'teal' | 'amber';
}

export default function WordCounter() {
    const [inputText, setInputText] = useState('');

    const stats = useMemo(() => {
        const text = inputText.trim();
        const wordCnt = text ? countWords(text) : 0;
        const charCnt = inputText.length;
        const charCntNoSpace = inputText.replace(/\s/g, '').length;
        const paragraphs = text ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0;
        const sentences = text ? text.split(/[.!।?]+/).filter((s) => s.trim()).length : 0;
        const avgWordLength = wordCnt > 0 ? (charCntNoSpace / wordCnt).toFixed(1) : '0';
        const avgSentenceLength = sentences > 0 ? (wordCnt / sentences).toFixed(1) : '0';
        const readingTimeMins = wordCnt / 200;
        const readingTimeSecs = parseMSec(`${readingTimeMins}min`, true);

        return {
            words: wordCnt,
            characters: charCnt,
            charactersNoSpace: charCntNoSpace,
            paragraphs,
            sentences,
            avgWordLength: parseFloat(avgWordLength),
            avgSentenceLength: parseFloat(avgSentenceLength),
            readingTime: {
                value:
                    readingTimeMins < 1
                        ? roundNumber(readingTimeSecs)
                        : roundNumber(readingTimeMins),
                unit: readingTimeMins < 1 ? 'sec' : 'min',
            },
        };
    }, [inputText]);

    const statItems: StatItem[] = [
        {
            label: 'Characters',
            value: stats.characters,
            icon: <CaseSensitive />,
            color: 'blue',
        },
        {
            label: 'Words',
            value: stats.words,
            icon: <WholeWord />,
            color: 'emerald',
        },
        { label: 'Sentences', value: stats.sentences, icon: <TextWrap />, color: 'amber' },
        { label: 'Paragraphs', value: stats.paragraphs, icon: <Pilcrow />, color: 'teal' },
    ];

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
    };

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Analyze your text with detailed word, character, and readability metrics. Perfect for writers, students, and content creators."
                route="/tools/word-counter"
                title="Word Counter"
            />

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="size-5" />
                            Text Input
                        </CardTitle>
                        <CardDescription>
                            Paste or type your text here to see real-time word and character
                            counts.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Textarea
                            className="w-full min-h-64 max-h-112 custom-scroll font-cascadia text-sm"
                            onChange={handleInputChange}
                            placeholder="Type or paste your text here..."
                            value={inputText}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <motion.div
                        animate="visible"
                        className="grid grid-cols-2 gap-3"
                        initial="hidden"
                        variants={containerVariants}
                    >
                        {statItems.map((item, index) => (
                            <motion.div key={index} variants={statVariants}>
                                <Card className="overflow-hidden h-full">
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {item.label}
                                                </p>
                                                {item.icon && (
                                                    <div
                                                        className={cn(
                                                            `text-${item.color}-600 dark:text-${item.color}-400`
                                                        )}
                                                    >
                                                        {item.icon}
                                                    </div>
                                                )}
                                            </div>
                                            <motion.div
                                                animate={{ opacity: 1, scale: 1 }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                key={item.value}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <p className="text-2xl md:text-3xl font-bold font-cascadia tracking-tight">
                                                    {item.value}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Advanced Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                animate="visible"
                                className="space-y-3"
                                initial="hidden"
                                variants={itemVariants}
                            >
                                <StatsRow
                                    title="Characters (no spaces)"
                                    value={stats.charactersNoSpace}
                                />
                                <StatsRow
                                    title="Avg Word Length"
                                    value={formatWithPlural(stats.avgWordLength, 'char')}
                                />
                                <StatsRow
                                    title="Avg Sentence Length"
                                    value={formatWithPlural(stats.avgSentenceLength, 'word')}
                                />
                                <StatsRow
                                    title="Reading Time"
                                    value={`~ ${formatWithPlural(stats.readingTime.value, stats.readingTime.unit)}`}
                                />
                            </motion.div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

type StatsProps = {
    title: string;
    value: string | number;
};

function StatsRow({ title, value }: StatsProps) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <Badge className="font-cascadia" variant="outline">
                {value}
            </Badge>
        </div>
    );
}
