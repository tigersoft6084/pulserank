"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateCampaign } from "@/hooks/features/campaign/use-campaign";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
}: CreateCampaignModalProps) {
  const t = useTranslations("campaigns");
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");

  const {
    mutate: createCampaign,
    isSuccess: campaignCreated,
    isPending: campaignCreating,
    isError: campaignCreationError,
    error,
  } = useCreateCampaign();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast({
        title: "Error",
        description: "Campaign name is required",
        variant: "destructive",
      });
      return;
    }
    createCampaign({ name: campaignName.trim() });
  };

  const handleClose = () => {
    setCampaignName("");
    onClose();
  };

  useEffect(() => {
    if (campaignCreated) {
      handleClose();
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    }
  }, [campaignCreated, toast]);

  useEffect(() => {
    if (campaignCreationError) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    }
  }, [campaignCreationError, toast, error]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t("create")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">{t("name")}</Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder={t("namePlaceholder")}
              disabled={campaignCreating}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={campaignCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={campaignCreating || !campaignName.trim()}
            >
              {campaignCreating ? "Creating..." : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
