'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
    href: Route;
};

export default function Navigate({ href }: Props) {
    const router = useRouter();

    return (
        <Button onClick={() => router.push(href)} type="button" variant="link">
            Open Tool
            <ArrowRight className="size-4" />
        </Button>
    );
}
