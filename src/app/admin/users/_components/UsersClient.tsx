'use client';

import { Crown, Search, UserCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import UserCard from '@/app/admin/users/_components/UserCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/lib/hooks/use-api';
import type { RawUser } from '@/types/users';

export function UsersClient({ initialData }: { initialData: RawUser[] }) {
    const [search, setSearch] = useState('');

    const { data: users = initialData } = useApiQuery<RawUser[]>('/api/users/admin', {
        queryKey: ['admin-users'],
    });

    const filtered = useMemo(() => {
        return users.filter((user) => {
            return (
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, users]);

    const adminCount = users.filter((u) => u.role === 'admin').length;
    const activeCount = users.filter((u) => u.is_active).length;

    return (
        <div className="space-y-6">
            {/* Header with stats */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage user accounts, roles and access
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{users.length}</span>
                        <span className="text-muted-foreground">total</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50/50 px-3 py-1.5 text-sm dark:border-amber-800/40 dark:bg-amber-950/30">
                        <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium">{adminCount}</span>
                        <span className="text-muted-foreground">admins</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-green-200/60 bg-green-50/50 px-3 py-1.5 text-sm dark:border-green-800/40 dark:bg-green-950/30">
                        <UserCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="font-medium">{activeCount}</span>
                        <span className="text-muted-foreground">active</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    value={search}
                />
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">
                            {search ? 'No users match your search.' : 'No users found.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((user) => (
                        <UserCard key={user.id} userData={user} />
                    ))}
                </div>
            )}
        </div>
    );
}
