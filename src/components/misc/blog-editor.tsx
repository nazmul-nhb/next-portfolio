'use client';

import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
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
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Start writing your blog post...',
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4 rounded-md border border-border bg-background',
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
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 rounded-md border border-border bg-muted/50 p-2">
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
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('strike') ? 'default' : 'ghost'}
                >
                    <Strikethrough className="size-4" />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    size="sm"
                    type="button"
                    variant={editor.isActive('code') ? 'default' : 'ghost'}
                >
                    <Code className="size-4" />
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
                    <Link2 className="size-4" />
                </Button>
                <Button onClick={addImage} size="sm" type="button" variant="ghost">
                    <ImageIcon className="size-4" />
                </Button>

                <div className="mx-1 w-px bg-border" />

                <Button
                    disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <Undo className="size-4" />
                </Button>
                <Button
                    disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <Redo className="size-4" />
                </Button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
