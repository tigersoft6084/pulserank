"use client";

import React from "react";
import { Toast as ToastType } from "../../providers/toast-provider";
import { useToast } from "../../providers/toast-provider";

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = (type: ToastType["type"]) => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          title: "text-green-800 dark:text-green-200",
          message: "text-green-700 dark:text-green-300",
          iconElement: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "error":
        return {
          container:
            "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
          iconElement: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "warning":
        return {
          container:
            "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300",
          iconElement: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "info":
        return {
          container:
            "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
          iconElement: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          container:
            "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800",
          icon: "text-gray-600 dark:text-gray-400",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300",
          iconElement: null,
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`
        relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg
        ${styles.container}
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>{styles.iconElement}</div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${styles.title}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={`mt-1 text-sm ${styles.message}`}>{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className={`
          flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5
          ${styles.icon}
        `}
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
