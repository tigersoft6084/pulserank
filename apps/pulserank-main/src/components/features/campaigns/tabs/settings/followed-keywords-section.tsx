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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { AddKeywordModal } from "@/components/features/campaigns/modals/add-keyword-modal";
import { KeywordWithHistory } from "@/types/campaigns";
import { useToast } from "@/hooks/use-toast";
import { useDeleteKeyword } from "@/hooks/features/campaign/use-keyword";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks/use-table-sort";

export default function FollowedKeywordsSection({
  campaignId,
  keywords,
}: {
  campaignId: string;
  keywords: KeywordWithHistory[];
}) {
  const t = useTranslations("campaigns.followedKeywordsSection");
  const { toast } = useToast();
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false);
  const {
    mutate: deleteKeyword,
    isPending: deletingKeyword,
    isSuccess: deletingKeywordSuccess,
    isError: deletingKeywordError,
    error: deletingKeywordErrorData,
  } = useDeleteKeyword(campaignId);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    keywords as unknown as Record<string, unknown>[],
  );

  function handleAddKeyword() {
    setShowAddKeywordModal(true);
  }

  useEffect(() => {
    if (deletingKeywordSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
    }
    if (deletingKeywordError) {
      toast({
        title: "Error",
        description: deletingKeywordErrorData?.message,
      });
    }
  }, [
    deletingKeywordSuccess,
    deletingKeywordError,
    deletingKeywordErrorData,
    t,
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button size="sm" variant="outline" onClick={handleAddKeyword}>
          <Plus className="w-4 h-4 mr-1" /> {t("addKeyword")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="keyword"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keyword")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="search_volume"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.volume")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="cpc"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.cpc")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="competition"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.competition")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="base"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.base")}
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
                sortKey="frequency"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.freq")}
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
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  {t("noKeywords")}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((k) => {
                const typedKeyword = k as unknown as KeywordWithHistory;
                return (
                  <TableRow key={typedKeyword.id}>
                    <TableCell>{typedKeyword.keyword}</TableCell>
                    <TableCell>{typedKeyword.search_volume}</TableCell>
                    <TableCell>{typedKeyword.cpc}</TableCell>
                    <TableCell>{typedKeyword.competition}</TableCell>
                    <TableCell>{typedKeyword.base}</TableCell>
                    <TableCell>{typedKeyword.tags.join(", ")}</TableCell>
                    <TableCell>{typedKeyword.frequency}</TableCell>
                    <TableCell>
                      {new Date(typedKeyword.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteKeyword(typedKeyword.id)}
                        disabled={deletingKeyword}
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
        <AddKeywordModal
          isOpen={showAddKeywordModal}
          onClose={() => setShowAddKeywordModal(false)}
          campaignId={campaignId}
        />
      </CardContent>
    </Card>
  );
}
