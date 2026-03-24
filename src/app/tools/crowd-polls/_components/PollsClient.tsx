'use client';

import { AlertCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import { PollCreator } from './PollCreator';
import { PollList } from './PollList';

export function PollsClient() {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);

    return (
        <Fragment>
            <div className="space-y-8">
                <SmartAlert
                    className="border-blue-200 bg-blue-50 text-blue-800/40 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-50 select-none mb-6"
                    description="Create and participate in polls. Vote on active polls, and watch results update in real-time. Polls can be public or anonymous."
                    Icon={AlertCircle}
                    title="Crowd Polls Tool"
                />

                <TitleWithShare
                    description="Create polls, vote on active polls, and see real-time results with anonymous voting support."
                    route="/tools/crowd-polls"
                    title="Crowd Polls"
                />

                <PollList onCreateClick={() => setIsCreatorOpen(true)} />
            </div>

            <PollCreator isOpen={isCreatorOpen} onOpenChange={setIsCreatorOpen} />
        </Fragment>
    );
}
