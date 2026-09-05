import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  onExport?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export function EnhancedDataTable<T>({
  data,
  columns,
  loading = false,
  searchable = false,
  onExport,
  pagination,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    console.log("EnhancedDataTable - data prop:", data);
    console.log("EnhancedDataTable - typeof data:", typeof data);
    console.log(
      "EnhancedDataTable - Array.isArray(data):",
      Array.isArray(data),
    );

    let filtered = data || [];
    console.log("EnhancedDataTable - initial filtered:", filtered);
    console.log(
      "EnhancedDataTable - Array.isArray(filtered):",
      Array.isArray(filtered),
    );

    // Apply search filter
    if (searchable && searchTerm) {
      filtered = filtered.filter((item) =>
        columns.some(
          (column) =>
            column.filterable &&
            String(item[column.key as keyof T])
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Apply sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    console.log("EnhancedDataTable - final filteredAndSortedData:", filtered);
    console.log(
      "EnhancedDataTable - Array.isArray(final):",
      Array.isArray(filtered),
    );

    return filtered;
  }, [data, searchTerm, sortBy, sortOrder]);

  // Calculate pagination
  const totalPages = pagination
    ? Math.ceil((pagination.total || 0) / (pagination.limit || 25))
    : 1;
  const startIndex = pagination
    ? (pagination.page - 1) * (pagination.limit || 25)
    : 0;
  const endIndex = pagination
    ? Math.min(startIndex + (pagination.limit || 25), pagination.total || 0)
    : (data || []).length;
  const paginatedData = pagination
    ? Array.isArray(filteredAndSortedData)
      ? filteredAndSortedData.slice(startIndex, endIndex)
      : []
    : Array.isArray(filteredAndSortedData)
      ? filteredAndSortedData
      : [];

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-soft border border-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Data Management
            </h3>

            {/* Search */}
            {searchable && (
              <div className="flex items-center">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            )}
            <button className="flex items-center px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-neutral-100" : ""
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {column.label}
                    {column.sortable && (
                      <>
                        {sortBy === column.key && sortOrder === "asc" && (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        {sortBy === column.key && sortOrder === "desc" && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {sortBy !== column.key && (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-neutral-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={(row as any).id || index}
                  className="hover:bg-neutral-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900"
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 bg-card border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-700">
              Showing {startIndex + 1} to {endIndex} of {pagination.total}{" "}
              results
            </span>
            <select
              value={pagination.limit?.toString() || "25"}
              onChange={(e) =>
                pagination.onLimitChange &&
                pagination.onLimitChange(Number(e.target.value))
              }
              className="border border-neutral-200 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                pagination.onPageChange &&
                pagination.onPageChange(Math.max(1, pagination.page - 1))
              }
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-500 bg-card border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <span className="text-sm text-neutral-700">
              Page {pagination.page} of {totalPages}
            </span>

            <button
              onClick={() =>
                pagination.onPageChange &&
                pagination.onPageChange(
                  Math.min(totalPages, pagination.page + 1),
                )
              }
              disabled={pagination.page >= totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-500 bg-card border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
