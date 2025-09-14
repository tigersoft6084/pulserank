import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { Filter, X, CheckCircle, XCircle } from "lucide-react";
import { flagIconMap } from "@/components/features/backlinks/flag-icons";

interface FilterableTableHeaderProps {
  title: string;
  activeFilter: string | null;
  onResetFilter: () => void;
  filterType: "googleIndex" | "flag";
  flagFilters?: Set<number>;
}

// Google Index icon component
const GoogleIndexIcon = ({ status }: { status: string }) => {
  if (status === "indexed") {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  } else if (status === "not-indexed") {
    return <XCircle className="w-4 h-4 text-red-500" />;
  }
  return null;
};

// Flag icons component for header
const HeaderFlagIcons = ({ flagIndices }: { flagIndices: number[] }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {flagIndices.map((index) => {
        const flagConfig = flagIconMap[index];
        if (!flagConfig) return null;

        const IconComponent = flagConfig.icon;
        return (
          <div
            key={index}
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${flagConfig.textColor} text-xs`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
        );
      })}
    </div>
  );
};

export function FilterableTableHeader({
  title,
  activeFilter,
  onResetFilter,
  filterType,
  flagFilters = new Set(),
}: FilterableTableHeaderProps) {
  const hasActiveFilter = activeFilter !== null;

  const renderFilterIcons = () => {
    if (!hasActiveFilter) return null;

    if (filterType === "googleIndex") {
      return <GoogleIndexIcon status={activeFilter} />;
    } else if (filterType === "flag") {
      const activeFlagIndices = Array.from(flagFilters);
      return (
        <div className="flex items-center gap-1">
          <HeaderFlagIcons flagIndices={activeFlagIndices} />
          {activeFlagIndices.length > 1 && (
            <span className="text-xs text-blue-600 font-medium">(All)</span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <TableHead className="relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span>{title}</span>
          {hasActiveFilter && (
            <div className="flex items-center gap-1 mt-1">
              {renderFilterIcons()}
            </div>
          )}
        </div>
        {hasActiveFilter && (
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-blue-500" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilter}
              className="h-4 w-4 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </TableHead>
  );
}
