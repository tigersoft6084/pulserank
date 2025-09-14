"use client";

import React from "react";
import { useToast } from "../../providers/toast-provider";

const ToastExample: React.FC = () => {
  const { addToast } = useToast();

  const showSuccessToast = () => {
    addToast({
      type: "success",
      title: "Success!",
      message: "Operation completed successfully.",
    });
  };

  const showErrorToast = () => {
    addToast({
      type: "error",
      title: "Error!",
      message: "Something went wrong. Please try again.",
    });
  };

  const showWarningToast = () => {
    addToast({
      type: "warning",
      title: "Warning!",
      message: "Please review your input before proceeding.",
    });
  };

  const showInfoToast = () => {
    addToast({
      type: "info",
      title: "Information",
      message: "Here's some helpful information for you.",
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Toast Examples</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showSuccessToast}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Error Toast
        </button>
        <button
          onClick={showWarningToast}
          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
        >
          Warning Toast
        </button>
        <button
          onClick={showInfoToast}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastExample;
