import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campaign } from "@/types/campaigns";
import { useTranslations } from "next-intl";

interface SummaryTagFiltersProps {
  campaigns: Campaign[] | undefined;
  keywordTag: string;
  siteTag: string;
  onKeywordTagChange: (tag: string) => void;
  onSiteTagChange: (tag: string) => void;
}

export function SummaryTagFilters({
  campaigns,
  keywordTag,
  siteTag,
  onKeywordTagChange,
  onSiteTagChange,
}: SummaryTagFiltersProps) {
  const t = useTranslations("campaigns.tagFilters");

  // Extract unique keyword tags and site tags from all campaigns
  const keywordTags = useMemo(() => {
    if (!campaigns) return [];
    const tags = new Set<string>();

    campaigns.forEach((campaign) => {
      campaign.keywords.forEach((k) => {
        if (typeof k === "string") {
          // For string keywords, we don't have tags
          return;
        }
        // For object keywords, extract tags
        if (k.tags && Array.isArray(k.tags)) {
          k.tags.forEach((tag) => {
            if (tag && tag.trim() !== "") {
              tags.add(tag);
            }
          });
        }
      });
    });

    return Array.from(tags).sort();
  }, [campaigns]);

  const siteTags = useMemo(() => {
    if (!campaigns) return [];
    const tags = new Set<string>();

    campaigns.forEach((campaign) => {
      campaign.sites.forEach((s) => {
        if (typeof s === "string") {
          // For string sites, we don't have tags
          return;
        }
        // For object sites, extract tags
        if (s.tags && Array.isArray(s.tags)) {
          s.tags.forEach((tag) => {
            if (tag && tag.trim() !== "") {
              tags.add(tag);
            }
          });
        }
      });
    });

    return Array.from(tags).sort();
  }, [campaigns]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={keywordTag === "" ? "__all__" : keywordTag}
        onValueChange={(v) => onKeywordTagChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t("keywordTagsPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t("allKeywordTags")}</SelectItem>
          {keywordTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={siteTag === "" ? "__all__" : siteTag}
        onValueChange={(v) => onSiteTagChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t("siteTagsPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t("allSiteTags")}</SelectItem>
          {siteTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
