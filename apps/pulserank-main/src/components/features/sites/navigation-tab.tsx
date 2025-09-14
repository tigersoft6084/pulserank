import { cn } from "@/lib/utils";
import {
  Anchor,
  AppWindow,
  Flag,
  Languages,
  Link2,
  List,
  Package,
  RockingChair,
  Sheet,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function NavigationTab() {
  const t = useTranslations("domainLayout");

  const tabs = [
    {
      label: t("tabs.offlineData"),
      href: "/com_en/sites/view/example.com",
      icon: <Sheet />,
    },
    {
      label: t("tabs.backlinksHistory"),
      href: "/backlinks/exampleId",
      icon: <Link2 />,
    },
    {
      label: t("tabs.topBacklinks"),
      href: "/sites/top/exampleId",
      icon: <RockingChair />,
    },
    {
      label: t("tabs.anchors"),
      href: "/sites/anchors/exampleId",
      icon: <Anchor />,
    },
    {
      label: t("tabs.domains"),
      href: "/sites/refdomains/exampleId",
      icon: <AppWindow />,
    },
    {
      label: t("tabs.topical"),
      href: "/sites/topics/exampleId",
      icon: <Flag />,
    },
    {
      label: t("tabs.content"),
      href: "/sites/keywords/exampleId",
      icon: <Languages />,
    },
    {
      label: t("tabs.urlEntities"),
      href: "/sites/url_entities/exampleId",
      icon: <Package />,
    },
    {
      label: t("tabs.topPages"),
      href: "/sites/top_pages/exampleId",
      icon: <List />,
    },
    {
      label: t("tabs.topPages"),
      href: "/sites/top_pages/exampleId",
      icon: <List />,
    },
  ];

  const url = useSearchParams();
  const urlParam = url.get("url");
  const pathname = usePathname();
  // Remove locale from pathname
  const pathWithoutLocale = pathname.split("/").slice(2).join("/");
  const isCurrentTab = (href: string) => `/${pathWithoutLocale}` === href;

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-md">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "text-sm px-2 py-1 rounded-md",
              isCurrentTab(tab.href) &&
                "bg-card text-foreground font-medium shadow-sm",
            )}
          >
            {tab.label}
          </Link>
        ))}
        {urlParam && (
          <Link
            href={`sites/view?${urlParam}`}
            className="text-sm px-3 py-2 rounded-md"
          >
            {t("identityCard")}
          </Link>
        )}
        {urlParam && (
          <Link
            href={`sites/view?${urlParam}`}
            className="text-sm px-3 py-2 rounded-md"
          >
            {t("keywords")}
          </Link>
        )}
      </div>
    </div>
  );
}
