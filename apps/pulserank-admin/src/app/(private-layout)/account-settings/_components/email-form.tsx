"use client";

import { useState } from "react";
import { useUpdateAdminAccount } from "@/hooks/use-admin-account";

interface EmailFormProps {
  currentEmail: string;
}

export const EmailForm = ({ currentEmail }: EmailFormProps) => {
  const [email, setEmail] = useState(currentEmail);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateAccount = useUpdateAdminAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (email === currentEmail) {
      setIsEditing(false);
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await updateAccount.mutateAsync({ email });
      setSuccess("Email updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update email");
    }
  };

  const handleCancel = () => {
    setEmail(currentEmail);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (!isEditing) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Email Address
            </h3>
            <p className="mt-1 text-sm text-body-color dark:text-body-color-dark">
              {currentEmail}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Update Email Address
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-dark dark:text-white"
          >
            New Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark placeholder:text-body-color focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder:text-body-color-dark"
            placeholder="Enter new email address"
            required
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateAccount.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {updateAccount.isPending ? "Updating..." : "Update Email"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateAccount.isPending}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
