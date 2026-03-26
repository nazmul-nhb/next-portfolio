import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import NewBlogForm from './_components/NewBlogForm';

const description =
    'Write a new blog post about programming, web development, technology, literature and more.';

export const metadata: Metadata = {
    title: { absolute: `Write a New Blog Post » ${siteConfig.name}` },
    description,
    keywords: [...siteConfig.keywords, 'write blog', 'new blog', 'create blog', 'blog editor'],
    alternates: { canonical: buildCanonicalUrl('/blogs/new') },
    openGraph: {
        title: { absolute: `Write a New Blog Post » ${siteConfig.name}` },
        description,
    },
};

export default function NewBlogPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12 overflow-x-hidden">
            <FadeInUp>
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild size="icon" variant="ghost">
                            <Link href="/blogs">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Write a New Post</h1>
                    </div>
                </div>
            </FadeInUp>
            <NewBlogForm />
        </div>
    );
}
