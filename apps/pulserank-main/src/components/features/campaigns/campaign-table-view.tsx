import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteCampaignAlertButton } from "./modals/delete-campaign-alert-button";
import { Campaign } from "@/types/campaigns";
import Link from "next/link";
import { useCampaignsStore } from "@/store/campaigns-store";
import { useTableSort } from "@/hooks/use-table-sort";

export function CampaignTableView({
  campaigns,
  showDeleteDialog,
  setShowDeleteDialog,
  deletingCampaign,
  deleteCampaign,
}: {
  campaigns: Campaign[] | undefined;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  deletingCampaign: boolean;
  deleteCampaign: (id: string) => void;
}) {
  const t = useTranslations("campaigns");
  const { setSelectedTab } = useCampaignsStore();
  const router = useRouter();

  // Add sorting functionality with custom sorting for nested arrays
  const campaignsWithCounts =
    campaigns?.map((campaign) => ({
      ...campaign,
      keywords: campaign.keywords.length,
      sites: campaign.sites.length,
    })) || [];

  const { sortedData, sortConfig, handleSort } =
    useTableSort(campaignsWithCounts);

  // Map back to original campaign data for rendering
  const sortedCampaigns = sortedData.map((sortedItem) =>
    campaigns?.find((c) => c.id === sortedItem.id),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="name"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("name")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="keywords"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("keywords.keywords")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="sites"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("sites")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="createdAt"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("created")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="updatedAt"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("updated")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="actions"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
            className="w-20"
          >
            {t("actions")}
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCampaigns &&
          sortedCampaigns.length > 0 &&
          sortedCampaigns.map((campaign) => (
            <TableRow key={campaign?.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/campaigns/${campaign?.id}`}
                  onClick={() => setSelectedTab("before-after-site")}
                >
                  {campaign?.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/campaigns/${campaign?.id}`}
                  onClick={() => setSelectedTab("before-after-keyword")}
                >
                  {campaign?.keywords.length}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/campaigns/${campaign?.id}`}
                  onClick={() => setSelectedTab("before-after-url")}
                >
                  {campaign?.sites.length}
                </Link>
              </TableCell>
              <TableCell>
                {campaign?.createdAt &&
                  new Date(campaign?.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {campaign?.updatedAt &&
                  new Date(campaign?.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9"
                    onClick={() => {
                      setSelectedTab("settings");
                      router.push(`/campaigns/${campaign?.id}`);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <DeleteCampaignAlertButton
                    showDeleteDialog={showDeleteDialog}
                    setShowDeleteDialog={setShowDeleteDialog}
                    deleting={deletingCampaign}
                    handleDelete={() => deleteCampaign(campaign?.id || "")}
                    isIcon={true}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
