import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  className?: string;
  cell: (row: T, rowIndex: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, rowIndex: number) => string;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyState = "No data available.", className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowKey(row, rowIndex)} className="border-t border-border">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3 text-sm text-foreground", column.className)}>
                      {column.cell(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="border-t border-border">
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
