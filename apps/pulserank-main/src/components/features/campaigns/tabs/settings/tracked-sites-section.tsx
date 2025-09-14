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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddSiteModal } from "@/components/features/campaigns/modals/add-site-modal";
import { SiteForCampaign } from "@/types/campaigns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDeleteSite } from "@/hooks/features/campaign/use-site";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks/use-table-sort";

export default function TrackedSitesSection({
  campaignId,
  sites,
}: {
  campaignId: string;
  sites: SiteForCampaign[];
}) {
  const t = useTranslations("campaigns.trackedSitesSection");
  const { toast } = useToast();
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const {
    mutate: deleteSite,
    isPending: deletingSite,
    isSuccess: deletingSiteSuccess,
    isError: deletingSiteError,
    error: deletingSiteErrorData,
  } = useDeleteSite(campaignId);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    sites as unknown as Record<string, unknown>[],
  );

  function handleAddSite() {
    setShowAddSiteModal(true);
  }

  useEffect(() => {
    if (deletingSiteSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
    }
    if (deletingSiteError) {
      toast({
        title: "Error",
        description: deletingSiteErrorData?.message,
      });
    }
  }, [deletingSiteSuccess, deletingSiteError, deletingSiteErrorData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button size="sm" variant="outline" onClick={handleAddSite}>
          <Plus className="w-4 h-4 mr-1" /> {t("addSite")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="url"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.url")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="type"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.type")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="tags"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.tags")}
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
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  {t("noSites")}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((s) => {
                const typedSite = s as unknown as SiteForCampaign;
                return (
                  <TableRow key={typedSite.id}>
                    <TableCell>{typedSite.url}</TableCell>
                    <TableCell>{typedSite.type}</TableCell>
                    <TableCell>{typedSite.tags.join(", ")}</TableCell>
                    <TableCell>
                      {new Date(typedSite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteSite(typedSite.id)}
                        disabled={deletingSite}
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
        <AddSiteModal
          isOpen={showAddSiteModal}
          onClose={() => setShowAddSiteModal(false)}
          campaignId={campaignId}
        />
      </CardContent>
    </Card>
  );
}
