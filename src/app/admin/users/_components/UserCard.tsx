import {
    Ban,
    CheckCircle,
    Clock,
    Crown,
    LogIn,
    Mail,
    Shield,
    ShieldOff,
    Trash2,
    UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from 'nhb-toolbox';
import { useState } from 'react';
import { confirmToast } from '@/components/misc/confirm';
import SmartTooltip from '@/components/misc/smart-tooltip';
import UserAvatar from '@/components/misc/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import type { RawUser } from '@/types/users';

type Props = {
    userData: RawUser;
};

export default function UserCard({ userData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { mutate: updateUser, isPending: isUpdating } = useApiMutation<
        unknown,
        { user_id: number; role?: UserRole; is_active?: boolean }
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

    const handleToggleRole = (user: RawUser) => {
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

    const handleToggleActive = (user: RawUser) => {
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

    const handleDelete = (user: RawUser) => {
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

    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-shadow hover:shadow-md',
                !userData.is_active && 'opacity-60'
            )}
            key={userData.id}
        >
            {/* Role indicator strip */}
            <div
                className={cn(
                    'absolute inset-x-0 top-0 h-1',
                    userData.role === 'admin' ? 'bg-amber-500' : 'bg-primary/30'
                )}
            />

            <CardContent className="p-4 pt-5">
                {/* Top row: avatar + badges + actions */}
                <div className="flex items-start justify-between gap-3">
                    <Link
                        className="group flex items-center gap-3 min-w-0"
                        href={`/users/${userData.id}`}
                    >
                        <UserAvatar
                            className="size-10 shrink-0 ring-2 ring-border transition-shadow group-hover:ring-primary/50"
                            image={userData.profile_image}
                            name={userData.name}
                        />
                        <div className="min-w-0">
                            <p className="truncate font-medium leading-tight group-hover:underline">
                                {userData.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {userData.email}
                            </p>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-0.5">
                        <SmartTooltip
                            content={userData.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            trigger={
                                <Button
                                    disabled={isUpdating}
                                    onClick={() => handleToggleRole(userData)}
                                    size="icon-sm"
                                    variant="ghost"
                                >
                                    {userData.role === 'admin' ? (
                                        <ShieldOff className="size-4" />
                                    ) : (
                                        <Shield className="size-4" />
                                    )}
                                </Button>
                            }
                        />
                        <SmartTooltip
                            content={userData.is_active ? 'Deactivate' : 'Activate'}
                            trigger={
                                <Button
                                    disabled={isUpdating}
                                    onClick={() => handleToggleActive(userData)}
                                    size="icon-sm"
                                    variant="ghost"
                                >
                                    {userData.is_active ? (
                                        <Ban className="h-4 w-4" />
                                    ) : (
                                        <UserCheck className="h-4 w-4" />
                                    )}
                                </Button>
                            }
                        />
                        <SmartTooltip
                            content="Delete user"
                            trigger={
                                <Button
                                    disabled={deletingId === userData.id && isDeleting}
                                    loading={deletingId === userData.id && isDeleting}
                                    onClick={() => handleDelete(userData)}
                                    size="icon-sm"
                                    variant="ghost"
                                >
                                    {(deletingId === userData.id && isDeleting) || (
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {userData.role === 'admin' && (
                        <Badge
                            className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                            variant="outline"
                        >
                            <Crown className="size-3" />
                            Admin
                        </Badge>
                    )}
                    {!userData.is_active && <Badge variant="destructive">Inactive</Badge>}
                    {userData.email_verified ? (
                        <Badge
                            className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                            variant="outline"
                        >
                            <CheckCircle className="size-3" />
                            Verified
                        </Badge>
                    ) : (
                        <Badge
                            className="gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400"
                            variant="outline"
                        >
                            <Mail className="size-3" />
                            Unverified
                        </Badge>
                    )}
                </div>

                {/* Meta row */}
                <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <LogIn className="size-3" />
                        {userData.provider}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate({
                            date: userData.created_at,
                            format: 'mmm DD, yyyy',
                        })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
