"use client";

import { useState } from "react";
import { Button } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  Plan,
} from "@/hooks/use-plans";
import { PlanDialog } from "./plan-dialog";
import { PlanDetailsDialog } from "./plan-details-dialog";
import { PencilSquareIcon, TrashIcon } from "@/assets/icons";
import { PreviewIcon } from "@/assets/icons";
import { CompactAlert } from "@/components/ui-elements/alert";

export function UserPlansTab() {
  const { data: plans = [], isLoading, error } = usePlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleCreatePlan = () => {
    setEditingPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleViewPlan = (plan: Plan) => {
    setViewingPlan(plan);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingPlan) {
      // Check if this is a constraints-only update or a new plan version
      if (data.constraints && Object.keys(data).length === 1) {
        // This is a constraints-only update
        updatePlanMutation.mutate(
          { id: editingPlan.id, data },
          {
            onSuccess: () => {
              setIsModalOpen(false);
              setEditingPlan(undefined);
              setSuccessMessage(
                `Constraints updated for "${editingPlan.name}" successfully!`,
              );
            },
            onError: (error) => {
              setErrorMessage(`Error: ${error.message}`);
              setTimeout(() => setErrorMessage(null), 5000);
            },
          },
        );
      } else {
        // This is a new plan version (price/currency changed)
        // The API will handle PayPal plan creation and old plan deactivation
        createPlanMutation.mutate(data, {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingPlan(undefined);
            setSuccessMessage(
              `New version of "${editingPlan.name}" created successfully!`,
            );
            setTimeout(() => setSuccessMessage(null), 5000);
          },
          onError: (error) => {
            setSuccessMessage(`Error: ${error.message}`);
            setTimeout(() => setSuccessMessage(null), 5000);
          },
        });
      }
    } else {
      createPlanMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSuccessMessage(`Plan "${data.name}" created successfully!`);
          setTimeout(() => setSuccessMessage(null), 5000);
        },
      });
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatInterval = (interval: string) => {
    return interval === "MONTH" ? "Monthly" : "Yearly";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Subscription Plans
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your subscription plans and pricing
            </p>
          </div>
        </div>
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Subscription Plans
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your subscription plans and pricing
            </p>
          </div>
        </div>
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error loading plans: {error.message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Success Message */}

      {successMessage && (
        <CompactAlert
          variant="success"
          title="Successfully Updated"
          dismissible
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <CompactAlert
          variant="error"
          title="Error"
          dismissible
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark dark:text-white">
            Subscription Plans
          </h3>
          <p className="text-sm text-dark-6 dark:text-dark-5">
            Manage your subscription plans and pricing
          </p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead>Plan Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Version Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="border-[#eee] dark:border-dark-3"
              >
                <TableCell>
                  <div>
                    <h5 className="font-medium text-dark dark:text-white">
                      {plan.name}
                    </h5>
                    <p className="text-sm text-dark-6 dark:text-dark-5">
                      {formatInterval(plan.interval)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-dark dark:text-white">
                  {formatPrice(plan.price, plan.currency)}
                </TableCell>
                <TableCell className="text-dark dark:text-white">
                  {plan.subscribers.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium text-green">
                  {formatPrice(plan.revenue, plan.currency)}
                </TableCell>
                <TableCell>
                  <div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-medium",
                        {
                          "bg-green/10 text-green": plan.active,
                          "bg-gray/10 text-gray-6": !plan.active,
                        },
                      )}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                    {!plan.active && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Replaced by newer version
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-x-3.5">
                    <button
                      className="transition-colors hover:text-primary"
                      onClick={() => handleViewPlan(plan)}
                    >
                      <span className="sr-only">View Plan</span>
                      <PreviewIcon className="h-5 w-5" />
                    </button>

                    <button
                      className={cn(
                        "transition-colors",
                        plan.active
                          ? "hover:text-primary"
                          : "cursor-not-allowed text-gray-400",
                      )}
                      onClick={() => plan.active && handleEditPlan(plan)}
                      title={
                        plan.active
                          ? "Create new version of this plan"
                          : "Cannot edit inactive plan"
                      }
                      disabled={!plan.active}
                    >
                      <span className="sr-only">Create New Version</span>
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Plan Features Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-4 text-lg font-bold text-dark dark:text-white">
            Plan Distribution
          </h4>
          <div className="space-y-3">
            {(() => {
              // Calculate subscriber distribution for Freelance, Studio, and Agency plans
              const totalSubscribers = plans.reduce(
                (acc, p) => acc + p.subscribers,
                0,
              );

              // Freelance plans
              const freelancePlans = plans.filter(
                (p) => p.name === "Freelance",
              );
              const freelanceSubscribers = freelancePlans.reduce(
                (acc, p) => acc + p.subscribers,
                0,
              );
              const freelancePercentage =
                totalSubscribers > 0
                  ? ((freelanceSubscribers / totalSubscribers) * 100).toFixed(1)
                  : "0";

              // Studio plans
              const studioPlans = plans.filter((p) => p.name === "Studio");
              const studioSubscribers = studioPlans.reduce(
                (acc, p) => acc + p.subscribers,
                0,
              );
              const studioPercentage =
                totalSubscribers > 0
                  ? ((studioSubscribers / totalSubscribers) * 100).toFixed(1)
                  : "0";

              // Agency plans
              const agencyPlans = plans.filter((p) => p.name === "Agency");
              const agencySubscribers = agencyPlans.reduce(
                (acc, p) => acc + p.subscribers,
                0,
              );
              const agencyPercentage =
                totalSubscribers > 0
                  ? ((agencySubscribers / totalSubscribers) * 100).toFixed(1)
                  : "0";

              return [
                {
                  name: "Freelance Plans",
                  percentage: freelancePercentage,
                  subscribers: freelanceSubscribers,
                },
                {
                  name: "Studio Plans",
                  percentage: studioPercentage,
                  subscribers: studioSubscribers,
                },
                {
                  name: "Agency Plans",
                  percentage: agencyPercentage,
                },
              ];
            })().map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-dark-6 dark:text-dark-5">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.subscribers} subscribers
                  </span>
                </div>
                <span className="text-sm font-medium text-dark dark:text-white">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-4 text-lg font-bold text-dark dark:text-white">
            Revenue Overview
          </h4>
          <div className="space-y-3">
            {(() => {
              // Calculate revenue distribution for Freelance, Studio, and Agency plans
              const totalRevenue = plans.reduce((acc, p) => acc + p.revenue, 0);

              // Freelance plans
              const freelancePlans = plans.filter(
                (p) => p.name === "Freelance",
              );
              const freelanceRevenue = freelancePlans.reduce(
                (acc, p) => acc + p.revenue,
                0,
              );
              const freelancePercentage =
                totalRevenue > 0
                  ? ((freelanceRevenue / totalRevenue) * 100).toFixed(1)
                  : "0";

              // Studio plans
              const studioPlans = plans.filter((p) => p.name === "Studio");
              const studioRevenue = studioPlans.reduce(
                (acc, p) => acc + p.revenue,
                0,
              );
              const studioPercentage =
                totalRevenue > 0
                  ? ((studioRevenue / totalRevenue) * 100).toFixed(1)
                  : "0";

              // Agency plans
              const agencyPlans = plans.filter((p) => p.name === "Agency");
              const agencyRevenue = agencyPlans.reduce(
                (acc, p) => acc + p.revenue,
                0,
              );
              const agencyPercentage =
                totalRevenue > 0
                  ? ((agencyRevenue / totalRevenue) * 100).toFixed(1)
                  : "0";

              return [
                {
                  name: "Freelance Plans",
                  revenue: freelanceRevenue,
                  percentage: freelancePercentage,
                  plans: freelancePlans.length,
                },
                {
                  name: "Studio Plans",
                  revenue: studioRevenue,
                  percentage: studioPercentage,
                  plans: studioPlans.length,
                },
                {
                  name: "Agency Plans",
                  revenue: agencyRevenue,
                  percentage: agencyPercentage,
                  plans: agencyPlans.length,
                },
              ];
            })().map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-dark-6 dark:text-dark-5">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.plans} plan{category.plans !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-green">
                    {formatPrice(category.revenue, "USD")}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Dialog */}
      <PlanDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(undefined);
        }}
        plan={editingPlan}
        onSubmit={handleSubmit}
        isLoading={createPlanMutation.isPending || updatePlanMutation.isPending}
      />

      {/* Plan Details Dialog */}
      <PlanDetailsDialog
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingPlan(null);
        }}
        plan={viewingPlan}
      />
    </div>
  );
}
