import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortDirection } from "@/lib/utils/sort-utils";

interface SortableTableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: SortDirection | null;
  onSort: (key: string) => void;
  children: React.ReactNode;
}

const SortableTableHead = React.forwardRef<
  HTMLTableCellElement,
  SortableTableHeadProps
>(
  (
    {
      className,
      sortKey,
      currentSortKey,
      currentDirection,
      onSort,
      children,
      ...props
    },
    ref,
  ) => {
    const isActive = currentSortKey === sortKey;

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 cursor-pointer select-none hover:bg-muted/50 transition-colors",
          className,
        )}
        onClick={() => onSort(sortKey)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <span>{children}</span>
          <div className="flex flex-col">
            <ChevronUp
              className={cn(
                "h-3 w-3 transition-colors",
                isActive && currentDirection === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-colors -mt-1",
                isActive && currentDirection === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/30",
              )}
            />
          </div>
        </div>
      </th>
    );
  },
);

SortableTableHead.displayName = "SortableTableHead";

export { SortableTableHead };
