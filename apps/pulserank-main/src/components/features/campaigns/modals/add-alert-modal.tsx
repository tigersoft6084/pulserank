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
import { useToast } from "@/hooks/use-toast";
import { useCreateAlert } from "@/hooks/features/campaign/use-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

export function AddAlertModal({
  isOpen,
  onClose,
  campaignId,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}) {
  const t = useTranslations("campaigns.modals.addAlert");
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState(1);

  const {
    mutate: addAlert,
    isPending: addingAlert,
    isSuccess: addAlertSuccess,
    isError: addAlertError,
    error: addAlertErrorData,
  } = useCreateAlert(campaignId);

  useEffect(() => {
    if (addAlertSuccess) {
      toast({
        title: "Success",
        description: t("success"),
      });
      handleClose();
    }
    if (addAlertError) {
      toast({
        title: "Error",
        description: addAlertErrorData?.message,
      });
    }
  }, [addAlertSuccess, addAlertError, addAlertErrorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Error",
        description: t("validation.required"),
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: t("validation.invalid"),
        variant: "destructive",
      });
      return;
    }

    addAlert({ email: email.trim(), frequency: frequency });
  };

  const handleClose = () => {
    setEmail("");
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
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={addingAlert}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">{t("frequency")}</Label>
            <Select
              value={frequency.toString()}
              onValueChange={(value) => setFrequency(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("frequencyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("frequencies.daily")}</SelectItem>
                <SelectItem value="7">{t("frequencies.weekly")}</SelectItem>
                <SelectItem value="30">{t("frequencies.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addingAlert}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={addingAlert || !email.trim()}>
              {addingAlert ? t("adding") : t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
