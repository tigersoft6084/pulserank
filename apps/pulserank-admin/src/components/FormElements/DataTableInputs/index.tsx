import { cn } from "@/lib/utils";
import { type HTMLInputTypeAttribute, useId } from "react";

// Input Types
export type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "select"
  | "number";

// Select Option Type
export interface SelectOption {
  value: string;
  label: string;
}

// Base Input Props
interface BaseInputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  autoFocus?: boolean;
}

// Text Input Props
interface TextInputProps extends BaseInputProps {
  type: "text" | "email" | "password" | "search" | "number";
}

// Select Input Props
interface SelectInputProps extends BaseInputProps {
  type: "select";
  options: SelectOption[];
  selectedValue?: string;
}

// Union type for all input props
type DataTableInputProps = TextInputProps | SelectInputProps;

// Main Component
export function DataTableInput(props: DataTableInputProps) {
  const id = useId();

  if (props.type === "select") {
    return (
      <select
        id={id}
        value={props.selectedValue || ""}
        onChange={(e) => props.onChange?.(e.target.value)}
        disabled={props.disabled}
        required={props.required}
        name={props.name}
        className={cn(
          "rounded-md border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white",
          props.className,
        )}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={id}
      type={props.type}
      placeholder={props.placeholder}
      value={props.value || ""}
      onChange={(e) => props.onChange?.(e.target.value)}
      disabled={props.disabled}
      required={props.required}
      name={props.name}
      autoFocus={props.autoFocus}
      className={cn(
        "rounded-md border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white",
        props.className,
      )}
    />
  );
}

// Predefined input configurations for common use cases
export const DataTableInputs = {
  // Search input for user management
  Search: ({
    value,
    onChange,
    placeholder = "Search users...",
    ...props
  }: Omit<TextInputProps, "type">) => (
    <DataTableInput
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus
      {...props}
    />
  ),

  // Role filter for user management
  RoleFilter: ({
    value,
    onChange,
    ...props
  }: Omit<SelectInputProps, "type" | "options">) => (
    <DataTableInput
      type="select"
      selectedValue={value}
      onChange={onChange}
      options={[
        { value: "", label: "All Roles" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "user", label: "User" },
      ]}
      {...props}
    />
  ),

  // currency selector
  CurrencySelector: ({
    value,
    onChange,
    ...props
  }: Omit<SelectInputProps, "type" | "options">) => (
    <DataTableInput
      type="select"
      selectedValue={value}
      onChange={onChange}
      options={[
        { value: "USD", label: "USD - US Dollar" },
        { value: "EUR", label: "EUR - Euro" },
      ]}
      {...props}
    />
  ),

  // Status filter for user management
  StatusFilter: ({
    value,
    onChange,
    ...props
  }: Omit<SelectInputProps, "type" | "options">) => (
    <DataTableInput
      type="select"
      selectedValue={value}
      onChange={onChange}
      options={[
        { value: "", label: "All Status" },
        { value: "active", label: "ACTIVE" },
        { value: "inactive", label: "INACTIVE" },
      ]}
      {...props}
    />
  ),

  // Email input for configuration modals
  Email: ({
    value,
    onChange,
    placeholder = "Enter email",
    ...props
  }: Omit<TextInputProps, "type">) => (
    <DataTableInput
      type="email"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),

  // Password input for configuration modals
  Password: ({
    value,
    onChange,
    placeholder = "Enter password",
    ...props
  }: Omit<TextInputProps, "type">) => (
    <DataTableInput
      type="password"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),

  // API Key input for configuration modals
  ApiKey: ({
    value,
    onChange,
    placeholder = "Enter API key",
    ...props
  }: Omit<TextInputProps, "type">) => (
    <DataTableInput
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),

  // Number input for configuration modals
  Number: ({
    value,
    onChange,
    placeholder = "Enter number",
    ...props
  }: Omit<TextInputProps, "type">) => (
    <DataTableInput
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
};

export default DataTableInput;
