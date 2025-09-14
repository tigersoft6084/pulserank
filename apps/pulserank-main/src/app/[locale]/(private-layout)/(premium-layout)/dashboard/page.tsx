"use client";

import { Globe, Type, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNextStep } from "nextstepjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/components/features/dashboard/search-input";
import { LastLinks } from "@/components/features/dashboard/last-links";
import { LatestSearches } from "@/components/features/dashboard/latest-searches";
import { Button } from "@/components/ui/button";
import { extractRootDomain } from "@/lib/utils/url-utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [website, setWebsite] = useState("");

  const {
    startNextStep,
    // closeNextStep,
    // currentTour,
    // currentStep,
    // setCurrentStep,
    // isNextStepVisible,
  } = useNextStep();

  const searchKeyword = () => {
    if (keyword.trim()) {
      router.push(`/serpmachine?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const searchWebsite = () => {
    if (website.trim()) {
      router.push(`/sites/${extractRootDomain(website.trim())}/view`);
    }
  };

  return (
    <div className="relative container max-w-6xl mx-auto py-4 px-4 space-y-8">
      {/* Tour Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => startNextStep("dashboard")}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {t("startTour")}
        </Button>
      </div>

      {/* Search Section */}
      <div className="space-y-6">
        <SearchInput
          title={t("search.keyword.title")}
          placeholder={t("search.keyword.placeholder")}
          icon={
            <Type className="w-8 h-8 border rounded-md shadow-sm p-1 bg-card" />
          }
          showFlag={true}
          dataTourId="keyword-input"
          searchFunction={searchKeyword}
          value={keyword}
          onChange={setKeyword}
        />

        <SearchInput
          title={t("search.website.title")}
          placeholder={t("search.website.placeholder")}
          icon={
            <Globe className="w-8 h-8 border rounded-md shadow-sm p-1 bg-card" />
          }
          dataTourId="website-input"
          searchFunction={searchWebsite}
          value={website}
          onChange={setWebsite}
        />
      </div>

      {/* History Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Last Links Created */}
        <div className="col-span-3">
          <LastLinks />
        </div>

        {/* Latest Searches */}
        <div className="col-span-2">
          <LatestSearches />
        </div>
      </div>
    </div>
  );
}
