import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  SortableTableHead,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddAlertModal } from "@/components/features/campaigns/modals/add-alert-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDeleteAlert } from "@/hooks/features/campaign/use-alert";
import { CampaignAlert } from "@/types/campaigns";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks/use-table-sort";

export default function AlertsSection({
  campaignId,
  alerts,
}: {
  campaignId: string;
  alerts: CampaignAlert[];
}) {
  const t = useTranslations("campaigns.alertsSection");
  const { toast } = useToast();
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const {
    mutate: deleteAlert,
    isPending: deletingAlert,
    isSuccess: deletingAlertSuccess,
    isError: deletingAlertError,
    error: deletingAlertErrorData,
  } = useDeleteAlert(campaignId);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    alerts as unknown as Record<string, unknown>[],
  );

  function handleAddAlert() {
    setShowAddAlertModal(true);
  }

  useEffect(() => {
    if (deletingAlertSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
    }
    if (deletingAlertError) {
      toast({
        title: "Error",
        description: deletingAlertErrorData?.message,
      });
    }
  }, [deletingAlertSuccess, deletingAlertError, deletingAlertErrorData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button size="sm" variant="outline" onClick={handleAddAlert}>
          <Mail className="w-4 h-4 mr-1" /> {t("addEmailAlert")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="email"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.email")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="frequency"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.frequency")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="createdAt"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.created")}
              </SortableTableHead>
              <TableHead className="w-20">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {t("noAlerts")}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((alert) => {
                const typedAlert = alert as unknown as CampaignAlert;
                return (
                  <TableRow key={typedAlert.id}>
                    <TableCell>{typedAlert.email}</TableCell>
                    <TableCell>{typedAlert.frequency}</TableCell>
                    <TableCell>
                      {new Date(typedAlert.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteAlert(typedAlert.id)}
                        disabled={deletingAlert}
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
        <AddAlertModal
          isOpen={showAddAlertModal}
          onClose={() => setShowAddAlertModal(false)}
          campaignId={campaignId}
        />
      </CardContent>
    </Card>
  );
}
