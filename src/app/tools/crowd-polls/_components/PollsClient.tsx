'use client';

import { AlertCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PollCreator } from './PollCreator';
import { PollList } from './PollList';

export function PollsClient() {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);

    return (
        <Fragment>
            <div className="space-y-8">
                <Alert className="mb-8 border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-50 select-none">
                    <AlertCircle />
                    <AlertTitle>Crowd Polls Tool</AlertTitle>
                    <AlertDescription>
                        Create and participate in polls. Vote on active polls, and watch results
                        update in real-time. Polls can be public or anonymous.
                    </AlertDescription>
                </Alert>

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
