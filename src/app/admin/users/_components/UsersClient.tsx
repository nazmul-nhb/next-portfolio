'use client';

import {
    Ban,
    CheckCircle,
    Crown,
    Mail,
    Search,
    Shield,
    ShieldOff,
    Trash2,
    User,
    UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { confirmToast } from '@/components/confirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl, cn } from '@/lib/utils';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
    bio: string | null;
    role: 'admin' | 'user';
    provider: 'credentials' | 'google';
    email_verified: boolean;
    is_active: boolean;
    created_at: string | Date;
    updated_at: string | Date;
}

export function UsersClient({ initialData }: { initialData: AdminUser[] }) {
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: users } = useApiQuery<AdminUser[]>('admin-users', '/api/users/admin');
    const allUsers = users ?? initialData;

    const { mutate: updateUser, isPending: isUpdating } = useApiMutation<
        unknown,
        { user_id: number; role?: 'admin' | 'user'; is_active?: boolean }
    >('/api/users/admin', 'PATCH', {
        successMessage: 'User updated successfully!',
        errorMessage: 'Failed to update user.',
        invalidateKeys: ['admin-users'],
    });

    const { mutate: deleteUser, isPending: isDeleting } = useApiMutation<unknown, null>(
        `/api/users/admin?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'User deleted!',
            errorMessage: 'Failed to delete user.',
            invalidateKeys: ['admin-users'],
        }
    );

    const handleToggleRole = (user: AdminUser) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';

        confirmToast({
            title: `${newRole === 'admin' ? 'Promote' : 'Demote'} "${user.name}"?`,
            description: `This will ${newRole === 'admin' ? 'grant admin privileges to' : 'remove admin privileges from'} this user.`,
            confirmText: newRole === 'admin' ? 'Promote' : 'Demote',
            confirmButtonVariant: newRole === 'admin' ? 'default' : 'destructive',
            onConfirm: () => {
                updateUser({ user_id: user.id, role: newRole });
            },
        });
    };

    const handleToggleActive = (user: AdminUser) => {
        const action = user.is_active ? 'Deactivate' : 'Activate';

        confirmToast({
            title: `${action} "${user.name}"?`,
            description: user.is_active
                ? 'This user will no longer be able to log in.'
                : "This will restore the user's access.",
            confirmText: action,
            confirmButtonVariant: user.is_active ? 'destructive' : 'default',
            onConfirm: () => {
                updateUser({ user_id: user.id, is_active: !user.is_active });
            },
        });
    };

    const handleDelete = (user: AdminUser) => {
        setDeletingId(user.id);

        confirmToast({
            title: `Delete "${user.name}"?`,
            description:
                'This will permanently delete the user and all their associated data. This cannot be undone.',
            confirmText: 'Delete',
            isLoading: deletingId === user.id && isDeleting,
            onConfirm: () => {
                deleteUser(null, {
                    onSettled: () => setDeletingId(null),
                    onSuccess: async () => {
                        if (user.profile_image) {
                            await deleteFromCloudinary(user.profile_image);
                        }
                    },
                });
            },
        });
    };

    const filtered = allUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const adminCount = allUsers.filter((u) => u.role === 'admin').length;
    const activeCount = allUsers.filter((u) => u.is_active).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="text-muted-foreground">
                    {allUsers.length} total &middot; {adminCount} admins &middot; {activeCount}{' '}
                    active
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <div className="space-y-3">
                    {filtered.map((user) => (
                        <Card className={cn(!user.is_active && 'opacity-60')} key={user.id}>
                            <CardContent className="flex items-center gap-4 p-4">
                                {/* Avatar */}
                                {user.profile_image ? (
                                    <Image
                                        alt={user.name}
                                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                                        height={48}
                                        src={buildCloudinaryUrl(user.profile_image)}
                                        width={48}
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}

                                {/* User info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate font-medium">{user.name}</p>
                                        {user.role === 'admin' && (
                                            <Badge className="gap-1" variant="default">
                                                <Crown className="h-3 w-3" />
                                                Admin
                                            </Badge>
                                        )}
                                        {!user.is_active && (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                        {user.email_verified && (
                                            <Badge
                                                className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                                                variant="outline"
                                            >
                                                <CheckCircle className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1 truncate">
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            {user.email}
                                        </span>
                                        <span className="hidden sm:inline">
                                            via {user.provider}
                                        </span>
                                        <span className="hidden text-xs md:inline">
                                            Joined{' '}
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        disabled={isUpdating}
                                        onClick={() => handleToggleRole(user)}
                                        size="icon-sm"
                                        title={
                                            user.role === 'admin'
                                                ? 'Remove admin'
                                                : 'Make admin'
                                        }
                                        variant="ghost"
                                    >
                                        {user.role === 'admin' ? (
                                            <ShieldOff className="h-4 w-4" />
                                        ) : (
                                            <Shield className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        disabled={isUpdating}
                                        onClick={() => handleToggleActive(user)}
                                        size="icon-sm"
                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                        variant="ghost"
                                    >
                                        {user.is_active ? (
                                            <Ban className="h-4 w-4" />
                                        ) : (
                                            <UserCheck className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        disabled={deletingId === user.id && isDeleting}
                                        loading={deletingId === user.id && isDeleting}
                                        onClick={() => handleDelete(user)}
                                        size="icon-sm"
                                        variant="ghost"
                                    >
                                        {(deletingId === user.id && isDeleting) || (
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
