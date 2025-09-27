"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreateCampaignModal } from "@/components/features/campaigns/modals/create-campaign-modal";
import type { CreateKeywordRequest, Campaign } from "@/types/campaigns";
import { useGetCampaigns } from "@/hooks/features/campaign/use-campaign";
import { useCreateKeywords } from "@/hooks/features/campaign/use-keyword";
import { BASE_DATA } from "@/lib/config";
import { filterValidKeywords } from "@/lib/utils/url-utils";

export default function CampaignsKeywordsPage() {
  const t = useTranslations("campaigns.keywords");
  const { toast } = useToast();

  // Form state
  const [base, setBase] = useState("fr_fr");
  const [keywords, setKeywords] = useState("");
  const [tags, setTags] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [importance, setImportance] = useState("now");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: campaigns = [], isLoading: campaignsLoading } =
    useGetCampaigns();

  const {
    mutate: createKeywords,
    isPending: creatingKeywords,
    isSuccess: keywordsCreated,
    isError: keywordsCreationError,
    error: keywordsCreationErrorData,
  } = useCreateKeywords(campaignId as string);

  const handleCampaignChange = (value: string) => {
    if (value === "addCampaign") {
      setIsCreateModalOpen(true);
    } else {
      setCampaignId(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignId) {
      toast({
        title: "Error",
        description: "Please select a campaign",
        variant: "destructive",
      });
      return;
    }

    // Create translation functions for the validator
    const validationTranslations = {
      empty: "Please enter at least one keyword",
      invalidFormat: (line: number, keyword: string) =>
        `Line ${line}: "${keyword}" - Invalid format`,
    };

    // Validate and filter keywords
    const validationResult = filterValidKeywords(
      keywords,
      validationTranslations
    );

    if (!validationResult.isValid) {
      toast({
        title: "Error",
        description: validationResult.errors[0] || "No valid keywords found",
        variant: "destructive",
      });
      return;
    }

    // Show warnings for invalid keywords if any
    if (validationResult.errors.length > 0) {
      toast({
        title: "Warning",
        description: `Some keywords were invalid and skipped. Processing ${validationResult.validKeywords.length} valid keywords.`,
        variant: "default",
      });
    }

    const frequencyMap: { [key: string]: number } = {
      daily: 1,
      "2days": 2,
      "7days": 7,
      "14days": 14,
      "30days": 30,
    };

    const keywordsData: CreateKeywordRequest = {
      keywords: validationResult.validKeywords,
      base,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      frequency: frequencyMap[frequency],
    };

    createKeywords(keywordsData);
  };

  useEffect(() => {
    if (keywordsCreated) {
      toast({
        title: "Success",
        description: "Keywords created successfully",
      });
      setKeywords("");
      setTags("");
      setCampaignId("");
      setFrequency("daily");
      setImportance("now");
    }
    if (keywordsCreationError) {
      toast({
        title: "Error",
        description: keywordsCreationErrorData?.message,
        variant: "destructive",
      });
    }
  }, [keywordsCreated, keywordsCreationError, keywordsCreationErrorData]);

  return (
    <div className="container pt-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mx-auto">
            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">{t("base")}</Label>
              <Select value={base} onValueChange={setBase}>
                <SelectTrigger>
                  <SelectValue placeholder="fr_fr" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BASE_DATA).map((base) => (
                    <SelectItem key={base} value={base}>
                      {base}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">{t("keywords")}</Label>
              <Textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t("keywordsPlaceholder")}
                className="min-h-[120px]"
                disabled={creatingKeywords}
              />
            </div>

            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">{t("tags")}</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 p-2.5 text-sm"
                placeholder={t("tagsPlaceholder")}
                disabled={creatingKeywords}
              />
            </div>

            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">{t("campaign")}</Label>
              <Select value={campaignId} onValueChange={handleCampaignChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("chooseCampaign")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addCampaign">
                    + {t("addCampaign")}
                  </SelectItem>
                  {campaignsLoading ? (
                    <SelectItem value="loading" disabled>
                      {t("loadingCampaigns")}
                    </SelectItem>
                  ) : campaigns.length === 0 ? (
                    <SelectItem value="no-campaigns" disabled>
                      {t("noCampaignsFound")}
                    </SelectItem>
                  ) : (
                    campaigns.map((campaignItem: Campaign) => (
                      <SelectItem key={campaignItem.id} value={campaignItem.id}>
                        {campaignItem.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">{t("frequency")}</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("followUpDaily", {
                      remaining: 499,
                      total: 500,
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    {t("followUpDaily", { remaining: 499, total: 500 })}
                  </SelectItem>
                  <SelectItem value="2days">
                    {t("followUpXDays", {
                      days: 2,
                      remaining: 998,
                      total: 1000,
                    })}
                  </SelectItem>
                  <SelectItem value="7days">
                    {t("followUpXDays", {
                      days: 7,
                      remaining: 3493,
                      total: 3500,
                    })}
                  </SelectItem>
                  <SelectItem value="14days">
                    {t("followUpXDays", {
                      days: 14,
                      remaining: 6986,
                      total: 7000,
                    })}
                  </SelectItem>
                  <SelectItem value="30days">
                    {t("followUpXDays", {
                      days: 30,
                      remaining: 14970,
                      total: 15000,
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Label className="pt-2.5 w-20 text-right">
                {t("importance")}
              </Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger>
                  <SelectValue placeholder={t("importNow")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">{t("importNow")}</SelectItem>
                  <SelectItem value="later">{t("importLater")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="gap-2"
                disabled={creatingKeywords}
              >
                {creatingKeywords ? "Creating..." : t("followKeywords")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
