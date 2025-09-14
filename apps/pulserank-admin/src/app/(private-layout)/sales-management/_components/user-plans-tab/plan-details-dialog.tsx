"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plan } from "@/hooks/use-plans";
import { PlanConstraintsDisplay } from "./plan-constraints-display";
import {
  Calendar,
  User,
  PieChart,
  HomeIcon,
  CheckIcon,
  BellIcon,
} from "@/assets/icons";

interface PlanDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export function PlanDetailsDialog({
  isOpen,
  onClose,
  plan,
}: PlanDetailsDialogProps) {
  if (!plan) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatInterval = (interval: string) => {
    return interval === "MONTH" ? "Monthly" : "Yearly";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden bg-white dark:bg-dark">
        <DialogHeader className="border-b border-gray-200 bg-white pb-4 dark:border-gray-700 dark:bg-dark">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-dark dark:text-white">
            <HomeIcon className="h-6 w-6 text-primary" />
            Plan Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 flex-1 space-y-8 overflow-y-auto px-1">
          {/* Plan Header Card */}
          <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-6 dark:from-primary/10 dark:to-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark dark:text-white">
                  {plan.name}
                </h2>
                <p className="mt-1 text-dark-6 dark:text-dark-5">
                  {formatInterval(plan.interval)} billing cycle
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(plan.price, plan.currency)}
                </div>
                <div className="text-sm text-dark-6 dark:text-dark-5">
                  per {plan.interval.toLowerCase()}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  plan.status === "Active"
                    ? "bg-green/10 text-green"
                    : "bg-gray/10 text-gray-6"
                }`}
              >
                {plan.status === "Active" ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <BellIcon className="h-4 w-4" />
                )}
                {plan.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Basic Information Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Basic Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700">
                  <span className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Currency
                  </span>
                  <span className="font-semibold text-dark dark:text-white">
                    {plan.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700">
                  <span className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Created
                  </span>
                  <span className="font-semibold text-dark dark:text-white">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Statistics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Subscribers
                    </span>
                  </div>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {plan.subscribers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Revenue
                    </span>
                  </div>
                  <span className="font-bold text-green-700 dark:text-green-300">
                    {formatPrice(plan.revenue, plan.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PayPal Integration Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                PayPal Integration
              </h3>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <label className="mb-2 block text-sm font-medium text-dark-6 dark:text-dark-5">
                PayPal Plan ID
              </label>
              <p className="rounded-md bg-white px-3 py-2 font-mono text-sm text-dark shadow-sm dark:bg-gray-800 dark:text-white">
                {plan.paypalPlanId}
              </p>
            </div>
          </div>

          {/* Constraints Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Plan Constraints
              </h3>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <PlanConstraintsDisplay
                constraints={plan.constraints}
                isEditable={false}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
