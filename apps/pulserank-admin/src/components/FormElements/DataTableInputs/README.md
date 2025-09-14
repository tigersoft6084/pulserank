# DataTableInputs Component

A reusable input component that consolidates all input patterns used across user management and subscription management tables.

## Features

- **Consistent Styling**: All inputs use the same design system styling
- **Dark Mode Support**: Fully compatible with light and dark themes
- **Type Safety**: Built with TypeScript for better development experience
- **Predefined Components**: Ready-to-use components for common scenarios
- **Customizable**: Flexible base component for custom use cases

## Components

### Predefined Components

#### `DataTableInputs.Search`

Search input with auto-focus, commonly used in table filters.

```tsx
<DataTableInputs.Search
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search users..."
/>
```

#### `DataTableInputs.RoleFilter`

Select dropdown for filtering by user roles.

```tsx
<DataTableInputs.RoleFilter value={selectedRole} onChange={setSelectedRole} />
```

#### `DataTableInputs.StatusFilter`

Select dropdown for filtering by user status.

```tsx
<DataTableInputs.StatusFilter
  value={selectedStatus}
  onChange={setSelectedStatus}
/>
```

#### `DataTableInputs.Email`

Email input for configuration modals.

```tsx
<DataTableInputs.Email value={email} onChange={setEmail} className="w-full" />
```

#### `DataTableInputs.Password`

Password input for configuration modals.

```tsx
<DataTableInputs.Password
  value={password}
  onChange={setPassword}
  className="w-full"
/>
```

#### `DataTableInputs.ApiKey`

Text input for API keys in configuration modals.

```tsx
<DataTableInputs.ApiKey
  value={apiKey}
  onChange={setApiKey}
  className="w-full"
/>
```

### Base Component

#### `DataTableInput`

The base component that can be used for custom input types.

```tsx
// Custom select
<DataTableInput
  type="select"
  selectedValue={value}
  onChange={setValue}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}
  className="w-full"
/>

// Number input
<DataTableInput
  type="number"
  placeholder="Enter a number"
  className="w-full"
/>
```

## Props

### Base Props (for all components)

- `className?: string` - Additional CSS classes
- `placeholder?: string` - Input placeholder text
- `value?: string` - Input value
- `onChange?: (value: string) => void` - Change handler
- `disabled?: boolean` - Disable the input
- `required?: boolean` - Mark as required
- `name?: string` - Input name attribute
- `autoFocus?: boolean` - Auto-focus the input

### Select-specific Props

- `options: SelectOption[]` - Array of options for select dropdown
- `selectedValue?: string` - Currently selected value

## Usage Examples

### User Management Table Filters

```tsx
import { DataTableInputs } from "@/components/FormElements/DataTableInputs";

function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  return (
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
  );
}
```

### Configuration Modal

```tsx
import { DataTableInputs } from "@/components/FormElements/DataTableInputs";

function ConfigModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <DataTableInputs.Email
          value={email}
          onChange={setEmail}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <DataTableInputs.Password
          value={password}
          onChange={setPassword}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">API Key</label>
        <DataTableInputs.ApiKey
          value={apiKey}
          onChange={setApiKey}
          className="w-full"
        />
      </div>
    </div>
  );
}
```

## Migration Guide

### Before (User Management Table)

```tsx
<input
  type="text"
  placeholder="Search users..."
  value={searchTerm}
  autoFocus
  onChange={(e) => setSearchTerm(e.target.value)}
  className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
/>

<select
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
  className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
>
  <option value="">All Roles</option>
  <option value="admin">Admin</option>
  <option value="manager">Manager</option>
  <option value="user">User</option>
</select>
```

### After (User Management Table)

```tsx
<DataTableInputs.Search
  value={searchTerm}
  onChange={setSearchTerm}
/>

<DataTableInputs.RoleFilter
  value={selectedRole}
  onChange={setSelectedRole}
/>
```

## Benefits

1. **Consistency**: All inputs follow the same design patterns
2. **Maintainability**: Changes to input styling only need to be made in one place
3. **Reusability**: Components can be used across different parts of the application
4. **Type Safety**: TypeScript ensures proper usage and prevents errors
5. **Accessibility**: Built with proper ARIA attributes and keyboard navigation
6. **Performance**: Optimized rendering with proper React patterns

## Styling

All inputs use the following consistent styling:

- Border radius: `rounded-md`
- Border: `border border-stroke` (light) / `border-dark-3` (dark)
- Background: `bg-gray-dark` (dark mode)
- Text: `text-white` (dark mode)
- Focus: `focus:border-primary focus:outline-none`
- Padding: `px-3 py-2`
- Font size: `text-sm`
