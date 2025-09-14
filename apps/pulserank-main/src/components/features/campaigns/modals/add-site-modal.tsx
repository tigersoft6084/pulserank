"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateSites } from "@/hooks/features/campaign/use-site";
import { CreateSiteRequest } from "@/types/campaigns";
import { useTranslations } from "next-intl";

// Function to determine site type based on URL format
function determineSiteType(url: string): "page" | "subdomain" | "domain" {
  const cleanUrl = url.trim().toLowerCase();

  // Remove protocol if present
  const urlWithoutProtocol = cleanUrl.replace(/^https?:\/\//, "");

  // Check if it's a specific page (contains path)
  if (urlWithoutProtocol.includes("/") && !urlWithoutProtocol.endsWith("/")) {
    return "page";
  }

  // Check if it's a subdomain (contains dots but not a path)
  const parts = urlWithoutProtocol.split(".");
  if (parts.length > 2 && !urlWithoutProtocol.includes("/")) {
    return "subdomain";
  }

  // Default to domain
  return "domain";
}

export function AddSiteModal({
  isOpen,
  onClose,
  campaignId,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}) {
  const t = useTranslations("campaigns.modals.addSite");
  const { toast } = useToast();

  const [sites, setSites] = useState("");
  const [tags, setTags] = useState("");

  const {
    mutate: addSites,
    isPending: addingSites,
    isSuccess: addSitesSuccess,
    isError: addSitesError,
    error: addSitesErrorData,
  } = useCreateSites(campaignId);

  useEffect(() => {
    if (addSitesSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
      handleClose();
    }
    if (addSitesError) {
      toast({
        title: "Error",
        variant: "destructive",
        description: addSitesErrorData?.message,
      });
    }
  }, [addSitesSuccess, addSitesError, addSitesErrorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sites.trim()) {
      toast({
        title: "Error",
        description: t("validation.required"),
        variant: "destructive",
      });
      return;
    }

    const siteList = sites
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((url) => ({
        url,
        type: determineSiteType(url),
        tags: tags.split(",").map((t) => t.trim()),
      }));

    const requestData: CreateSiteRequest = {
      sites: siteList,
    };

    addSites(requestData);
  };

  const handleClose = () => {
    setSites("");
    setTags("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sites">{t("sites")}</Label>
            <Textarea
              id="sites"
              value={sites}
              onChange={(e) => setSites(e.target.value)}
              placeholder={t("sitesPlaceholder")}
              disabled={addingSites}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {t("explanation.title")}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>{t("explanation.domain")}</li>
              <li>{t("explanation.subdomain")}</li>
              <li>{t("explanation.page")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t("tags")}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t("tagsPlaceholder")}
              disabled={addingSites}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addingSites}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={addingSites || !sites.trim()}>
              {addingSites ? t("adding") : t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
