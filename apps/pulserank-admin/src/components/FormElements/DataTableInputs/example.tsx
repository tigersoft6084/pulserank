"use client";

import { useState } from "react";
import { DataTableInput, DataTableInputs, type SelectOption } from "./index";

// Example component demonstrating the usage of DataTableInputs
export function DataTableInputsExample() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [customSelectValue, setCustomSelectValue] = useState("");

  // Custom options for demonstration
  const customOptions: SelectOption[] = [
    { value: "", label: "Select an option" },
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">
          DataTableInputs Examples
        </h2>
        <p className="text-sm text-dark-6 dark:text-dark-5">
          This component demonstrates the reusable input patterns used across
          user management and subscription management.
        </p>
      </div>

      {/* User Management Table Filters */}
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          User Management Table Filters
        </h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DataTableInputs.Search
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
          />
          <DataTableInputs.RoleFilter
            value={selectedRole}
            onChange={setSelectedRole}
          />
          <DataTableInputs.StatusFilter
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
        <div className="mt-4 text-sm text-dark-6 dark:text-dark-5">
          <p>Search: {searchTerm || "None"}</p>
          <p>Role: {selectedRole || "All"}</p>
          <p>Status: {selectedStatus || "All"}</p>
        </div>
      </div>

      {/* Configuration Modal Inputs */}
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Configuration Modal Inputs
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Email
            </label>
            <DataTableInputs.Email
              value={email}
              onChange={setEmail}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Password
            </label>
            <DataTableInputs.Password
              value={password}
              onChange={setPassword}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              API Key
            </label>
            <DataTableInputs.ApiKey
              value={apiKey}
              onChange={setApiKey}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-dark-6 dark:text-dark-5">
          <p>Email: {email || "Not set"}</p>
          <p>Password: {password ? "••••••••" : "Not set"}</p>
          <p>API Key: {apiKey || "Not set"}</p>
        </div>
      </div>

      {/* Custom Input Examples */}
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Custom Input Examples
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Custom Select
            </label>
            <DataTableInput
              type="select"
              selectedValue={customSelectValue}
              onChange={setCustomSelectValue}
              options={customOptions}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Number Input
            </label>
            <DataTableInput
              type="number"
              placeholder="Enter a number"
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-dark-6 dark:text-dark-5">
          <p>Custom Select: {customSelectValue || "Not selected"}</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Usage Instructions
        </h3>
        <div className="space-y-3 text-sm text-dark-6 dark:text-dark-5">
          <p>
            <strong>Predefined Components:</strong> Use{" "}
            <code>DataTableInputs.Search</code>,{" "}
            <code>DataTableInputs.RoleFilter</code>,{" "}
            <code>DataTableInputs.StatusFilter</code>,{" "}
            <code>DataTableInputs.Email</code>,{" "}
            <code>DataTableInputs.Password</code>, and{" "}
            <code>DataTableInputs.ApiKey</code> for common use cases.
          </p>
          <p>
            <strong>Custom Inputs:</strong> Use the base{" "}
            <code>DataTableInput</code> component with{" "}
            <code>type="select"</code> or other input types for custom
            scenarios.
          </p>
          <p>
            <strong>Styling:</strong> All inputs use consistent styling that
            matches the design system and supports both light and dark themes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DataTableInputsExample;
