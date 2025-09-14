"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState } from "react";
import { EmailForm } from "./_components/email-form";
import { PasswordForm } from "./_components/password-form";
import { useAdminAccount } from "@/hooks/use-admin-account";

export default function Page() {
  const { data: adminData, isLoading, error } = useAdminAccount();

  const [data, setData] = useState({
    name: "Danish Heilium",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
  });

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto") {
      const file = e.target?.files[0];

      setData({
        ...data,
        profilePhoto: file && URL.createObjectURL(file),
      });
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];

      setData({
        ...data,
        coverPhoto: file && URL.createObjectURL(file),
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <div className="mx-auto w-full ">
      <Breadcrumb pageName="Account Settings" />

      {/* Account Management Section */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-dark-2">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Failed to load account information. Please try again.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <EmailForm currentEmail={adminData?.email || ""} />
            <PasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}
