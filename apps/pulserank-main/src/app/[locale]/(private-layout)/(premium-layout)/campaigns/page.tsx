"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LayoutGrid, List, Plus, Search, Sheet } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import { useCampaignsStore } from "@/store/campaigns-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateCampaignModal } from "@/components/features/campaigns/modals/create-campaign-modal";
import { CampaignCard } from "@/components/features/campaigns/campaign-detail-card";
import { toast } from "@/hooks/use-toast";
import {
  useDeleteCampaign,
  useGetCampaigns,
} from "@/hooks/features/campaign/use-campaign";
import { CampaignTableView } from "@/components/features/campaigns/campaign-table-view";
import { CampaignSummaryView } from "@/components/features/campaigns/campaign-summary-view";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CampaignsPage() {
  const t = useTranslations("campaigns");

  // Use Zustand store for viewMode persistence
  const { viewMode, setViewMode } = useCampaignsStore();

  // Initialize state from searchParams
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: campaigns,
    isLoading: fetchingCampaigns,
    error: fetchingCampaignsError,
    refetch: refetchCampaigns,
  } = useGetCampaigns(debouncedSearchTerm);

  const {
    mutate: deleteCampaign,
    isPending: deletingCampaign,
    isSuccess: campaignDeleted,
    isError: campaignDeleteError,
    error: campaignDeleteErrorData,
  } = useDeleteCampaign();

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    if (campaignDeleteError) {
      toast({
        title: t("settings"),
        description: campaignDeleteErrorData?.message,
        variant: "destructive",
      });
    }
    if (campaignDeleted) {
      toast({
        title: t("settings"),
        description: t("Campaign deleted successfully"),
      });
    }
    setShowDeleteDialog(false);
  }, [campaignDeleted, campaignDeleteError, campaignDeleteErrorData]);

  if (fetchingCampaignsError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-red-500">{t("error loading campaigns")}</p>
          <Button onClick={() => refetchCampaigns()} className="mt-2">
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          className="gap-2 h-10"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {t("create")}
        </Button>

        <div className="flex items-center gap-2">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "detailed" ? "default" : "ghost"}
                  className="w-9 h-9"
                  onClick={() => setViewMode("detailed")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Detailed View</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  className="w-9 h-9"
                  onClick={() => setViewMode("compact")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Compact View</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "summary" ? "default" : "ghost"}
                  className="w-9 h-9"
                  onClick={() => setViewMode("summary")}
                >
                  <Sheet className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Summary View</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Loading State */}
      {fetchingCampaigns && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Campaigns List */}
      {!fetchingCampaigns && (
        <>
          {viewMode === "detailed" && (
            <div className="grid grid-cols-1 gap-4">
              {campaigns &&
                campaigns.length > 0 &&
                campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaignId={campaign.id}
                    name={campaign.name}
                  />
                ))}
            </div>
          )}
          {viewMode === "compact" && (
            <CampaignTableView
              campaigns={campaigns}
              showDeleteDialog={showDeleteDialog}
              setShowDeleteDialog={setShowDeleteDialog}
              deletingCampaign={deletingCampaign}
              deleteCampaign={deleteCampaign}
            />
          )}
          {viewMode === "summary" && (
            <CampaignSummaryView campaigns={campaigns} />
          )}
        </>
      )}

      {/* Empty State */}
      {!fetchingCampaigns && campaigns && campaigns.length === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? t("no campaigns found matching your search")
                  : t("no campaigns yet")}
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t("create")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Campaign */}
      {!fetchingCampaigns && campaigns && campaigns?.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-center py-6">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {t("create")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
