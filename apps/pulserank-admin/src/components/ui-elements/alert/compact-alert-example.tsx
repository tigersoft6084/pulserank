"use client";

import { useState } from "react";
import { CompactAlert } from "./compact-alert";

export function CompactAlertExample() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(true);
  const [showWarningAlert, setShowWarningAlert] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(true);
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  return (
    <div className="space-y-4 p-6">
      <h2 className="mb-4 text-lg font-semibold">Compact Alert Examples</h2>

      {/* Success Alert with Close Button */}
      {showSuccessAlert && (
        <CompactAlert
          variant="success"
          title="Operation completed successfully!"
          dismissible
          onDismiss={() => setShowSuccessAlert(false)}
        />
      )}

      {/* Warning Alert with Close Button */}
      {showWarningAlert && (
        <CompactAlert
          variant="warning"
          title="Please review your settings before proceeding"
          dismissible
          onDismiss={() => setShowWarningAlert(false)}
        />
      )}

      {/* Error Alert with Close Button */}
      {showErrorAlert && (
        <CompactAlert
          variant="error"
          title="Failed to save changes. Please try again."
          dismissible
          onDismiss={() => setShowErrorAlert(false)}
        />
      )}

      {/* Info Alert with Close Button */}
      {showInfoAlert && (
        <CompactAlert
          variant="info"
          title="System maintenance scheduled for tonight at 2 AM"
          dismissible
          onDismiss={() => setShowInfoAlert(false)}
        />
      )}

      {/* Reset Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setShowSuccessAlert(true)}
          className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
        >
          Show Success
        </button>
        <button
          onClick={() => setShowWarningAlert(true)}
          className="rounded bg-amber-100 px-3 py-1 text-sm text-amber-700 hover:bg-amber-200"
        >
          Show Warning
        </button>
        <button
          onClick={() => setShowErrorAlert(true)}
          className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
        >
          Show Error
        </button>
        <button
          onClick={() => setShowInfoAlert(true)}
          className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
        >
          Show Info
        </button>
      </div>
    </div>
  );
}
