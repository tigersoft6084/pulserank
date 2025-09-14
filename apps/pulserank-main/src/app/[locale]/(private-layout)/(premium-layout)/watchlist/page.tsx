"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  useGetWatchlist,
  useUpdateEmailAlert,
  useDeleteTrackingSite,
  useBulkDeleteTrackingSites,
  type TrackingSite,
} from "@/hooks/features/watchlist/use-watchlist";
import { formatRelativeDate } from "@/lib/utils/date-utils";
import { Trash2 } from "lucide-react";
import { useTableSort } from "@/hooks/use-table-sort";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WatchlistPage() {
  const t = useTranslations("watchlist");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TrackingSite | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { data: watchlistData, isLoading } = useGetWatchlist();
  const updateEmailAlert = useUpdateEmailAlert();
  const deleteTrackingSite = useDeleteTrackingSite();
  const bulkDeleteTrackingSites = useBulkDeleteTrackingSites();

  const trackingSites = watchlistData?.trackingSites || [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    trackingSites as unknown as Record<string, unknown>[],
  );
  const maxItems = 50;
  const currentItems = trackingSites.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(trackingSites.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleEmailAlertToggle = (
    trackingSiteId: string,
    emailAlert: boolean,
  ) => {
    updateEmailAlert.mutate({ trackingSiteId, emailAlert });
  };

  const handleDeleteItem = (item: TrackingSite) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      deleteTrackingSite.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteTrackingSites.mutate(selectedItems);
    setSelectedItems([]);
    setBulkDeleteDialogOpen(false);
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      domain: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      subdomain: "bg-green-100 text-green-800 hover:bg-green-200",
      page: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    };

    return (
      <Badge
        className={
          typeColors[type as keyof typeof typeColors] ||
          "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }
      >
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Explanation Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t("explanation.title")}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            {t.rich("explanation.description", {
              backlinksview: (chunks) => (
                <Link href="/backlinks" className="underline">
                  {chunks}
                </Link>
              ),
              automaticretrieval: (chunks) => (
                <span className="font-bold">{chunks}</span>
              ),
            })}
          </p>
          <p className="text-sm">
            {t.rich("explanation.deleteWarning", {
              nomoreavailable: (chunks) => (
                <span className="font-bold">{chunks}</span>
              ),
            })}
          </p>
          <p className="text-sm">{t("explanation.addInstruction")}</p>
        </CardContent>
      </Card>

      {/* URLs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold mb-1">
              {currentItems === 1
                ? t("header.following", {
                    current: currentItems,
                    max: maxItems,
                  })
                : t("header.followingPlural", {
                    current: currentItems,
                    max: maxItems,
                  })}
            </h2>
            {selectedItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteTrackingSites.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Stop Following ({selectedItems.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedItems.length === trackingSites.length &&
                      trackingSites.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <SortableTableHead
                  sortKey="url"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.url")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="type"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.type")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="createdAt"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.created")}
                </SortableTableHead>
                <TableHead>{t("table.columns.emailAlerts")}</TableHead>
                <TableHead>{t("table.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : trackingSites.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {t("table.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((item) => {
                  const typedItem = item as unknown as TrackingSite;
                  return (
                    <TableRow key={typedItem.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(typedItem.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(typedItem.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Favicon url={typedItem.url} size={16} />
                          <a
                            href={`https://${typedItem.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline truncate max-w-[300px]"
                          >
                            {typedItem.url}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(typedItem.type)}</TableCell>
                      <TableCell>
                        {formatRelativeDate(typedItem.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={typedItem.email_alert}
                          onCheckedChange={(checked) =>
                            handleEmailAlertToggle(typedItem.id, checked)
                          }
                          disabled={updateEmailAlert.isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(typedItem)}
                          disabled={deleteTrackingSite.isPending}
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
          {watchlistData?.pagination && (
            <div className="mt-4 text-sm text-muted-foreground">
              {t("pagination.page", {
                current: watchlistData.pagination.page,
                total: watchlistData.pagination.pages,
                count: trackingSites.length,
                totalCount: watchlistData.pagination.total,
                start:
                  (watchlistData.pagination.page - 1) *
                    watchlistData.pagination.limit +
                  1,
                end: Math.min(
                  watchlistData.pagination.page *
                    watchlistData.pagination.limit,
                  watchlistData.pagination.total,
                ),
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("table.stopFollowing")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("table.confirmDelete", { url: itemToDelete?.url || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("table.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("table.stopFollowing")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("table.stopFollowingMultiple")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("table.confirmBulkDelete", { count: selectedItems.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("table.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("table.stopFollowingAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
