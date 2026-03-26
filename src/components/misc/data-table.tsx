'use client';

import {
    type Column,
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type RowData,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, TableIcon } from 'lucide-react';
import { useState } from 'react';
import EmptyData from '@/components/misc/empty-data';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps<Data, Value = unknown> {
    columns: ColumnDef<Data, Value>[];
    data: Data[];
}

export function DataTable<Data, Value>({ columns, data }: DataTableProps<Data, Value>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: data,
        columns: columns,
        getCoreRowModel: getCoreRowModel<Data>(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel<Data>(),
        state: { sorting },
    });

    return (
        <div className="overflow-hidden rounded-md border">
            <Table className="border-collapse">
                <TableHeader className="select-none">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                data-state={row.getIsSelected() && 'selected'}
                                key={row.id}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell className="h-24 text-center" colSpan={columns.length}>
                                <EmptyData
                                    description="No data to display."
                                    Icon={TableIcon}
                                    title="No data"
                                />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export type SortableProps<Data extends RowData, Value = unknown> = {
    header: string;
    column: Column<Data, Value>;
    className?: string;
};

export function SortableColumn<Data extends RowData, Value>({
    column,
    header,
    className,
}: SortableProps<Data, Value>) {
    return (
        <div
            className={cn('flex items-center cursor-pointer gap-2', className)}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            {header}
            <ArrowUpDown className="size-4" />
        </div>
    );
}
