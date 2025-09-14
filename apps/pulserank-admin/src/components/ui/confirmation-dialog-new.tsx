"use client";

import React from "react";
import { Button } from "@/components/ui-elements/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmationDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfirmationDialogConfig;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  config,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const getButtonVariant = () => {
    switch (config.variant) {
      case "danger":
        return "danger"; // Using primary for danger since there's no red variant
      case "warning":
        return "green"; // Using green for warning
      case "info":
        return "primary"; // Using primary for info
      default:
        return "primary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-dark">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-neutral-400">
            {config.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-3">
          <Button
            label={config.cancelText || "Cancel"}
            variant="outlineDark"
            shape="rounded"
            size="small"
            onClick={handleCancel}
            className="flex-1"
          />
          <Button
            label={config.confirmText || "Confirm"}
            variant={getButtonVariant()}
            shape="rounded"
            size="small"
            onClick={handleConfirm}
            className="flex-1"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export types for use in other files
export type { ConfirmationDialogConfig };
