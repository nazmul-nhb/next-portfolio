'use client';

import { useEffect, useRef } from 'react';
import type { WordPosition } from '@/lib/tools/word-cloud';

interface WordCloudCanvasProps {
    words: WordPosition[];
    fontFamily: string;
    backgroundColor: string;
}

export default function WordCloudCanvas({
    words,
    fontFamily,
    backgroundColor,
}: WordCloudCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || words.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const width = 1600;
        const height = 1200;
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw words
        words.forEach((word) => {
            ctx.font = `bold ${word.fontSize}px ${fontFamily}`;
            ctx.fillStyle = word.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add shadow for better readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            ctx.fillText(word.word, word.x, word.y);

            // Reset shadow
            ctx.shadowColor = 'transparent';
        });
    }, [words, fontFamily, backgroundColor]);

    return <canvas className="w-full border rounded" ref={canvasRef} />;
}
