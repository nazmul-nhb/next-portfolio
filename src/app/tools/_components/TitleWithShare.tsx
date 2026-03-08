'use client';

import type { Route } from 'next';
import ShareButton from '@/components/misc/share-button';
import { siteConfig } from '@/configs/site';

type Props = {
    title: string;
    description: string;
    route: Route;
    className?: string;
};

export default function TitleWithShare({ className, description, route, title }: Props) {
    return (
        <div className={className}>
            <div className="flex items-start gap-2 flex-wrap justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                <ShareButton
                    buttonLabel="Share this tool"
                    route={route}
                    shareText={`${title} from ${siteConfig.name}`}
                />
            </div>
            <p className="md:max-w-4/5 max-w-full mt-2 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
