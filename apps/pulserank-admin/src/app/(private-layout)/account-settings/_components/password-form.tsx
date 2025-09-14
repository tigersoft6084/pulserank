"use client";

import { useState } from "react";
import { useUpdateAdminAccount } from "@/hooks/use-admin-account";

export const PasswordForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateAccount = useUpdateAdminAccount();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate current password
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      await updateAccount.mutateAsync({
        currentPassword,
        newPassword,
      });
      setSuccess("Password updated successfully!");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  if (!isEditing) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Password
            </h3>
            <p className="mt-1 text-sm text-body-color dark:text-body-color-dark">
              Last changed: Recently
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Change Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Change Password
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-dark dark:text-white"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark placeholder:text-body-color focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder:text-body-color-dark"
            placeholder="Enter current password"
            required
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-dark dark:text-white"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark placeholder:text-body-color focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder:text-body-color-dark"
            placeholder="Enter new password"
            required
          />
          <p className="mt-1 text-xs text-body-color dark:text-body-color-dark">
            Password must be at least 8 characters with uppercase, lowercase,
            and number
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-dark dark:text-white"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark placeholder:text-body-color focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder:text-body-color-dark"
            placeholder="Confirm new password"
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
            {updateAccount.isPending ? "Updating..." : "Update Password"}
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
