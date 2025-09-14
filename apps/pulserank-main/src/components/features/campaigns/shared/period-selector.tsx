import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const PERIODS = [
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Custom", value: "custom" },
];

export function getPeriodDates(
  period: string,
  customDateFrom?: Date,
  customDateTo?: Date
) {
  const today = new Date();
  switch (period) {
    case "yesterday":
      return {
        dateFrom: format(subDays(today, 1), "yyyy-MM-dd"),
        dateTo: format(today, "yyyy-MM-dd"),
      };
    case "7d":
      return {
        dateFrom: format(subDays(today, 7), "yyyy-MM-dd"),
        dateTo: format(today, "yyyy-MM-dd"),
      };
    case "30d":
      return {
        dateFrom: format(subDays(today, 30), "yyyy-MM-dd"),
        dateTo: format(today, "yyyy-MM-dd"),
      };
    case "custom":
      return {
        dateFrom: customDateFrom
          ? format(customDateFrom, "yyyy-MM-dd")
          : undefined,
        dateTo: customDateTo ? format(customDateTo, "yyyy-MM-dd") : undefined,
      };
    default:
      return { dateFrom: undefined, dateTo: undefined };
  }
}

export function getHistoricalDate(period: string, customDate?: Date) {
  const today = new Date();
  switch (period) {
    case "yesterday":
      return format(subDays(today, 1), "yyyy-MM-dd");
    case "7d":
      return format(subDays(today, 7), "yyyy-MM-dd");
    case "30d":
      return format(subDays(today, 30), "yyyy-MM-dd");
    case "custom":
      return customDate ? format(customDate, "yyyy-MM-dd") : undefined;
    default:
      return undefined;
  }
}

interface PeriodSelectorProps {
  period: string;
  onPeriodChange: (period: string) => void;
  customDateFrom?: Date;
  customDateTo?: Date;
  onCustomDateFromChange: (date: Date | undefined) => void;
  onCustomDateToChange: (date: Date | undefined) => void;
  availableDates?: string[];
}

export function PeriodSelector({
  period,
  onPeriodChange,
  customDateFrom,
  customDateTo,
  onCustomDateFromChange,
  onCustomDateToChange,
  availableDates = [],
}: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date pickers */}
      {period === "custom" && (
        <div className="flex items-center gap-2">
          {availableDates.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No historical data available for this keyword
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !customDateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateFrom
                  ? format(customDateFrom, "PPP")
                  : `From date (${availableDates.length} available)`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customDateFrom}
                onSelect={onCustomDateFromChange}
                disabled={(date) => {
                  // Disable dates that don't have SERP data
                  const dateString = format(date, "yyyy-MM-dd");
                  return !availableDates.includes(dateString);
                }}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !customDateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateTo
                  ? format(customDateTo, "PPP")
                  : `To date (${availableDates.length} available)`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customDateTo}
                onSelect={onCustomDateToChange}
                disabled={(date) => {
                  // Disable dates that don't have SERP data
                  const dateString = format(date, "yyyy-MM-dd");
                  return !availableDates.includes(dateString);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
