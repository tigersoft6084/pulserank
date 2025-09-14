"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui-elements/button";
import { Plan, CreatePlanData, UpdatePlanData } from "@/hooks/use-plans";
import { PlanConstraintsDisplay } from "./plan-constraints-display";
import { Calendar } from "@/assets/icons";
import { Info } from "lucide-react";
import { DataTableInputs } from "@/components/FormElements/DataTableInputs";

interface PlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
  onSubmit: (data: CreatePlanData | UpdatePlanData) => void;
  isLoading?: boolean;
}

export function PlanDialog({
  isOpen,
  onClose,
  plan,
  onSubmit,
  isLoading,
}: PlanDialogProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    price: plan?.price || 0,
    interval: plan?.interval || "MONTH",
    currency: plan?.currency || "USD",
    paypalPlanId: plan?.paypalPlanId || "",
    active: plan?.active ?? true,
  });

  const [constraints, setConstraints] = useState<Record<string, any>>(
    plan?.constraints || {},
  );

  const [originalData, setOriginalData] = useState({
    price: plan?.price || 0,
    currency: plan?.currency || "USD",
    constraints: plan?.constraints || {},
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        currency: plan.currency,
        paypalPlanId: plan.paypalPlanId,
        active: plan.active,
      });
      setConstraints(plan.constraints);
      setOriginalData({
        price: plan.price,
        currency: plan.currency,
        constraints: plan.constraints,
      });
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan) {
      // Creating new plan
      const submitData = {
        ...formData,
        constraints,
      };
      onSubmit(submitData);
      return;
    }

    // Check what has changed
    const priceChanged = formData.price !== originalData.price;
    const currencyChanged = formData.currency !== originalData.currency;
    const constraintsChanged =
      JSON.stringify(constraints) !== JSON.stringify(originalData.constraints);

    if (priceChanged || currencyChanged) {
      // Create new plan version with updated price/currency
      const newPlanData = {
        ...formData,
        name: plan.name, // Keep the same name
        interval: plan.interval, // Keep the same interval
        paypalPlanId: plan.paypalPlanId, // This will be replaced by new PayPal plan ID
        active: true, // New version will be active
        constraints,
        isPriceCurrencyUpdate: true, // Flag to indicate this is a price/currency update
        oldPlanId: plan.id, // Pass the old plan ID for deactivation
      };
      onSubmit(newPlanData);
    } else if (constraintsChanged) {
      // Update existing plan constraints only
      const updateData = {
        constraints,
      };
      onSubmit(updateData);
    } else {
      // Nothing changed, just close
      onClose();
    }
  };

  const handleConstraintsChange = (newConstraints: Record<string, any>) => {
    setConstraints(newConstraints);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-w-5xl flex-col border border-stroke bg-white shadow-2xl dark:border-dark-3 dark:bg-gray-dark">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 border-b border-stroke bg-white px-6 py-4 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-dark dark:text-white">
                {plan ? `Update "${plan.name}"` : "Create New Plan"}
              </DialogTitle>
              <p className="mt-1 text-sm text-dark-6 dark:text-dark-5">
                {plan
                  ? "Update pricing and constraints for this plan"
                  : "Configure a new subscription plan for your users"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Edit Mode Notice */}
            {plan && (
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Smart Update System
                    </h3>
                    <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                      <p>
                        • <strong>Price/Currency changes:</strong> Creates a new
                        plan version with new PayPal billing plan, deactivates
                        old plan
                        <br />• <strong>Constraints changes only:</strong>{" "}
                        Updates the existing plan in place (no PayPal changes)
                      </p>
                      <p className="mt-2 text-xs">
                        <strong>Note:</strong> When price/currency changes, the
                        system will:
                        <br />
                        1. Create a new PayPal billing plan with updated pricing
                        <br />
                        2. Create a new plan record in the database
                        <br />
                        3. Deactivate the old PayPal plan via API
                        <br />
                        4. Mark the old plan as inactive in the database
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    Basic Information
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Price
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:text-white dark:focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Currency
                    </label>
                    <DataTableInputs.CurrencySelector
                      value={formData.currency}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          currency: value,
                        }))
                      }
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:text-white dark:focus:border-primary"
                      placeholder="Select Currency"
                    />
                  </div>

                  {!plan && (
                    <div className="flex items-center space-x-3 rounded-lg border border-stroke p-4 dark:border-dark-3">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            active: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div>
                        <label
                          htmlFor="active"
                          className="text-sm font-medium text-dark dark:text-white"
                        >
                          Active Plan
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Make this plan active immediately
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    Plan Constraints
                  </h3>
                </div>

                <div className="rounded-lg border border-stroke bg-gray-50 p-6 dark:border-dark-3 dark:bg-gray-800">
                  <PlanConstraintsDisplay
                    constraints={constraints}
                    isEditable={true}
                    onConstraintsChange={handleConstraintsChange}
                    editableValuesOnly={true}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="flex-shrink-0 border-t border-stroke bg-white px-6 py-4 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              variant="outlineDark"
              onClick={onClose}
              className={isLoading ? "cursor-not-allowed opacity-50" : ""}
            />
            <Button
              label={
                plan
                  ? formData.price !== originalData.price ||
                    formData.currency !== originalData.currency
                    ? "Create New Plan Version"
                    : "Update Plan"
                  : "Create Plan"
              }
              variant="primary"
              onClick={handleSubmit}
              className={isLoading ? "cursor-not-allowed opacity-50" : ""}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
