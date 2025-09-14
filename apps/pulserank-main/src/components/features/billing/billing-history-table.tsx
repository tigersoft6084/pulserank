import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/date-utils";
import { useTableSort } from "@/hooks/use-table-sort";

interface BillingHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  eventType: string;
  paidAt: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  data?: {
    id: string;
    state: string;
    amount: {
      total: string;
      currency: string;
    };
    create_time: string;
  };
  userOrder: {
    paypalSubscriptionId: string;
  };
}

interface BillingHistoryTableProps {
  billingHistory: BillingHistory[];
}

export function BillingHistoryTable({
  billingHistory,
}: BillingHistoryTableProps) {
  const t = useTranslations("user_orders.billing.billingHistory");

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    billingHistory as unknown as Record<string, unknown>[],
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case "PAYMENT.SALE.COMPLETED":
        return "Payment Completed";
      case "PAYMENT.SALE.REFUNDED":
        return "Payment Refunded";
      case "BILLING.SUBSCRIPTION.CANCELLED":
        return "Subscription Cancelled";
      case "BILLING.SUBSCRIPTION.CREATED":
        return "Subscription Created";
      case "BILLING.SUBSCRIPTION.UPDATED":
        return "Subscription Updated";
      default:
        return eventType
          .replace(/\./g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    sortKey="paidAt"
                    currentSortKey={sortConfig?.key || null}
                    currentDirection={sortConfig?.direction || null}
                    onSort={handleSort}
                  >
                    {t("paidAt")}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="eventType"
                    currentSortKey={sortConfig?.key || null}
                    currentDirection={sortConfig?.direction || null}
                    onSort={handleSort}
                  >
                    {t("eventType")}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="amount"
                    currentSortKey={sortConfig?.key || null}
                    currentDirection={sortConfig?.direction || null}
                    onSort={handleSort}
                  >
                    {t("amount")}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="transactionId"
                    currentSortKey={sortConfig?.key || null}
                    currentDirection={sortConfig?.direction || null}
                    onSort={handleSort}
                  >
                    {t("transactionId")}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="subscriptionId"
                    currentSortKey={sortConfig?.key || null}
                    currentDirection={sortConfig?.direction || null}
                    onSort={handleSort}
                  >
                    {t("subscriptionId")}
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => {
                  const typedItem = item as unknown as BillingHistory;
                  return (
                    <TableRow key={typedItem.id}>
                      <TableCell>
                        {typedItem.paidAt
                          ? formatDate(typedItem.paidAt)
                          : formatDate(typedItem.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getEventTypeDisplay(typedItem.eventType)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(typedItem.amount, typedItem.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {typedItem.transactionId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {typedItem?.userOrder?.paypalSubscriptionId}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t("noBillingHistory")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
