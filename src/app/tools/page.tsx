import { ArrowRight, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/configs/site';

export const metadata: Metadata = {
    title: 'All Tools',
    description: 'Browse available productivity tools.',
};

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">All Tools</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Utilities available for your account.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="size-5" />
                            Expense Manager
                        </CardTitle>
                        <CardDescription>
                            Track income, expenses, loans, repayments, and net cash in hand.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            href="/tools/expenses"
                        >
                            Open Tool
                            <ArrowRight className="size-4" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {siteConfig.toolsMenus.length <= 1 && (
                <p className="text-xs text-muted-foreground">
                    More tools will appear here as they are added.
                </p>
            )}
        </div>
    );
}
