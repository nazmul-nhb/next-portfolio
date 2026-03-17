'use client';

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { TableIcon } from 'lucide-react';
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

interface DataTableProps<Data, Value> {
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
