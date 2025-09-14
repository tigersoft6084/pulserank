"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBillingHistory } from "@/hooks/use-billing-history";

export function BillingHistoryTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  const { data, isLoading, error } = useBillingHistory(
    currentPage,
    pageSize,
    selectedEventType || undefined,
  );
  const billingHistory = data?.data || [];
  const pagination = data?.pagination;

  const formatPrice = (price: number | null, currency: string | null) => {
    if (price === null || currency === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "payment.sale.completed":
        return "bg-green/10 text-green";
      case "payment.sale.failed":
        return "bg-red/10 text-red";
      case "payment.sale.refunded":
        return "bg-blue/10 text-blue";
      case "payment.sale.refund_failed":
        return "bg-orange/10 text-orange";
      case "payment.sale.refund_requested":
        return "bg-purple/10 text-purple";
      case "payment.sale.refund_requested_failed":
        return "bg-gray/10 text-gray-6";
      default:
        return "bg-gray/10 text-gray-6";
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEventTypeFilter = (eventType: string) => {
    setSelectedEventType(eventType === selectedEventType ? "" : eventType);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const eventTypeOptions = [
    "PAYMENT.SALE.COMPLETED",
    "PAYMENT.SALE.FAILED",
    "PAYMENT.SALE.REFUNDED",
    "PAYMENT.SALE.REFUND_FAILED",
    "PAYMENT.SALE.REFUND_REQUESTED",
    "PAYMENT.SALE.REFUND_REQUESTED_FAILED",
    "PAYMENT.SALE.REFUND_REQUESTED_SUCCEEDED",
  ];

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Filter by Event Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {eventTypeOptions.map((eventType) => (
            <button
              key={eventType}
              onClick={() => handleEventTypeFilter(eventType)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                selectedEventType === eventType
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
              )}
            >
              {eventType}
            </button>
          ))}
        </div>
      </div>

      {/* Billing History Table */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
          Billing History
        </h3>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">
            Error loading billing history: {error.message}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 dark:text-gray-400"
                    >
                      No billing history found
                    </TableCell>
                  </TableRow>
                ) : (
                  billingHistory.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-[#eee] dark:border-dark-3"
                    >
                      <TableCell className="font-medium text-dark dark:text-white">
                        <div className="max-w-[200px] truncate">
                          {item.transactionId}
                        </div>
                      </TableCell>
                      <TableCell className="text-dark dark:text-white">
                        <div>
                          <div className="font-medium">{item.customer}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-dark dark:text-white">
                        {item.plan}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-medium",
                            getEventTypeColor(item.eventType),
                          )}
                        >
                          {item.eventType}
                        </span>
                      </TableCell>
                      <TableCell className="text-dark dark:text-white">
                        {formatPrice(item.amount, item.currency)}
                      </TableCell>
                      <TableCell className="text-dark dark:text-white">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-dark dark:text-white">
                        {item.paidAt ? formatDate(item.paidAt) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalCount,
                  )}{" "}
                  of {pagination.totalCount} records
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pagination.hasPreviousPage
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        : "cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                    )}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pageNum === pagination.currentPage
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pagination.hasNextPage
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        : "cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
