"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useViewUrlStore } from "@/store/view-url-store";
import { useEffect } from "react";
import { extractRootDomain } from "@/lib/utils/url-utils";
import { CaseUpper, LayoutGrid } from "lucide-react";

export default function UrlLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("urlLayout");

  const tabs = [
    {
      label: t("tabs.info"),
      href: "/urls/info",
    },
    {
      label: t("tabs.referringDomains"),
      href: "/urls/referring-domains",
    },
    {
      label: t("tabs.anchors"),
      href: "/urls/anchors",
    },
    {
      label: t("tabs.topBacklinks"),
      href: "/urls/backlinks",
    },
  ];

  const url = useSearchParams();
  const urlParam = url.get("url");
  const { submittedUrl, setSubmittedUrl } = useViewUrlStore();
  const pathname = usePathname();

  // Remove locale from pathname
  const pathWithoutLocale = pathname.split("/").slice(2).join("/");
  const isCurrentTab = (href: string) => `/${pathWithoutLocale}`.includes(href);

  // Sync URL parameter with store
  useEffect(() => {
    if (urlParam) {
      setSubmittedUrl(urlParam);
    }
  }, [urlParam, setSubmittedUrl]);

  // Extract root domain from submitted URL
  const rootDomain = submittedUrl ? extractRootDomain(submittedUrl) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "text-sm text-muted-foreground font-semibold px-3 py-1 rounded-md",
                isCurrentTab(tab.href) &&
                  "bg-card text-foreground font-medium shadow-sm",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {rootDomain && (
          <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Link
              href={`/sites/${rootDomain}/view`}
              className="text-sm text-muted-foreground font-semibold px-3 py-1 rounded-md flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {t("identityCard")}
            </Link>

            <Link
              href={`/urls/keywords`}
              className={cn(
                "text-sm text-muted-foreground font-semibold px-3 py-1 rounded-md flex items-center gap-2",
                isCurrentTab(`/urls/keywords`) &&
                  "bg-card text-foreground font-medium shadow-sm",
              )}
            >
              <CaseUpper className="w-4 h-4" />
              {t("tabs.keywords")}
            </Link>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
