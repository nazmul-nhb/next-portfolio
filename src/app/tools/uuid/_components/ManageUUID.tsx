'use client';

import { Key, ListX } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { generateQueryParams } from 'nhb-toolbox';
import { useEffect, useState } from 'react';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DecodeUUID from './DecodeUUID';
import GenerateUUID from './GenerateUUID';

const TABS = ['generate', 'decode'] as const;

type TabId = (typeof TABS)[number];

export default function ManageUUID() {
    const searchParam = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const tab = searchParam.get('tab') as TabId | null;

    const [tabId, setTabId] = useState<TabId>(tab || TABS[0]);

    useEffect(() => {
        const query = generateQueryParams({ tab: tabId });

        router.push(pathname.concat(query) as Route);
    }, [tabId, pathname, router]);

    useEffect(() => {
        if (tab) {
            setTabId(tab);
        }
    }, [tab]);

    return (
        <div className="space-y-8">
            <TitleWithShare
                description="Create UUIDs across all RFC 4122 versions (v1, v3-v8) and decode existing UUIDs to inspect their metadata."
                route="/tools/uuid"
                title="UUID Generator & Decoder"
            />

            <SmartAlert
                className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100"
                description={
                    <ul className="list-disc ml-6 space-y-1">
                        <li>
                            <strong>v1, v4, v6, v7, v8:</strong> Click{' '}
                            <code className="font-cascadia rounded px-1 bg-accent-foreground text-secondary">
                                Generate Another
                            </code>{' '}
                            to create a new UUID
                        </li>
                        <li>
                            <strong>v3 &amp; v5:</strong> Provide a name and either use an
                            existing namespace UUID or auto-generate one
                        </li>
                        <li>
                            Use the decoder to analyze any UUID and view its version, variant,
                            and metadata
                        </li>
                        <li>Decoder remembers the last decoded uuid in the current session</li>
                    </ul>
                }
                title="How it works"
            />

            <Tabs
                className="w-full"
                defaultValue={tabId}
                onValueChange={(id) => setTabId(id as TabId)}
            >
                <TabsList className="mb-2" variant="line">
                    <TabsTrigger value={TABS[0]}>
                        <Key />
                        Generate UUID
                    </TabsTrigger>
                    <TabsTrigger value={TABS[1]}>
                        <ListX />
                        Decode UUID
                    </TabsTrigger>
                </TabsList>
                {/* Generator Section */}
                <TabsContent value={TABS[0]}>
                    <GenerateUUID />

                    <PoweredBy
                        className="mt-4"
                        description="This tool uses uuid from my open-source package for pure JS uuid implementation."
                        url="https://toolbox.nazmul-nhb.dev/docs/utilities/hash/uuid"
                    />
                </TabsContent>
                {/* Decoder Section */}
                <TabsContent value={TABS[1]}>
                    <DecodeUUID />

                    <PoweredBy
                        className="mt-4"
                        description="This tool uses decodeUUID from my open-source package to decode a UUID into its internal components."
                        url="https://toolbox.nazmul-nhb.dev/docs/utilities/hash/decodeUUID"
                    />
                </TabsContent>
            </Tabs>

            <SmartAlert
                className="bg-amber-800/10"
                description="All UUID generation and decoding happens locally in your browser. No data is sent to any server."
            />
        </div>
    );
}
