'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Move } from 'lucide-react';
import type { ReactNode } from 'react';
import { getPhotoCardColorTokens } from '@/lib/photo-card/colors';
import { cn } from '@/lib/utils';

type Props = {
    accentColor: string;
    id: string;
    label: string;
    rect: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
    selected: boolean;
    onResizePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onSelect: () => void;
    children: ReactNode;
};

/**
 * Stage layer component with drag and resize capabilities
 * Provides visual feedback and standard interaction patterns
 */
export default function PhotoCardStageLayer({
    accentColor,
    children,
    id,
    label,
    onResizePointerDown,
    onSelect,
    rect,
    selected,
}: Props) {
    const tokens = getPhotoCardColorTokens(accentColor);
    const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
        id,
    });

    return (
        <div
            {...attributes}
            {...listeners}
            aria-label={`${label} layer`}
            className={cn(
                'absolute touch-none select-none',
                isDragging && 'z-30',
                selected && 'z-20'
            )}
            onPointerDown={onSelect}
            ref={setNodeRef}
            role="img"
            style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                transform: CSS.Translate.toString(transform),
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
        >
            <div
                className={cn(
                    'relative size-full overflow-hidden rounded-md border-2 border-dashed transition-all duration-150',
                    selected ? 'shadow-[0_0_0_2px] drop-shadow-lg' : 'shadow-sm hover:shadow-md'
                )}
                style={{
                    backgroundColor: selected ? tokens.surfaceStrong : tokens.surface,
                    borderColor: tokens.border,
                    boxShadow: selected ? `0 0 0 2px ${tokens.base}40` : undefined,
                }}
            >
                {children}

                {/* Label Badge */}
                <div
                    className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                        backgroundColor: tokens.base,
                        color: tokens.foreground,
                    }}
                >
                    <Move className="size-3" />
                    <span>{label}</span>
                </div>

                {/* Resize Handle - Bottom Right Corner */}
                <div
                    className={cn(
                        'absolute bottom-0 right-0 size-5 cursor-nwse-resize rounded-tl-lg border-l border-t',
                        'flex items-center justify-center transition-colors hover:bg-opacity-100 active:scale-98',
                        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                    onPointerDown={onResizePointerDown}
                    style={{
                        backgroundColor: tokens.base,
                        borderColor: tokens.border,
                    }}
                    title="Drag to resize"
                >
                    <GripHorizontal className="size-3 opacity-70" strokeWidth={3} />
                </div>
            </div>
        </div>
    );
}
