"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Breadcrumb, BreadcrumbSegment } from "@/components/ui/breadcrumb";
import { useEffect, useState, useMemo } from "react";
import { AxiosInstance } from "@/lib/axios-instance";

const hrefExcludeList = [
  "/organic_keywords",
  "/positions",
  "/serps",
  "/sites",
  "/urls",
  "/user_orders",
];

async function getDynamicName(segments: string[]) {
  if (
    segments[0] === "campaigns" &&
    segments[1] &&
    segments[1] !== "keywords" &&
    segments[1] !== "page"
  ) {
    const res = await AxiosInstance.get(`/api/campaigns/${segments[1]}`);
    return res.data.name;
  } else if (
    segments[0] === "sites" &&
    segments[1] !== "backlinksincommon" &&
    segments[1] !== "compare" &&
    segments[1] !== "list_top_backlinks" &&
    segments[1] !== "same_ip_checker" &&
    segments[1] !== "websiteinterlink" &&
    segments[1] !== "websiteprofiler"
  ) {
    return segments[1];
  }
  return null;
}

export function BreadcrumbNavWithHeading() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const th = useTranslations("heading");

  const [dynamicMapping, setDynamicMapping] = useState<Record<string, string>>(
    {},
  );
  const [breadcrumbSegments, setBreadcrumbSegments] = useState<
    BreadcrumbSegment[]
  >([]);
  const [headingTitle, setHeadingTitle] = useState<string>("");
  const [headingDesc, setHeadingDesc] = useState<string | null>(null);

  // Calculate path variables with useMemo to prevent unnecessary recalculations
  const { pathWithoutLocale, segments } = useMemo(() => {
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const segments = pathWithoutLocale.split("/").filter(Boolean);
    return { pathWithoutLocale, segments };
  }, [pathname]);

  useEffect(() => {
    const fetchDynamicName = async () => {
      const dynamicName = await getDynamicName(segments);
      setDynamicMapping((prev) => ({
        ...prev,
        [segments[1]]: dynamicName,
      }));
    };

    fetchDynamicName();
  }, [pathname, pathWithoutLocale, segments]); // Depend on memoized values

  useEffect(() => {
    const bs = segments.map((segment, index) => {
      let href: string | undefined =
        `/${segments.slice(0, index + 1).join("/")}`;
      if (hrefExcludeList.includes(href)) {
        href = undefined;
      }
      if (index === 1 && segments[0] === "sites" && dynamicMapping[segment]) {
        href = undefined;
      }
      const title = dynamicMapping[segment] || t(segment) || segment;

      return {
        title,
        href: index === segments.length - 1 ? undefined : href,
      };
    });
    setBreadcrumbSegments(bs);

    // Get the base route for translations (without dynamic segments)
    const baseRoute = segments.join(".");

    const ht =
      dynamicMapping[segments[1]] || th(`${baseRoute}.title`) || baseRoute;
    const hd = dynamicMapping[segments[1]]
      ? `View ${dynamicMapping[segments[1]]}`
      : th(`${baseRoute}.description`);
    setHeadingTitle(ht);
    setHeadingDesc(hd);
  }, [dynamicMapping]);

  // Early return after all hooks
  if (pathWithoutLocale === "") {
    return null;
  }

  return (
    pathname.split("/")[2] !== "dashboard" && (
      <div className="space-y-8 mb-4">
        <Breadcrumb segments={breadcrumbSegments} />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{headingTitle}</h1>
          <p className="text-muted-foreground">{headingDesc}</p>
        </div>
      </div>
    )
  );
}
