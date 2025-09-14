import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useState } from "react";
import {
  AlertErrorIcon,
  AlertSuccessIcon,
  AlertWarningIcon,
} from "@/assets/icons";

const compactAlertVariants = cva(
  "flex items-center gap-3 w-full rounded-lg border px-4 py-3 transition-all duration-300 ease-in-out text-white",
  {
    variants: {
      variant: {
        success:
          "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400",
        warning:
          "border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400",
        error:
          "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-400",
        info: "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const icons = {
  error: AlertErrorIcon,
  success: AlertSuccessIcon,
  warning: AlertWarningIcon,
  info: AlertWarningIcon, // Using warning icon for info, you can create a specific info icon
};

type CompactAlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant: "error" | "success" | "warning" | "info";
  title: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
};

const CompactAlert = ({
  className,
  variant,
  title,
  showIcon = true,
  dismissible = false,
  onDismiss,
  ...props
}: CompactAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const IconComponent = icons[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    // Call the onDismiss callback after the animation completes
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Match the transition duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        compactAlertVariants({ variant }),
        "transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        className,
      )}
      {...props}
    >
      {showIcon && (
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5 text-white" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h6 className="truncate text-sm font-medium leading-5 text-white">
          {title}
        </h6>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-2 flex-shrink-0 rounded-md p-1 text-white transition-colors hover:bg-white/20"
          aria-label="Dismiss alert"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export { CompactAlert, type CompactAlertProps };
