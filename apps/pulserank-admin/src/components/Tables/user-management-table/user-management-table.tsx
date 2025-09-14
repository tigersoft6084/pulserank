"use client";

import { TrashIcon, PencilSquareIcon, UserIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUsers, useDeleteUser, type User } from "@/hooks/use-users";
import {
  ConfirmationDialog,
  type ConfirmationDialogConfig,
} from "@/components/ui/confirmation-dialog-new";
import { DataTableInputs } from "@/components/FormElements/DataTableInputs";
import dayjs from "dayjs";
import { useState } from "react";
import { UserManagementTableSkeleton } from "./skeleton";
export function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [confirmationConfig, setConfirmationConfig] =
    useState<ConfirmationDialogConfig>({
      title: "",
      message: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "danger",
    });
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, error } = useUsers({
    search: searchTerm,
    role: selectedRole,
    status: selectedStatus,
    limit: 10,
  });

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setConfirmationConfig({
      title: "Delete User",
      message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      confirmText: "Delete User",
      cancelText: "Cancel",
      variant: "danger",
    });
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      // The mutation will automatically refetch the users list
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  if (isLoading) {
    return <UserManagementTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="py-8 text-center">
          <p className="text-red-500 dark:text-red-400">
            Error loading users: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DataTableInputs.Search value={searchTerm} onChange={setSearchTerm} />

          <DataTableInputs.RoleFilter
            value={selectedRole}
            onChange={setSelectedRole}
          />

          <DataTableInputs.StatusFilter
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>

        {data?.pagination && (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {users.length} of {data.pagination.total} users
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[200px] xl:pl-7.5">User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No users found
                </p>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: User) => (
              <TableRow
                key={user.id}
                className="border-[#eee] dark:border-dark-3"
              >
                <TableCell className="min-w-[200px] xl:pl-7.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-dark dark:text-white">
                        {user.name}
                      </h5>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-dark dark:text-white">{user.email}</p>
                </TableCell>

                <TableCell>
                  <div
                    className={cn(
                      "max-w-fit rounded-full px-3 py-1 text-sm font-medium",
                      {
                        "bg-primary/10 text-primary": user.role === "Admin",
                        "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400":
                          user.role === "Manager",
                        "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400":
                          user.role === "User",
                      }
                    )}
                  >
                    {user.role}
                  </div>
                </TableCell>

                <TableCell>
                  <div
                    className={cn(
                      "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
                      {
                        "bg-[#219653]/[0.08] text-[#219653]":
                          user.status === "ACTIVE",
                        "bg-[#D34053]/[0.08] text-[#D34053]":
                          user.status === "INACTIVE",
                        "bg-[#FFA70B]/[0.08] text-[#FFA70B]":
                          user.status === "PENDING",
                      }
                    )}
                  >
                    {user.status}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "max-w-fit rounded-full px-3.5 py-1 text-center text-sm font-medium",
                      {
                        "bg-[#219653]/[0.08] text-[#219653]":
                          user.plan === "Agency",
                        "bg-[#FFA70B]/[0.08] text-[#FFA70B]":
                          user.plan === "Studio",
                        "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400":
                          user.plan === "Freelance",
                        "bg-[#D34053]/[0.08] text-[#D34053]":
                          user.plan === "No Plan",
                      }
                    )}
                  >
                    {user.plan}
                    {user.planInterval && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.planInterval}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-dark dark:text-white">
                    {dayjs(user.joinedDate).format("MMM DD, YYYY")}
                  </p>
                </TableCell>

                <TableCell className="xl:pr-7.5">
                  <div className="flex items-center justify-end gap-x-3.5">
                    <button className="transition-colors hover:text-primary">
                      <span className="sr-only">Edit User</span>
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>

                    <button
                      className="transition-colors hover:text-red-500 disabled:opacity-50"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <span className="sr-only">Delete User</span>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => setIsConfirmationDialogOpen(false)}
        config={confirmationConfig}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

// Import the skeleton component
