'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

type Props = {
    href: Route;
};

export default function Navigate({ href }: Props) {
    const router = useRouter();

    return (
        <button
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border-b border-b-transparent hover:border-b-primary hover:text-primary"
            onClick={() => router.push(href)}
            type="button"
        >
            Open Tool
            <ArrowRight className="size-4" />
        </button>
    );
}
