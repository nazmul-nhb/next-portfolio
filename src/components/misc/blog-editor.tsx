'use client';

import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { NodeViewProps } from '@tiptap/react';
import {
    EditorContent,
    NodeViewWrapper,
    ReactNodeViewRenderer,
    useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    ImageIcon,
    Italic,
    LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Underline,
    Undo,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface BlogEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
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
