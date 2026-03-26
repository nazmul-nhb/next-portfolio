'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { Chronos, formatDate } from 'nhb-toolbox';
import { Fragment } from 'react/jsx-runtime';
import { DataTable, SortableColumn } from '@/components/misc/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ExpenseItem } from '@/types/expenses';
import { ReceiptGallery } from './ReceiptGallery';

type ExpenseTableProps = {
    deletingEntry: boolean;
    deletingEntryId: number | null;
    entries: ExpenseItem[];
    money: (value: number) => string;
    handleDeleteEntry: (id: number) => void;
};

export default function ExpenseTable({
    deletingEntry,
    deletingEntryId,
    entries,
    handleDeleteEntry,
    money,
}: ExpenseTableProps) {
    const columns: ColumnDef<ExpenseItem>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => <SortableColumn column={column} header="Title" />,
            cell: ({
                row: {
                    original: { title, description },
                },
            }) => {
                return (
                    <div>
                        <p className="font-medium">{title}</p>
                        {description && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <SortableColumn column={column} header="Type" />,
            cell: ({
                row: {
                    original: { type },
                },
            }) => <div className="capitalize">{type}</div>,
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => (
                <SortableColumn
                    className="justify-end text-right"
                    column={column}
                    header="Amount"
                />
            ),
            cell: ({
                row: {
                    original: { type, amount },
                },
            }) => {
                return (
                    <div
                        className={`font-semibold text-right ${
                            type === 'income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {type === 'income' ? '+' : '-'}
                        {money(amount)}
                    </div>
                );
            },
        },
        {
            accessorKey: 'entry_date',
            header: ({ column }) => <SortableColumn column={column} header="Entry" />,
            cell: ({
                row: {
                    original: { entry_date },
                },
            }) => (
                <div className="text-muted-foreground">
                    {formatDate({ date: entry_date, format: 'mmm DD, YYYY hh:mm a' })}
                </div>
            ),
        },
        {
            accessorKey: 'receipts',
            header: 'Proofs',
            cell: ({
                row: {
                    original: { receipts },
                },
            }) => (
                <div className="text-muted-foreground">
                    {receipts.length > 0 ? (
                        <ReceiptGallery
                            maxPreview={4}
                            receipts={receipts.map((item) => item.image_url)}
                        />
                    ) : (
                        'No proofs'
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <SortableColumn column={column} header="Created" />,
            cell: ({
                row: {
                    original: { created_at },
                },
            }) => (
                <div className="text-muted-foreground">
                    {formatDate({ date: created_at, format: 'mmm DD, YYYY hh:mm a' })}
                </div>
            ),
        },
        {
            accessorKey: 'id',
            header: () => <div className="text-right">Action</div>,
            cell: ({
                row: {
                    original: { id },
                },
            }) => (
                <div className="text-right">
                    <Button
                        disabled={deletingEntry && deletingEntryId === id}
                        loading={deletingEntry && deletingEntryId === id}
                        onClick={() => handleDeleteEntry(id)}
                        size="icon-sm"
                        variant="destructive"
                    >
                        {(deletingEntry && deletingEntryId === id) || (
                            <Trash2 className="size-4" />
                        )}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Fragment>
            <div className="hidden overflow-x-auto rounded-xl border border-border/60 bg-card md:block">
                <DataTable columns={columns} data={entries} />
            </div>

            <div className="grid gap-3 md:hidden">
                {entries.map((entry) => {
                    const chr = new Chronos(entry.entry_date);

                    return (
                        <Card key={entry.id}>
                            <CardContent className="space-y-3 pt-5 pb-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{entry.title}</p>
                                        {entry.description && (
                                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                                {entry.description}
                                            </p>
                                        )}
                                    </div>
                                    <p
                                        className={`text-sm font-semibold ${
                                            entry.type === 'income'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {entry.type === 'income' ? '+' : '-'}
                                        {money(entry.amount)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="capitalize">{entry.type}</span>
                                    <span>{chr.format('mmm DD, YYYY hh:mm a')}</span>
                                </div>
                                {entry.receipts.length > 0 && (
                                    <ReceiptGallery
                                        maxPreview={8}
                                        receipts={entry.receipts.map((item) => item.image_url)}
                                    />
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        disabled={deletingEntry && deletingEntryId === entry.id}
                                        loading={deletingEntry && deletingEntryId === entry.id}
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        size="default"
                                        variant="destructive"
                                    >
                                        {(deletingEntry && deletingEntryId === entry.id) || (
                                            <Trash2 className="size-4 mb-px" />
                                        )}
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </Fragment>
    );
}
