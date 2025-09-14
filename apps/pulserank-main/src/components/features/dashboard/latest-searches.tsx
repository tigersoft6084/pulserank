import { Button } from "@/components/ui/button";
import { Table2, History, LayoutGrid } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Favicon } from "@/components/ui/favicon";
import Link from "next/link";
import { useGetUserHistories } from "@/hooks/features/user-histories/use-user-histories";
import { formatRelativeDate } from "@/lib/utils/date-utils";
import type { UserHistory } from "@/types/user-histories";
import { useTranslations } from "next-intl";

export function LatestSearches() {
  const t = useTranslations("dashboard.history.latestSearches");
  const { data: histories = [], isLoading } = useGetUserHistories();

  // Get the latest 5 histories (already sorted by backend: pinned first, then by creation date)
  const latestHistories = histories.slice(0, 5);

  const renderActivity = (history: UserHistory) => {
    const isSerpMachine = history.description.includes("SERP machine");

    let activityIcon, href;

    if (isSerpMachine) {
      activityIcon = <History className="w-4 h-4" />;
      href = `/serpmachine?keyword=${encodeURIComponent(history.item)}`;
    } else {
      activityIcon = <LayoutGrid className="w-4 h-4" />;
      href = `/sites/${encodeURIComponent(history.item)}/view`;
    }

    return (
      <div className="flex items-center gap-2">
        {activityIcon}
        <Favicon url={history.item} size={16} />
        <Link href={href} className="text-blue-600 hover:underline truncate">
          {history.item}
        </Link>
      </div>
    );
  };

  const renderDate = (history: UserHistory) => {
    if (history.pinned) {
      return <span className="text-green-600 font-medium">{t("pinned")}</span>;
    }
    return formatRelativeDate(history.createdAt);
  };

  return (
    <Accordion type="single" defaultValue="latest-searches" collapsible>
      <AccordionItem
        value="latest-searches"
        className="border rounded-xl overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline bg-muted p-3">
          <Table2 className="w-6 h-6" />
          <div className="text-lg flex items-center gap-2">{t("title")}</div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 p-4 bg-card items-center">
          {/* Table Header */}
          <div className="w-full grid grid-cols-[2fr,1fr] gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <div>{t("columns.activity")}</div>
            <div className="text-right">{t("columns.date")}</div>
          </div>
          {/* Table Body */}
          {isLoading ? (
            <div className="w-full space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1.5fr] gap-4 text-sm"
                >
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : latestHistories.length > 0 ? (
            <div className="w-full space-y-3">
              {latestHistories.map((history) => (
                <div
                  key={history.id}
                  className="grid grid-cols-[2fr,1.5fr] gap-4 text-sm"
                >
                  <div className="truncate">{renderActivity(history)}</div>
                  <div className="text-right text-muted-foreground">
                    {renderDate(history)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {t("noSearches")}
            </div>
          )}
          <Link href="/user_histories" className="text-center pt-2">
            <Button variant="outline">{t("seeAll")}</Button>
          </Link>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
