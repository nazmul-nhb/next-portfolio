'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ChartSpline, FileJson, Puzzle, Shuffle, X } from 'lucide-react';
import { useDebouncedValue, useMount } from 'nhb-hooks';
import { generateAnagrams, isUndefined, normalizeNumber, parseJSON } from 'nhb-toolbox';
import { useCallback, useMemo, useRef, useState } from 'react';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CodeBlock from '@/components/misc/code-block';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn, hasErrorMessage } from '@/lib/utils';

const itemVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 14,
            mass: 1,
        },
    },
};

type DictionaryMode = 'none' | 'builtin' | 'custom';

interface AnagramProps {
    dictionary: string[];
}

export default function AnagramGenerator({ dictionary }: AnagramProps) {
    const [word, setWord] = useState('');
    const [debouncedWord] = useDebouncedValue(word, 500);
    const [dictionaryMode, setDictionaryMode] = useState<DictionaryMode>('none');
    const [limit, setLimit] = useState<number | 'all'>(100);
    const [customDictionary, setCustomDictionary] = useState<string[] | null>(null);
    const [customDictFileName, setCustomDictFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const anagrams = useMemo(() => {
        if (!debouncedWord.trim()) return [];
        setError(null);

        try {
            let dictToUse: false | string[] = false;

            if (dictionaryMode === 'builtin') {
                dictToUse = dictionary;
            } else if (dictionaryMode === 'custom' && customDictionary) {
                dictToUse = customDictionary;
            }

            const result = generateAnagrams(debouncedWord, {
                limit,
                dictionary: dictToUse,
            });

            return result;
        } catch (err) {
            setError(hasErrorMessage(err) ? err.message : 'Failed to generate anagrams');
            return [];
        }
    }, [debouncedWord, dictionaryMode, limit, dictionary, customDictionary]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = parseJSON<{ words: string[] }>(content, false);

                if (!parsed || !parsed.words || !Array.isArray(parsed.words)) {
                    setError('Invalid JSON format. Expected: { "words": string[] }');
                    return;
                }

                setCustomDictionary(parsed.words);
                setCustomDictFileName(file.name);
                setError(null);
            } catch (err) {
                setError(hasErrorMessage(err) ? err.message : 'Failed to parse JSON file');
            }
        };
        reader.readAsText(file);
    }, []);

    const handleClearCustomDict = useCallback(() => {
        setCustomDictionary(null);
        setCustomDictFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (dictionaryMode === 'custom') {
            setDictionaryMode('none');
        }
    }, [dictionaryMode]);

    const handleDictionaryModeChange = (value: string) => {
        const newMode = value as DictionaryMode;
        setDictionaryMode(newMode);

        if (newMode === 'custom' && !customDictionary) {
            fileInputRef.current?.click();
        }
    };

    const isBelow100 = anagrams.length > 0 && anagrams.length < 100;

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Generate unique anagrams of any word. Choose from no filter, built-in dictionary, or upload a custom word list."
                route="/tools/anagram-generator"
                title="Anagram Generator"
            />

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                {/* Input Section */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="size-5" />
                                Word Input
                            </CardTitle>
                            <CardDescription>
                                Enter a word to generate anagrams. Real-time generation as you
                                type.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Input
                                className="w-full font-cascadia text-xl! py-6"
                                onChange={(e) => setWord(e.target.value)}
                                placeholder="Enter a word..."
                                type="text"
                                value={word}
                            />
                        </CardContent>
                    </Card>
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive"
                            initial={{ opacity: 0, y: -10 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20,
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                    {/* Dictionary Mode */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Dictionary Mode</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                onValueChange={handleDictionaryModeChange}
                                value={dictionaryMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Filter</SelectItem>
                                    <SelectItem value="builtin">Built-in Dictionary</SelectItem>
                                    <SelectItem value="custom">Custom Dictionary</SelectItem>
                                </SelectContent>
                            </Select>

                            {dictionaryMode === 'custom' && (
                                <div className="space-y-2">
                                    {customDictFileName ? (
                                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileJson className="size-4 shrink-0 text-muted-foreground" />
                                                <span className="text-xs truncate text-muted-foreground">
                                                    {customDictFileName}
                                                </span>
                                                <span className="text-xs text-muted-foreground/70 shrink-0">
                                                    ({customDictionary?.length ?? 0} words)
                                                </span>
                                            </div>
                                            <Button
                                                className="h-auto p-1"
                                                onClick={handleClearCustomDict}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <X className="size-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            size="default"
                                            variant="outline"
                                        >
                                            <FileJson className="size-4 mr-2" />
                                            Choose JSON File
                                        </Button>
                                    )}
                                    <Input
                                        accept="application/json"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        ref={fileInputRef}
                                        type="file"
                                    />
                                    <CodeBlock className="text-xs">
                                        {`Format: { "words": ["word1", "word2", ...] }`}
                                    </CodeBlock>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Limit Control */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Anagram Limit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    className="flex-1 font-cascadia"
                                    disabled={limit === 'all'}
                                    max="1000"
                                    min="1"
                                    onChange={(e) => {
                                        const val = normalizeNumber(e.target.value);
                                        if (!isUndefined(val)) setLimit(val);
                                    }}
                                    type="number"
                                    value={
                                        limit === 'all'
                                            ? isBelow100
                                                ? anagrams.length
                                                : 100
                                            : limit
                                    }
                                />

                                <Button
                                    onClick={() =>
                                        setLimit(
                                            limit === 'all'
                                                ? isBelow100
                                                    ? anagrams.length
                                                    : 100
                                                : 'all'
                                        )
                                    }
                                    size="lg"
                                    variant="outline"
                                >
                                    {limit === 'all'
                                        ? `Reset to ${isBelow100 ? anagrams.length : '100'}`
                                        : 'Get All Anagrams'}
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {limit === 'all'
                                    ? 'Generating all possible anagrams may take a moment for longer words.'
                                    : `Maximum ${limit} anagrams will be generated.`}
                            </p>
                        </CardContent>
                    </Card>
                    <PoweredBy
                        description="This tool uses generateAnagrams(...) for unique anagram generation."
                        url="https://toolbox.nazmul-nhb.dev/docs/utilities/string/generateAnagrams"
                    />
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {anagrams.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shuffle className="size-5" />
                                    Generated Anagrams ({anagrams.length})
                                </CardTitle>
                                <CardDescription>
                                    {anagrams.length === 1
                                        ? 'Only the base word found.'
                                        : `${anagrams.length - 1} unique anagrams generated.`}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="max-h-[min(348px,calc(100vh-20rem))] overflow-y-auto overflow-x-hidden custom-scroll">
                                <motion.div
                                    className="flex flex-wrap justify-self-start justify-between gap-2"
                                    layout
                                >
                                    <AnimatePresence mode="popLayout">
                                        {anagrams.map((anagram, index) => (
                                            <motion.div
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.7, y: -6 }}
                                                initial={{ opacity: 0, scale: 0.8, y: 6 }}
                                                key={anagram}
                                                layout
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 260,
                                                    damping: 18,
                                                }}
                                            >
                                                <Badge
                                                    className={cn(
                                                        'font-cascadia cursor-default text-xl',
                                                        index === 0 &&
                                                            'bg-primary/20 text-primary'
                                                    )}
                                                    variant={
                                                        index === 0 ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {anagram}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </CardContent>
                        </Card>
                    )}

                    {debouncedWord.trim() && anagrams.length === 0 && !error && (
                        <EmptyData
                            description={`No anagrams found for "${debouncedWord}" with the current
                                    settings.`}
                            Icon={Puzzle}
                            title="No anagrams found"
                        />
                    )}

                    {/* Stats Card */}
                    {debouncedWord.trim() && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex gap-1 items-center">
                                    <ChartSpline className="size-4" /> Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    animate="animate"
                                    className="space-y-3"
                                    initial="initial"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Total Anagrams
                                        </span>
                                        <Badge className="font-cascadia" variant="outline">
                                            {anagrams.length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Word Length
                                        </span>
                                        <Badge className="font-cascadia" variant="outline">
                                            {debouncedWord.length} chars
                                        </Badge>
                                    </div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
