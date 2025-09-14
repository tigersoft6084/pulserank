import { Button } from "@/components/ui/button";
import { Table2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Favicon } from "@/components/ui/favicon";
import Link from "next/link";
import { useGetBacklinks } from "@/hooks/features/backlinks/use-backlinks";
import { useTranslations } from "next-intl";

export function LastLinks() {
  const t = useTranslations("dashboard.history.lastLinks");
  const { data: backlinksData, isLoading } = useGetBacklinks(1, 10); // Get first 10 backlinks

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderUrl = (url: string) => {
    return (
      <div className="flex items-center gap-2">
        <Favicon url={url} size={16} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline truncate"
        >
          {url}
        </a>
      </div>
    );
  };

  const renderTarget = (targetUrl: string) => {
    return (
      <div className="flex items-center justify-center">
        <Favicon url={targetUrl} size={16} />
      </div>
    );
  };

  return (
    <Accordion type="single" defaultValue="last-links" collapsible>
      <AccordionItem
        value="last-links"
        className="border rounded-xl overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline bg-muted p-3">
          <Table2 className="w-6 h-6" />
          <div className="text-lg flex items-center gap-2">{t("title")}</div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 p-4 bg-card items-center">
          {/* Table Header */}
          <div className="w-full grid grid-cols-[2fr,1fr,auto,1fr] gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <div>{t("columns.url")}</div>
            <div>{t("columns.anchor")}</div>
            <div className="text-center">{t("columns.target")}</div>
            <div className="text-right">{t("columns.date")}</div>
          </div>
          {/* Table Body */}
          {isLoading ? (
            <div className="w-full space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1fr,auto,1fr] gap-4 text-sm"
                >
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded mx-auto"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : backlinksData?.data && backlinksData.data.length > 0 ? (
            <div className="w-full space-y-3">
              {backlinksData.data.slice(0, 5).map((backlink, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr,1fr,auto,1fr] gap-4 text-sm"
                >
                  <div className="truncate">{renderUrl(backlink.url)}</div>
                  <div className="truncate" title={backlink.anchor}>
                    {backlink.anchor || "[Empty]"}
                  </div>
                  <div>{renderTarget(backlink.targetUrl)}</div>
                  <div className="text-right">
                    {formatDate(backlink.foundDate)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4 space-y-2">
              <p>{t("noLinks")}</p>
              <p className="text-xs">{t("noLinksDescription")}</p>
            </div>
          )}
          <Link href="/backlinks" className="text-center pt-2">
            <Button variant="outline">{t("seeAll")}</Button>
          </Link>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
