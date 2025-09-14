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
import { useUserOrders } from "@/hooks/use-user-orders";

export function SubscriptionTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, error } = useUserOrders(currentPage, pageSize);
  const userOrders = data?.data || [];
  const pagination = data?.pagination;

  const formatPrice = (price: number, currency: string) => {
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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green/10 text-green";
      case "pending":
        return "bg-orange/10 text-orange";
      case "cancelled":
      case "cancelled":
        return "bg-red/10 text-red";
      case "past_due":
        return "bg-yellow/10 text-yellow";
      default:
        return "bg-gray/10 text-gray-6";
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
        Subscriptions History
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
          Error loading subscriptions: {error.message}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead>Subscription ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 dark:text-gray-400"
                  >
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                userOrders.map((subscription) => (
                  <TableRow
                    key={subscription.id}
                    className="border-[#eee] dark:border-dark-3"
                  >
                    <TableCell className="font-medium text-dark dark:text-white">
                      {subscription.paypalSubscriptionId}
                    </TableCell>
                    <TableCell className="text-dark dark:text-white">
                      <div>
                        <div className="font-medium">
                          {subscription.customer}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-dark dark:text-white">
                      <div>
                        <div className="font-medium">{subscription.plan}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.interval === "MONTH"
                            ? "Monthly"
                            : "Yearly"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-dark dark:text-white">
                      {formatPrice(subscription.amount, subscription.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-sm font-medium",
                          getStatusColor(subscription.status),
                        )}
                      >
                        {subscription.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-dark dark:text-white">
                      {formatDate(subscription.createdAt)}
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
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalCount,
                )}{" "}
                of {pagination.totalCount} subscriptions
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
  );
}
