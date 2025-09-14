import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignDetail } from "@/types/campaigns";
import { useTranslations } from "next-intl";

interface TagFiltersProps {
  campaignDetail: CampaignDetail | undefined;
  keywordTag: string;
  siteTag: string;
  onKeywordTagChange: (tag: string) => void;
  onSiteTagChange: (tag: string) => void;
}

export function TagFilters({
  campaignDetail,
  keywordTag,
  siteTag,
  onKeywordTagChange,
  onSiteTagChange,
}: TagFiltersProps) {
  const t = useTranslations("campaigns.tagFilters");

  // Extract unique keyword tags and site tags
  const keywordTags = useMemo(() => {
    if (!campaignDetail) return [];
    const tags = new Set<string>();
    campaignDetail.keywords.forEach((k) =>
      k.tags.forEach((t) => {
        if (t && t.trim() !== "") {
          tags.add(t);
        }
      }),
    );
    return Array.from(tags);
  }, [campaignDetail]);

  const siteTags = useMemo(() => {
    if (!campaignDetail) return [];
    const tags = new Set<string>();
    campaignDetail.sites.forEach((s) =>
      s.tags.forEach((t) => {
        if (t && t.trim() !== "") {
          tags.add(t);
        }
      }),
    );
    return Array.from(tags);
  }, [campaignDetail]);

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
