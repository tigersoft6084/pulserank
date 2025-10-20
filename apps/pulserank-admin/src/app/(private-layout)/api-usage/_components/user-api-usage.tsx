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
  Database,
  Server,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UserApiUsage {
  userId: string;
  userName: string;
  userEmail: string;
  estimatedApiCalls: number;
  lastActiveAt: Date;
  isActive: boolean;
  planName: string;
  keywordCount: number;
  siteCount: number;
  totalCreditsUsed: number;
  totalCost: number;
  services: {
    serviceName: string;
    totalCalls: number;
    majesticCredits?: {
      indexItemResUnits: number;
      retrievalResUnits: number;
      analysisResUnits: number;
    };
    dataforseoCredits?: {
      balanceUsed: number;
    };
    semrushCredits?: {
      apiUnitsUsed: number;
    };
  }[];
}

interface UserApiUsageResponse {
  success: boolean;
  data: UserApiUsage[];
  timeframe: string;
  groupBy: string;
  totalApiCalls: number;
  totalUsers: number;
  activeUsers: number;
  summary: {
    totalCalls: number;
    totalUsers: number;
    activeUsers: number;
  };
}

interface UserApiUsageProps {
  data: UserApiUsageResponse | null;
  loading: boolean;
}

type SortColumn =
  | "estimatedApiCalls"
  | "majesticIndex"
  | "majesticRetrieval"
  | "majesticAnalysis"
  | "dataforseo"
  | "semrush";

export function UserApiUsage({ data, loading }: UserApiUsageProps) {
  const [sortBy, setSortBy] = useState<SortColumn>("estimatedApiCalls");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<UserApiUsage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper functions to get credit values
  const getMajesticIndexCredits = (user: UserApiUsage) => {
    const majesticService = user.services.find(
      (s) => s.serviceName === "Majestic"
    );
    return majesticService?.majesticCredits?.indexItemResUnits || 0;
  };

  const getMajesticRetrievalCredits = (user: UserApiUsage) => {
    const majesticService = user.services.find(
      (s) => s.serviceName === "Majestic"
    );
    return majesticService?.majesticCredits?.retrievalResUnits || 0;
  };

  const getMajesticAnalysisCredits = (user: UserApiUsage) => {
    const majesticService = user.services.find(
      (s) => s.serviceName === "Majestic"
    );
    return majesticService?.majesticCredits?.analysisResUnits || 0;
  };

  const getDataForSeoCredits = (user: UserApiUsage) => {
    const dataforseoService = user.services.find(
      (s) => s.serviceName === "DataForSeo"
    );
    return dataforseoService?.dataforseoCredits?.balanceUsed || 0;
  };

  const getSemrushCredits = (user: UserApiUsage) => {
    const semrushService = user.services.find(
      (s) => s.serviceName === "SEMRush"
    );
    return semrushService?.semrushCredits?.apiUnitsUsed || 0;
  };

  const handleRowClick = (user: UserApiUsage) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case "estimatedApiCalls":
            aValue = a.estimatedApiCalls;
            bValue = b.estimatedApiCalls;
            break;
          case "majesticIndex":
            aValue = getMajesticIndexCredits(a);
            bValue = getMajesticIndexCredits(b);
            break;
          case "majesticRetrieval":
            aValue = getMajesticRetrievalCredits(a);
            bValue = getMajesticRetrievalCredits(b);
            break;
          case "majesticAnalysis":
            aValue = getMajesticAnalysisCredits(a);
            bValue = getMajesticAnalysisCredits(b);
            break;
          case "dataforseo":
            aValue = getDataForSeoCredits(a);
            bValue = getDataForSeoCredits(b);
            break;
          case "semrush":
            aValue = getSemrushCredits(a);
            bValue = getSemrushCredits(b);
            break;
        }

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

  const handleSort = (column: SortColumn) => {
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
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded dark:bg-gray-700"
            ></div>
          ))}
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
                {data?.summary?.totalUsers || 0}
              </div>
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
                Active Users
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {data?.summary?.activeUsers || 0}
              </div>
            </div>
            <div className="p-2 rounded-lg text-green-600 dark:text-green-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-dark-6 dark:text-dark-5">
                Total API Calls
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {data?.summary?.totalCalls || 0}
              </div>
            </div>
            <div className="p-2 rounded-lg text-blue-600 dark:text-blue-400">
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
            Click on any row to view detailed user information
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("estimatedApiCalls")}
                >
                  <div className="flex items-center gap-1">
                    API Calls
                    {sortBy === "estimatedApiCalls" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("majesticIndex")}
                >
                  <div className="flex items-center gap-1">
                    <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Majestic Index
                    {sortBy === "majesticIndex" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("majesticRetrieval")}
                >
                  <div className="flex items-center gap-1">
                    <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Majestic Retrieval
                    {sortBy === "majesticRetrieval" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("majesticAnalysis")}
                >
                  <div className="flex items-center gap-1">
                    <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Majestic Analysis
                    {sortBy === "majesticAnalysis" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("dataforseo")}
                >
                  <div className="flex items-center gap-1">
                    <Server className="h-4 w-4 text-green-600 dark:text-green-400" />
                    DataForSEO
                    {sortBy === "dataforseo" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort("semrush")}
                >
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    SEMRush
                    {sortBy === "semrush" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
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
                    className="border-[#eee] dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => handleRowClick(user)}
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
                        Total calls
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {formatNumber(getMajesticIndexCredits(user))}
                      </div>
                      <div className="text-sm text-dark-6 dark:text-dark-5">
                        Index units
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {formatNumber(getMajesticRetrievalCredits(user))}
                      </div>
                      <div className="text-sm text-dark-6 dark:text-dark-5">
                        Retrieval units
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {formatNumber(getMajesticAnalysisCredits(user))}
                      </div>
                      <div className="text-sm text-dark-6 dark:text-dark-5">
                        Analysis units
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600 dark:text-green-400">
                        ${getDataForSeoCredits(user).toFixed(2)}
                      </div>
                      <div className="text-sm text-dark-6 dark:text-dark-5">
                        Balance used
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        {formatNumber(getSemrushCredits(user))}
                      </div>
                      <div className="text-sm text-dark-6 dark:text-dark-5">
                        API units
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-dark">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-dark dark:text-white">
              User Details - {selectedUser?.userName}
            </DialogTitle>
            <DialogDescription>
              Detailed information about user API usage and service consumption
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Email
                  </label>
                  <p className="text-dark dark:text-white">
                    {selectedUser.userEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Plan
                  </label>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium ml-2",
                      getPlanColor(selectedUser.planName)
                    )}
                  >
                    {selectedUser.planName}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Keywords
                  </label>
                  <p className="text-dark dark:text-white">
                    {selectedUser.keywordCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Sites
                  </label>
                  <p className="text-dark dark:text-white">
                    {selectedUser.siteCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Last Active
                  </label>
                  <p className="text-dark dark:text-white">
                    {formatDate(selectedUser.lastActiveAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-6 dark:text-dark-5">
                    Status
                  </label>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium ml-2",
                      getStatusColor(selectedUser.isActive)
                    )}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Services Used */}
              <div>
                <h4 className="text-lg font-semibold text-dark dark:text-white mb-3">
                  Services Used
                </h4>
                <div className="space-y-3">
                  {selectedUser.services.map((service, index) => {
                    const ServiceIcon =
                      service.serviceName === "Majestic"
                        ? Database
                        : service.serviceName === "DataForSeo"
                          ? Server
                          : service.serviceName === "SEMRush"
                            ? BarChart3
                            : Activity;
                    return (
                      <div
                        key={index}
                        className="border border-stroke dark:border-dark-3 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ServiceIcon className="h-5 w-5" />
                          <h5 className="font-medium text-dark dark:text-white">
                            {service.serviceName}
                          </h5>
                          <span className="text-sm text-dark-6 dark:text-dark-5">
                            ({service.totalCalls} calls)
                          </span>
                        </div>

                        {service.serviceName === "Majestic" &&
                          service.majesticCredits && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-dark-6 dark:text-dark-5">
                                  Index Units:
                                </span>
                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatNumber(
                                    service.majesticCredits.indexItemResUnits
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="text-dark-6 dark:text-dark-5">
                                  Retrieval Units:
                                </span>
                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatNumber(
                                    service.majesticCredits.retrievalResUnits
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="text-dark-6 dark:text-dark-5">
                                  Analysis Units:
                                </span>
                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatNumber(
                                    service.majesticCredits.analysisResUnits
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                        {service.serviceName === "DataForSeo" &&
                          service.dataforseoCredits && (
                            <div className="text-sm">
                              <span className="text-dark-6 dark:text-dark-5">
                                Balance Used:
                              </span>
                              <p className="font-medium text-green-600 dark:text-green-400">
                                $
                                {service.dataforseoCredits.balanceUsed.toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          )}

                        {service.serviceName === "SEMRush" &&
                          service.semrushCredits && (
                            <div className="text-sm">
                              <span className="text-dark-6 dark:text-dark-5">
                                API Units:
                              </span>
                              <p className="font-medium text-orange-600 dark:text-orange-400">
                                {formatNumber(
                                  service.semrushCredits.apiUnitsUsed
                                )}
                              </p>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
