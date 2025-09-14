"use client";

import { useState, useMemo } from "react";
import {
  useGetUserHistories,
  useDeleteUserHistory,
} from "@/hooks/features/user-histories/use-user-histories";
import {
  Table,
  TableHeader,
  TableRow,
  SortableTableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { AxiosInstance } from "@/lib/axios-instance";
import Link from "next/link";
import type { UserHistory } from "@/types/user-histories";
import { formatRelativeDate } from "@/lib/utils/date-utils";
import { useTableSort } from "@/hooks/use-table-sort";
import { PaginationControls } from "@/components/ui/pagination-controls";

const PAGE_SIZE = 10;

export default function UserHistoriesPage() {
  const {
    data: histories = [],
    isLoading,
    error,
    refetch,
  } = useGetUserHistories();
  const deleteHistory = useDeleteUserHistory();
  const [page, setPage] = useState(1);
  const [pinLoading, setPinLoading] = useState<string | null>(null);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    histories as unknown as Record<string, unknown>[],
  );

  // Histories are already sorted by backend: pinned first, then by createdAt desc
  const sortedHistories = useMemo(() => sortedData, [sortedData]);

  // Pagination
  const totalPages = Math.ceil(sortedHistories.length / PAGE_SIZE);
  const paginatedHistories = sortedHistories.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  ) as unknown as UserHistory[];

  const handlePin = async (id: string, pinned: boolean) => {
    setPinLoading(id);
    try {
      await AxiosInstance.patch(`/api/user-histories/${id}`, {
        pinned: !pinned,
      });
      refetch();
    } finally {
      setPinLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteHistory.mutateAsync(id);
    refetch();
  };

  const renderItemLink = (history: UserHistory) => {
    // If item looks like a domain, link to /sites/[domain]/view, else to /serpmachine?keyword=[item]
    const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(history.item);
    if (isDomain) {
      return (
        <Link
          href={`/sites/${encodeURIComponent(history.item)}/view`}
          className="text-blue-600 hover:underline"
        >
          {history.item}
        </Link>
      );
    }
    return (
      <Link
        href={`/serpmachine?keyword=${encodeURIComponent(history.item)}`}
        className="text-blue-600 hover:underline"
      >
        {history.item}
      </Link>
    );
  };

  const renderDate = (history: UserHistory) => {
    if (history.pinned) {
      return <span className="text-green-600 font-medium">pinned</span>;
    }
    return formatRelativeDate(history.createdAt);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading user histories.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              sortKey="description"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              Description
            </SortableTableHead>
            <SortableTableHead
              sortKey="item"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              Item
            </SortableTableHead>
            <SortableTableHead
              sortKey="cost"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              Cost
            </SortableTableHead>
            <SortableTableHead
              sortKey="createdAt"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              Created
            </SortableTableHead>
            <SortableTableHead
              sortKey="actions"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              Actions
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No user histories found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedHistories.map((history) => {
              const typedHistory = history as UserHistory;
              return (
                <TableRow key={typedHistory.id}>
                  <TableCell>{typedHistory.description}</TableCell>
                  <TableCell>{renderItemLink(typedHistory)}</TableCell>
                  <TableCell>{typedHistory.cost}</TableCell>
                  <TableCell>{renderDate(typedHistory)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant={typedHistory.pinned ? "secondary" : "outline"}
                      size="icon"
                      onClick={() =>
                        handlePin(typedHistory.id, typedHistory.pinned)
                      }
                      disabled={pinLoading === typedHistory.id}
                      title={typedHistory.pinned ? "Unpin" : "Pin"}
                    >
                      {typedHistory.pinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(typedHistory.id)}
                      disabled={deleteHistory.isPending}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalCount={sortedHistories.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
