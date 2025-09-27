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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateKeywords } from "@/hooks/features/campaign/use-keyword";
import { BASE_DATA } from "@/lib/config";
import { useTranslations } from "next-intl";
import { filterValidKeywords } from "@/lib/utils/url-utils";

export function AddKeywordModal({
  isOpen,
  onClose,
  campaignId,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}) {
  const t = useTranslations("campaigns.modals.addKeyword");
  const { toast } = useToast();

  const [keywords, setKeywords] = useState("");
  const [base, setBase] = useState("fr_fr");
  const [tags, setTags] = useState("");
  const [frequency, setFrequency] = useState("1");

  const {
    mutate: addKeyword,
    isPending: addingKeyword,
    isSuccess: addKeywordSuccess,
    isError: addKeywordError,
    error: addKeywordErrorData,
  } = useCreateKeywords(campaignId);

  useEffect(() => {
    if (addKeywordSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
      handleClose();
    }
    if (addKeywordError) {
      toast({
        title: "Error",
        description: addKeywordErrorData?.message,
      });
    }
  }, [addKeywordError, addKeywordErrorData, addKeywordSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create translation functions for the validator
    const validationTranslations = {
      empty: t("validation.required"),
      invalidFormat: (line: number, keyword: string) =>
        `Line ${line}: "${keyword}" - Invalid format`,
    };

    // Validate and filter keywords
    const validationResult = filterValidKeywords(
      keywords,
      validationTranslations
    );

    if (!validationResult.isValid) {
      toast({
        title: "Error",
        description: validationResult.errors[0] || t("validation.required"),
        variant: "destructive",
      });
      return;
    }

    // Show warnings for invalid keywords if any
    if (validationResult.errors.length > 0) {
      toast({
        title: "Warning",
        description: `Some keywords were invalid and skipped. Processing ${validationResult.validKeywords.length} valid keywords.`,
        variant: "default",
      });
    }

    const requestData = {
      keywords: validationResult.validKeywords,
      base,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      frequency: parseInt(frequency),
    };

    await addKeyword(requestData);
  };

  const handleClose = () => {
    setKeywords("");
    setTags("");
    setFrequency("1");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">{t("keywords")}</Label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={t("keywordsPlaceholder")}
              disabled={addingKeyword}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base">{t("base")}</Label>
            <Select value={base} onValueChange={setBase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BASE_DATA).map((base) => (
                  <SelectItem key={base} value={base}>
                    {base}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t("tags")}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t("tagsPlaceholder")}
              disabled={addingKeyword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">{t("frequency")}</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("frequencies.daily")}</SelectItem>
                <SelectItem value="2">{t("frequencies.every2Days")}</SelectItem>
                <SelectItem value="7">{t("frequencies.weekly")}</SelectItem>
                <SelectItem value="14">
                  {t("frequencies.every2Weeks")}
                </SelectItem>
                <SelectItem value="30">{t("frequencies.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addingKeyword}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={addingKeyword || !keywords.trim()}>
              {addingKeyword ? t("adding") : t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
