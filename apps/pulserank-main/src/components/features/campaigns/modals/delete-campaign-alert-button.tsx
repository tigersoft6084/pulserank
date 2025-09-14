import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteCampaignConfirmProps {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  deleting: boolean;
  handleDelete: () => void;
  isIcon?: boolean;
}

export function DeleteCampaignAlertButton({
  showDeleteDialog,
  setShowDeleteDialog,
  deleting,
  handleDelete,
  isIcon = false,
}: DeleteCampaignConfirmProps) {
  const t = useTranslations("campaigns.modals.deleteCampaign");

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogTrigger asChild>
        {isIcon ? (
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="w-9 h-9"
          >
            <Trash2 className="text-destructive w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
          >
            {t("delete")}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
