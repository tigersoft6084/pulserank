"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  Mail,
  Calendar,
  UserIcon,
} from "lucide-react";

interface UserApiUsage {
  userId: string;
  userName: string;
  userEmail: string;
  estimatedApiCalls: number;
  keywordCount: number;
  siteCount: number;
  planName: string;
  lastActiveAt: string;
  isActive: boolean;
}

interface UserApiUsageResponse {
  success: boolean;
  data: UserApiUsage[];
  timeframe: string;
  groupBy: string;
  totalApiCalls: number;
  totalUsers: number;
  activeUsers: number;
}

interface UserApiUsageProps {
  data: UserApiUsageResponse | null;
  loading: boolean;
}

export function UserApiUsage({ data, loading }: UserApiUsageProps) {
  const [sortBy, setSortBy] = useState<keyof UserApiUsage>("estimatedApiCalls");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "pro":
        return "bg-primary/10 text-primary";
      case "premium":
        return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
      case "enterprise":
        return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-[#219653]/[0.08] text-[#219653]"
      : "bg-[#D34053]/[0.08] text-[#D34053]";
  };

  const sortedData = data?.data
    ? [...data.data].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      })
    : [];

  const handleSort = (column: keyof UserApiUsage) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 rounded dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-dark-6 dark:text-dark-5">
                Total Users
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {data?.totalUsers || 0}
              </div>
              <p className="text-xs text-dark-6 dark:text-dark-5">
                {data?.activeUsers || 0} active subscribers
              </p>
            </div>
            <div className="p-2 rounded-lg text-primary">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-dark-6 dark:text-dark-5">
                Estimated API Calls
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {formatNumber(data?.totalApiCalls || 0)}
              </div>
              <p className="text-xs text-dark-6 dark:text-dark-5">
                Based on user activity
              </p>
            </div>
            <div className="p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-dark-6 dark:text-dark-5">
                Active Rate
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {data?.totalUsers
                  ? Math.round((data.activeUsers / data.totalUsers) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-dark-6 dark:text-dark-5">
                Users with active subscriptions
              </p>
            </div>
            <div className="p-2 rounded-lg text-green-600 dark:text-green-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-dark dark:text-white">
            User API Usage Analysis
          </h3>
          <p className="text-sm text-dark-6 dark:text-dark-5">
            Estimated API usage based on user activity and subscription plans
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("userName")}
              >
                User
                {sortBy === "userName" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("estimatedApiCalls")}
              >
                Est. API Calls
                {sortBy === "estimatedApiCalls" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("planName")}
              >
                Plan
                {sortBy === "planName" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("keywordCount")}
              >
                Keywords
                {sortBy === "keywordCount" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("siteCount")}
              >
                Sites
                {sortBy === "siteCount" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("lastActiveAt")}
              >
                Last Active
                {sortBy === "lastActiveAt" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
                      No user data found
                    </h3>
                    <p className="text-dark-6 dark:text-dark-5">
                      No users found for the selected timeframe.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((user) => (
                <TableRow
                  key={user.userId}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[200px] xl:pl-7.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium text-dark dark:text-white">
                          {user.userName}
                        </h5>
                        <div className="flex items-center text-sm text-dark-6 dark:text-dark-5">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.userEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-dark dark:text-white">
                      {formatNumber(user.estimatedApiCalls)}
                    </div>
                    <div className="text-sm text-dark-6 dark:text-dark-5">
                      Estimated calls
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-medium",
                        getPlanColor(user.planName)
                      )}
                    >
                      {user.planName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-dark dark:text-white">
                      {user.keywordCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-dark dark:text-white">
                      {user.siteCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-dark-6 dark:text-dark-5">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(user.lastActiveAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-medium",
                        getStatusColor(user.isActive)
                      )}
                    >
                      {user.isActive ? (
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Inactive
                        </div>
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
