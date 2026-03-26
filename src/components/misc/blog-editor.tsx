'use client';

import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import {
    BackgroundColor,
    Color,
    FontFamily,
    FontSize,
    LineHeight,
    TextStyle,
} from '@tiptap/extension-text-style';
import type { NodeViewProps, Editor as TiptapEditor } from '@tiptap/react';
import {
    EditorContent,
    NodeViewWrapper,
    ReactNodeViewRenderer,
    useEditor,
    useEditorState,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { LucideIcon } from 'lucide-react';
import {
    ALargeSmall,
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Baseline,
    Bold,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Highlighter,
    ImageIcon,
    Italic,
    LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Space,
    Strikethrough,
    Type,
    Underline,
    Undo,
} from 'lucide-react';
import type { CSSColor } from 'nhb-toolbox/colors/types';
import { CSS_COLORS } from 'nhb-toolbox/constants';
import type { Maybe } from 'nhb-toolbox/types';
import { useEffect, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import { FONT_FAMILIES_WORD_CLOUD } from '@/lib/tools/word-cloud';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BlogEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const FONT_SIZES = [
    '7px',
    '8px',
    '9px',
    '10px',
    '11px',
    '12px',
    '13px',
    '14px',
    '16px',
    '18px',
    '20px',
    '24px',
    '28px',
    '32px',
    '36px',
    '48px',
    '64px',
    '72px',
    '80px',
] as const;

const LINE_HEIGHTS = [
    { value: '1', label: '1.0' },
    { value: '1.25', label: '1.25' },
    { value: '1.5', label: '1.5' },
    { value: '1.75', label: '1.75' },
    { value: '2', label: '2.0' },
    { value: '2.5', label: '2.5' },
    { value: '3', label: '3.0' },
] as const;

/** Curated subset of CSS_COLORS for the color picker grid */
const COLOR_SWATCHES = [
    'black',
    'dimgray',
    'gray',
    'darkgray',
    'silver',
    'lightgray',
    'white',
    'maroon',
    'brown',
    'red',
    'orangered',
    'tomato',
    'salmon',
    'lightsalmon',
    'darkgreen',
    'green',
    'forestgreen',
    'limegreen',
    'lime',
    'lightgreen',
    'palegreen',
    'navy',
    'darkblue',
    'blue',
    'royalblue',
    'dodgerblue',
    'skyblue',
    'lightblue',
    'indigo',
    'purple',
    'darkviolet',
    'mediumorchid',
    'violet',
    'plum',
    'lavender',
    'darkorange',
    'orange',
    'gold',
    'yellow',
    'khaki',
    'lightyellow',
    'ivory',
    'teal',
    'darkcyan',
    'cyan',
    'mediumturquoise',
    'turquoise',
    'aquamarine',
    'paleturquoise',
    'darkmagenta',
    'deeppink',
    'hotpink',
    'mediumvioletred',
    'pink',
    'lightpink',
    'mistyrose',
] as const satisfies CSSColor[];

type ColorPickerProps = {
    editor: TiptapEditor;
    command: 'setColor' | 'setBackgroundColor';
    unsetCommand: 'unsetColor' | 'unsetBackgroundColor';
    attribute: 'color' | 'backgroundColor';
    icon: LucideIcon;
    label: string;
};

function ColorPickerPopover({
    editor,
    command,
    unsetCommand,
    attribute,
    icon: Icon,
    label,
}: ColorPickerProps) {
    const currentColor = useEditorState({
        editor,
        selector: (ctx) => ctx.editor.getAttributes('textStyle')[attribute] as Maybe<string>,
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="relative" size="sm" type="button" variant="ghost">
                    <Icon className="size-4" />
                    {currentColor && (
                        <span
                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3.5 rounded-full"
                            style={{ backgroundColor: currentColor }}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                <div className="grid grid-cols-7 gap-1">
                    {COLOR_SWATCHES.map((name) => {
                        const hex = CSS_COLORS[name];

                        return (
                            <button
                                className={cn(
                                    'size-6 rounded-sm border border-border transition-transform hover:scale-110',
                                    currentColor === hex && 'ring-2 ring-primary ring-offset-1'
                                )}
                                key={name}
                                onClick={() => editor.chain().focus()[command](hex).run()}
                                style={{ backgroundColor: hex }}
                                title={name}
                                type="button"
                            />
                        );
                    })}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <input
                        className="size-7 cursor-pointer rounded border-none bg-transparent p-0"
                        onChange={(e) => editor.chain().focus()[command](e.target.value).run()}
                        title="Custom color"
                        type="color"
                        value={currentColor || '#000000'}
                    />
                    <Button
                        className="ml-auto"
                        onClick={() => editor.chain().focus()[unsetCommand]().run()}
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function BlogEditor({ content, onChange, placeholder }: BlogEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5],
                },
            }),
            TextStyle,
            FontSize,
            FontFamily,
            Color,
            BackgroundColor,
            LineHeight,
            TextAlign.configure({
                defaultAlignment: 'left',
                alignments: ['left', 'center', 'right', 'justify'],
                types: ['paragraph', 'heading'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            ResizableImageExtension,
            Placeholder.configure({
                placeholder: placeholder || 'Start writing your blog post...',
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-neutral dark:prose-invert max-w-none min-h-full focus:outline-none p-4 bg-background',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const textStyleState = useEditorState({
        editor,
        selector: (ctx) => {
            const e = ctx.editor;

            if (!e) return { fontFamily: '', fontSize: '', lineHeight: '', textAlign: '' };

            const attrs = e.getAttributes('textStyle');

            return {
                fontFamily:
                    FONT_FAMILIES_WORD_CLOUD.find((f) =>
                        e.isActive('textStyle', { fontFamily: f.fontFamily })
                    )?.value ?? '',
                fontSize: (attrs.fontSize as string) ?? '',
                lineHeight: (attrs.lineHeight as string) ?? '',
                textAlign:
                    (e.getAttributes('paragraph').textAlign as string) ||
                    (e.getAttributes('heading').textAlign as string) ||
                    '',
            };
        },
    });

    if (!editor) {
        return null;
    }

    const showInputToast = (
        title: string,
        placeholder: string,
        onSubmit: (value: string) => void
    ) => {
        let currentValue = '';

        toast.custom(
            (t) => (
                <div className="w-full rounded-lg border border-border bg-background p-4 shadow-lg">
                    <h3 className="mb-3 font-semibold">{title}</h3>
                    <Input
                        autoFocus
                        className="mb-3"
                        defaultValue=""
                        onChange={(e) => {
                            currentValue = e.target.value;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && currentValue) {
                                onSubmit(currentValue);
                                toast.dismiss(t);
                            } else if (e.key === 'Escape') {
                                toast.dismiss(t);
                            }
                        }}
                        placeholder={placeholder}
                        type="url"
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => {
                                toast.dismiss(t);
                            }}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (currentValue) {
                                    onSubmit(currentValue);
                                    toast.dismiss(t);
                                }
                            }}
                            size="sm"
                            type="button"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                position: 'top-center',
            }
        );
    };

    const addLink = () => {
        showInputToast('Add Link', 'https://example.com', (url) => {
            editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
        });
    };

    const addImage = () => {
        showInputToast('Add Image', 'https://example.com/image.jpg', (url) => {
            editor.chain().focus().setImage({ src: url, alt: 'Blog Image' }).run();
        });
    };

    return (
        <div
            className="flex flex-col rounded-md border border-border overflow-hidden"
            style={{ height: '480px' }}
        >
            {/* Toolbar */}
            <div className="shrink-0 flex flex-wrap gap-1 border-b border-border bg-muted/50 p-2">
                <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('bold') ? 'default' : 'ghost'}
                >
                    <Bold className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                >
                    <Italic className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('underline') ? 'default' : 'ghost'}
                >
                    <Underline className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('strike') ? 'default' : 'ghost'}
                >
                    <Strikethrough className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                {/* Font Family */}
                <Select
                    onValueChange={(value) => {
                        if (value === '__unset') {
                            editor.chain().focus().unsetFontFamily().run();
                        } else {
                            const font = FONT_FAMILIES_WORD_CLOUD.find(
                                (f) => f.value === value
                            );
                            if (font) {
                                editor.chain().focus().setFontFamily(font.fontFamily).run();
                            }
                        }
                    }}
                    value={textStyleState?.fontFamily ?? ''}
                >
                    <SelectTrigger className="h-8 w-fit text-xs" size="sm">
                        <Type className="mr-1 size-3.5 shrink-0" />
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__unset">Default</SelectItem>
                        {FONT_FAMILIES_WORD_CLOUD.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                                <span style={{ fontFamily: font.fontFamily }}>
                                    {font.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Font Size */}
                <Select
                    onValueChange={(value) => {
                        if (value === '__unset') {
                            editor.chain().focus().unsetFontSize().run();
                        } else {
                            editor.chain().focus().setFontSize(value).run();
                        }
                    }}
                    value={textStyleState?.fontSize ?? ''}
                >
                    <SelectTrigger className="h-8 w-fit text-xs" size="sm">
                        <ALargeSmall className="mr-1 size-3.5 shrink-0" />
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__unset">Default</SelectItem>
                        {FONT_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Line Height */}
                <Select
                    onValueChange={(value) => {
                        if (value === '__unset') {
                            editor.chain().focus().unsetLineHeight().run();
                        } else {
                            editor.chain().focus().setLineHeight(value).run();
                        }
                    }}
                    value={textStyleState?.lineHeight ?? ''}
                >
                    <SelectTrigger className="h-8 w-fit text-xs" size="sm">
                        <Space className="mr-1 size-3.5 shrink-0" />
                        <SelectValue placeholder="Line" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__unset">Default</SelectItem>
                        {LINE_HEIGHTS.map((lh) => (
                            <SelectItem key={lh.value} value={lh.value}>
                                {lh.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="mx-1 w-px bg-border" />

                {/* Text Color */}
                <ColorPickerPopover
                    attribute="color"
                    command="setColor"
                    editor={editor}
                    icon={Baseline}
                    label="Text Color"
                    unsetCommand="unsetColor"
                />

                {/* Background Color */}
                <ColorPickerPopover
                    attribute="backgroundColor"
                    command="setBackgroundColor"
                    editor={editor}
                    icon={Highlighter}
                    label="Highlight Color"
                    unsetCommand="unsetBackgroundColor"
                />

                <div className="mx-1 w-px bg-border" />

                {/* Text Align */}
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    size="sm"
                    type="button"
                    variant={textStyleState?.textAlign === 'left' ? 'default' : 'ghost'}
                >
                    <AlignLeft className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    size="sm"
                    type="button"
                    variant={textStyleState?.textAlign === 'center' ? 'default' : 'ghost'}
                >
                    <AlignCenter className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    size="sm"
                    type="button"
                    variant={textStyleState?.textAlign === 'right' ? 'default' : 'ghost'}
                >
                    <AlignRight className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    size="sm"
                    type="button"
                    variant={textStyleState?.textAlign === 'justify' ? 'default' : 'ghost'}
                >
                    <AlignJustify className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('code') ? 'default' : 'ghost'}
                >
                    <Code className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                >
                    <Code2 className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                >
                    <Heading1 className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                >
                    <Heading2 className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                >
                    <Heading3 className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('heading', { level: 4 }) ? 'default' : 'ghost'}
                >
                    <Heading4 className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('heading', { level: 5 }) ? 'default' : 'ghost'}
                >
                    <Heading5 className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                >
                    <List className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                >
                    <ListOrdered className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                >
                    <Quote className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button onClick={addLink} size="sm" type="button" variant="ghost">
                    <LinkIcon className="size-4" />
                </Button>
                <Button onClick={addImage} size="sm" type="button" variant="ghost">
                    <ImageIcon className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button
                    // disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <Undo className="size-4" />
                </Button>
                <Button
                    // disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <Redo className="size-4" />
                </Button>
            </div>

            {/* Editor */}
            <div className="flex-1 custom-scroll overflow-y-auto min-h-0">
                <EditorContent className="h-full" editor={editor} />
            </div>
        </div>
    );
}

// ─── Resizable Image ────────────────────────────────────────────────────────

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const startResize = (e: React.MouseEvent, direction: 'e' | 'w' | 'se' | 'sw') => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth =
            containerRef.current?.offsetWidth ??
            (typeof node.attrs.width === 'number' ? node.attrs.width : 300);

        const onMouseMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            // west-side handles shrink when dragging right
            const delta = direction === 'w' || direction === 'sw' ? -dx : dx;
            const newWidth = Math.max(32, startWidth + delta);
            updateAttributes({ width: newWidth });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleClass =
        'absolute size-3 rounded-sm bg-primary shadow-sm appearance-none p-0 focus:outline-none';

    return (
        <NodeViewWrapper
            className="inline-block max-w-full"
            style={{
                width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
                maxWidth: '100%',
            }}
        >
            <div className="relative select-none" ref={containerRef}>
                {/* biome-ignore lint: Tiptap NodeView requires a native img element for user-provided image URLs */}
                <img
                    alt={node.attrs.alt || ''}
                    className={cn('block w-full', { 'ring ring-primary': selected })}
                    draggable={false}
                    src={node.attrs.src}
                />
                {selected && (
                    <Fragment>
                        {/* selection border */}
                        <div className="pointer-events-none absolute inset-0" />

                        {/* corner handles */}
                        <button
                            aria-label="Resize from top-left"
                            className={`${handleClass} -left-1.5 -top-1.5 cursor-nw-resize`}
                            onMouseDown={(e) => startResize(e, 'w')}
                            type="button"
                        />
                        <button
                            aria-label="Resize from top-right"
                            className={`${handleClass} -right-1.5 -top-1.5 cursor-ne-resize`}
                            onMouseDown={(e) => startResize(e, 'e')}
                            type="button"
                        />
                        <button
                            aria-label="Resize from bottom-left"
                            className={`${handleClass} -bottom-1.5 -left-1.5 cursor-sw-resize`}
                            onMouseDown={(e) => startResize(e, 'sw')}
                            type="button"
                        />
                        <button
                            aria-label="Resize from bottom-right"
                            className={`${handleClass} -bottom-1.5 -right-1.5 cursor-se-resize`}
                            onMouseDown={(e) => startResize(e, 'se')}
                            type="button"
                        />

                        {/* edge handles */}
                        <button
                            aria-label="Resize from left"
                            className={`${handleClass} -left-1.5 top-1/2 -translate-y-1/2 cursor-w-resize`}
                            onMouseDown={(e) => startResize(e, 'w')}
                            type="button"
                        />
                        <button
                            aria-label="Resize from right"
                            className={`${handleClass} -right-1.5 top-1/2 -translate-y-1/2 cursor-e-resize`}
                            onMouseDown={(e) => startResize(e, 'e')}
                            type="button"
                        />
                    </Fragment>
                )}
            </div>
        </NodeViewWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

const ResizableImageExtension = TiptapImage.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: (attrs) => {
                    if (!attrs.width) return {};
                    return { width: attrs.width, style: `width: ${attrs.width}px` };
                },
                parseHTML: (el) => {
                    const w = el.getAttribute('width');
                    const s = el.style.width;
                    if (w) return Number(w);
                    if (s) return Number(s);
                    return null;
                },
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
