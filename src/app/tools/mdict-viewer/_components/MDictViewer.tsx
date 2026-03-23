'use client';

import { useMount } from 'nhb-hooks';
import { resolveMDictHtml } from '@/lib/mdict/client';

type Props = {
    html: string;
    resources: Record<string, string>;
};

export default function MDictViewer({ html, resources }: Props) {
    const resolved = resolveMDictHtml(html, resources);

    return useMount(<div dangerouslySetInnerHTML={{ __html: resolved }} />);
}
