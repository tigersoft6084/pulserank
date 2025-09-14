"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui-elements/button";
import { DataTableInputs } from "@/components/FormElements/DataTableInputs";
import { XIcon } from "@/assets/icons";
import { CopyIcon } from "@/assets/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateThirdPartyService } from "@/services/third-party-services.service";

// Types
interface ServiceConfig {
  apiKey?: string;
  email?: string;
  password?: string;
  appId?: string;
}

interface ServiceStatus {
  isConnected: boolean;
  status: "healthy" | "warning" | "inactive";
  lastSync: string;
  data: any;
}

interface ThirdPartyService {
  id: string;
  name: string;
  description?: string;
  config: ServiceConfig;
  status?: ServiceStatus;
  threshold?: number;
  createdAt?: string;
  updatedAt?: string;
  data?: Record<string, number>;
  thresholds?: {
    warning: number;
    inactive: number;
  };
}

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: ThirdPartyService | null;
  onSave?: (config: ServiceConfig) => void;
}

export function ConfigDialog({
  isOpen,
  onClose,
  service,
  onSave,
}: ConfigDialogProps) {
  const [config, setConfig] = useState<ServiceConfig>({});
  const [threshold, setThreshold] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();

  const updateServiceMutation = useMutation({
    mutationFn: ({
      id,
      config,
      threshold,
    }: {
      id: string;
      config: ServiceConfig;
      threshold: number;
    }) => updateThirdPartyService(id, config, threshold),
    onMutate: async ({ id, config, threshold }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["third-party-services"] });

      // Snapshot the previous value
      const previousServices = queryClient.getQueryData([
        "third-party-services",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["third-party-services"], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((service: any) =>
            service.id === id
              ? {
                  ...service,
                  config,
                  threshold,
                  updatedAt: new Date().toISOString(),
                }
              : service
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousServices };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousServices) {
        queryClient.setQueryData(
          ["third-party-services"],
          context.previousServices
        );
      }
      console.error("Failed to update service configuration:", err);
    },
    onSuccess: (data, variables) => {
      // Success notification could be added here
      console.log(`Successfully updated ${variables.id} configuration`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["third-party-services"] });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSave = async () => {
    if (!service) return;

    setIsSaving(true);
    try {
      await updateServiceMutation.mutateAsync({
        id: service.id,
        config,
        threshold,
      });
      onSave?.(config);
      onClose();
    } catch (error) {
      console.error("Failed to save service configuration:", error);
      // The mutation will handle rolling back the optimistic update
      // You could add a toast notification here to show the error to the user
    } finally {
      setIsSaving(false);
    }
  };

  // Update local state when service changes
  React.useEffect(() => {
    if (service) {
      setConfig(service.config);
      setThreshold(service.threshold || 0);
    }
  }, [service]);

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Configure {service.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {service.name === "DataForSeo" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <DataTableInputs.Password
                    value={config.email || ""}
                    onChange={(value) => setConfig({ ...config, email: value })}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.email || "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <DataTableInputs.Password
                    value={config.password || ""}
                    onChange={(value) =>
                      setConfig({ ...config, password: value })
                    }
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.password || "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {(service.name === "Majestic" || service.name === "SEMRush") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                API Key
              </label>
              <div className="relative">
                <DataTableInputs.Password
                  value={config.apiKey || ""}
                  onChange={(value) => setConfig({ ...config, apiKey: value })}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.apiKey || "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {service.name === "Intercom" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                App ID
              </label>
              <div className="relative">
                <DataTableInputs.Password
                  value={config.appId || ""}
                  onChange={(value) => setConfig({ ...config, appId: value })}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.appId || "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Threshold Input */}
          {service.name !== "Intercom" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Threshold
              </label>
              <DataTableInputs.Number
                value={threshold.toString()}
                onChange={(value: string) =>
                  setThreshold(parseFloat(value) || 0)
                }
                className="w-full"
                placeholder="Enter threshold value"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            label="Cancel"
            variant="outlineDark"
            shape="rounded"
            size="small"
            onClick={isSaving ? undefined : onClose}
            className={`flex-1 ${isSaving ? "cursor-not-allowed opacity-50" : ""}`}
          />
          <Button
            label={isSaving ? "Saving..." : "Save"}
            variant="primary"
            shape="rounded"
            size="small"
            onClick={isSaving ? undefined : handleSave}
            className={`flex-1 ${isSaving ? "cursor-not-allowed opacity-50" : ""}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export types for use in other files
export type { ServiceConfig, ServiceStatus, ThirdPartyService };
