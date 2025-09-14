"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/features/billing/status-badge";
import { formatDate } from "@/lib/utils/date-utils";
import { usePlans } from "@/hooks/features/subscription/use-plan";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useUpdateSubscription,
  useCancelSubscription,
  useUpdatePlan,
} from "@/hooks/features/subscription/use-subscription";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
}
interface UserOrder {
  id: string;
  userId: string;
  planId: string;
  paypalSubscriptionId: string;
  status: string;
  startedAt: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
  logs: string[];
  plan: Plan;
}

interface CurrentPlanCardProps {
  subscription: UserOrder | null;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const t = useTranslations("user_orders.billing.currentPlan");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const { data: plans } = usePlans();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: updateSubscription } = useUpdateSubscription(
    searchParams.get("plan_id") || "",
    searchParams.get("subscription_id") || "",
  );
  const { mutate: cancelSubscription, isPending: isCancelling } =
    useCancelSubscription();
  const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan();
  // if searchParas contains success=true, toast success
  useEffect(() => {
    try {
      const success = searchParams.get("success");
      const subscriptionId = searchParams.get("subscription_id");
      if (success === "true" && subscriptionId) {
        updateSubscription();
      }
      if (success === "false") {
        toast({
          title: "Error",
          description: "Failed to update plan",
          variant: "destructive",
        });
      }
    } finally {
      router.push("/user_orders/billing");
    }
  }, []);
  const handleUpdatePlan = (newPlanId: string) => {
    updatePlan(newPlanId, {
      onSuccess: (data) => {
        setShowUpdateDialog(false);
        setSelectedPlan("");
        if (typeof window !== "undefined") {
          window.location.href = data.approveLink;
        }
      },
      onError: (error) => {
        console.error("Error updating plan:", error);
        toast({
          title: "Error",
          description: "Failed to update plan",
          variant: "destructive",
        });
      },
    });
  };

  const handleCancelPlan = () => {
    cancelSubscription(cancellationReason, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Plan cancelled successfully",
        });
        setCancellationReason("");
        setShowCancellationDialog(false);
      },
      onError: (error) => {
        console.error("Error cancelling plan:", error);
        toast({
          title: "Error",
          description: "Failed to cancel plan",
          variant: "destructive",
        });
        setShowCancellationDialog(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-6">
            {subscription.status === "CANCELLED" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      {t("subscriptionCancelled")}
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {t("subscriptionCancelledDescription")}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("planName")}
                </Label>
                <div className="font-medium">
                  {subscription.plan.name}{" "}
                  {subscription.plan.interval === "YEAR" ? "Yearly" : "Monthly"}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("planStatus")}
                </Label>
                <div>
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("startDate")}
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(subscription.startedAt)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("nextBilling")}
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {subscription.currentPeriodEnd
                    ? formatDate(subscription.currentPeriodEnd)
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Dialog
                open={showUpdateDialog}
                onOpenChange={(open) => {
                  setShowUpdateDialog(open);
                  if (!open) setSelectedPlan("");
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={subscription.status !== "ACTIVE"}
                    onClick={() => setShowUpdateDialog(true)}
                  >
                    {subscription.status === "CANCELLED"
                      ? "Plan Cancelled"
                      : "Update Plan"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("updateSubscriptionPlan")}</DialogTitle>
                    <DialogDescription>
                      {t("updateSubscriptionDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan">{t("selectNewPlan")}</Label>
                      <Select onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("choosePlan")} />
                        </SelectTrigger>
                        <SelectContent>
                          {plans?.map((plan) => {
                            return [
                              <SelectItem
                                key={`${plan.name}-month`}
                                value={plan.id}
                              >
                                {plan.name} - ${plan.price}/
                                {plan.interval.toLowerCase()}
                                {plan.interval === "YEAR"
                                  ? " (2 months free)"
                                  : ""}
                              </SelectItem>,
                            ];
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => handleUpdatePlan(selectedPlan)}
                      disabled={isUpdating || !selectedPlan}
                    >
                      {isUpdating ? t("updating") : t("updatePlanButton")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog
                open={showCancellationDialog}
                onOpenChange={setShowCancellationDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={subscription.status === "CANCELLED"}
                  >
                    {subscription.status === "CANCELLED"
                      ? "Plan Cancelled"
                      : "Cancel Plan"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {subscription.status === "CANCELLED"
                        ? "Subscription Already Cancelled"
                        : "Cancel Subscription"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {subscription.status === "CANCELLED"
                        ? "Your subscription has already been cancelled. You will lose access to premium features at the end of your current billing period."
                        : "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {subscription.status !== "CANCELLED" && (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cancellation-reason">
                            {t("cancellationReason")}
                          </Label>
                          <Textarea
                            id="cancellation-reason"
                            placeholder={t("cancellationReasonPlaceholder")}
                            value={cancellationReason}
                            onChange={(e) =>
                              setCancellationReason(e.target.value)
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => {
                            setCancellationReason("");
                            setShowCancellationDialog(false);
                          }}
                        >
                          {t("keepSubscription")}
                        </AlertDialogCancel>
                        <Button
                          onClick={handleCancelPlan}
                          variant="destructive"
                          disabled={isCancelling}
                        >
                          {isCancelling
                            ? t("cancelling")
                            : t("cancelPlanButton")}
                        </Button>
                      </AlertDialogFooter>
                    </>
                  )}
                  {subscription.status === "CANCELLED" && (
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("close")}</AlertDialogCancel>
                    </AlertDialogFooter>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">{t("noActiveSubscription")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
