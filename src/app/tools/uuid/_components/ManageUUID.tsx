import { Key, ListX } from 'lucide-react';
import SmartAlert from '@/components/misc/smart-alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DecodeUUID from './DecodeUUID';
import GenerateUUID from './GenerateUUID';

export default function ManageUUID() {
    return (
        <div className="space-y-8">
            <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight">UUID Generator & Decoder</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Create UUIDs across all RFC 4122 versions (v1, v3-v8) and decode existing
                    UUIDs to inspect their metadata.
                </p>
            </div>

            <SmartAlert
                className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100"
                description={
                    <ul className="list-disc ml-6 space-y-1">
                        <li>
                            <strong>v1, v4, v6, v7, v8:</strong> Click &quot;Generate UUID&quot;
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
                    </ul>
                }
                title="How it works"
            />

            <Tabs className="w-full" defaultValue="generate">
                <TabsList className="mb-2" variant="line">
                    <TabsTrigger value="generate">
                        <Key />
                        Generate UUID
                    </TabsTrigger>
                    <TabsTrigger value="decode">
                        <ListX />
                        Decode UUID
                    </TabsTrigger>
                </TabsList>
                {/* Generator Section */}
                <TabsContent value="generate">
                    <GenerateUUID />
                </TabsContent>
                {/* Decoder Section */}
                <TabsContent value="decode">
                    <DecodeUUID />
                </TabsContent>
            </Tabs>

            <SmartAlert
                className="bg-amber-800/10"
                description="All UUID generation and decoding happens locally in your browser. No data is sent to any server."
            />
        </div>
    );
}
