import React from "react";

interface DataTableProps {
  children: React.ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          {children}
        </table>
      </div>
    </div>
  );
}

interface DataTableHeaderProps {
  children: React.ReactNode;
}

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-medium text-xs uppercase tracking-wider">
      <tr>{children}</tr>
    </thead>
  );
}

interface DataTableBodyProps {
  children: React.ReactNode;
}

export function DataTableBody({ children }: DataTableBodyProps) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
}

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableRow({ children, className = "" }: DataTableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors group h-10 ${className}`}>
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}

export function DataTableCell({ children, className = "", isHeader = false }: DataTableCellProps) {
  if (isHeader) {
    return (
      <th className={`px-4 py-3 whitespace-nowrap ${className}`}>
        {children}
      </th>
    );
  }
  return (
    <td className={`px-4 py-2 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
