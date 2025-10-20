"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Server, Users } from "lucide-react";

export default function ApiUsageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "By Service",
      href: "/api-usage-enhanced/service",
      icon: Server,
      isActive: pathname === "/api-usage-enhanced/service",
    },
    {
      name: "By User",
      href: "/api-usage-enhanced/user",
      icon: Users,
      isActive: pathname === "/api-usage-enhanced/user",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Enhanced API Usage Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive API usage tracking with real credit consumption and
            cost analysis
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                tab.isActive
                  ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              <IconComponent className="h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}

