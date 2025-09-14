"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OffsiteDataPanel } from "@/components/features/urls/info/offsite-data-panel";
import { DomainInfoPanel } from "@/components/features/urls/info/domain-info-panel";
import { AnchorTextPanel } from "@/components/features/urls/info/anchor-text-panel";
import { useGetURLInfo } from "@/hooks/features/urls/use-url";
import { useViewUrlStore } from "@/store/view-url-store";
import { UrlInput } from "@/components/features/urls/url-input";
import { useTranslations } from "next-intl";

export default function UrlInfoPage() {
  const { url, submittedUrl, setUrl, setSubmittedUrl } = useViewUrlStore();
  const t = useTranslations("urlInfo");

  const { data: urlInfo, isLoading, error } = useGetURLInfo(submittedUrl);

  const handleSubmit = (submittedUrl: string) => {
    setSubmittedUrl(submittedUrl);
  };

  return (
    <div className="space-y-6">
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText={t("input.submitButton")}
        placeholder={t("input.placeholder")}
      />

      {!submittedUrl ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("input.enterUrlMessage")}
        </div>
      ) : isLoading ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("offsiteData")}</CardTitle>
          </CardHeader>
          <CardContent>{t("loading")}</CardContent>
        </Card>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {t("error")}
          </AlertDescription>
        </Alert>
      ) : urlInfo ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("offsiteData")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex lg:flex-row flex-col gap-4">
              <OffsiteDataPanel offsiteData={urlInfo.offsiteData} />
              <DomainInfoPanel domainInfo={urlInfo.domainInfo} />
              <AnchorTextPanel anchorTextData={urlInfo.anchorTextData} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { url: submittedUrl })}
        </div>
      )}
    </div>
  );
}
