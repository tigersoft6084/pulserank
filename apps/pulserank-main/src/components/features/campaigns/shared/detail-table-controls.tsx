import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DATE_GROUPINGS } from "../../../../lib/utils/date-utils";
import { useTranslations } from "next-intl";

interface DetailTableControlsProps {
  dateGrouping: string;
  onDateGroupingChange: (grouping: string) => void;
  showVariation: boolean;
  onShowVariationChange: (show: boolean) => void;
  showDetails: boolean;
  onShowDetailsChange: (show: boolean) => void;
}

export function DetailTableControls({
  dateGrouping,
  onDateGroupingChange,
  showVariation,
  onShowVariationChange,
  showDetails,
  onShowDetailsChange,
}: DetailTableControlsProps) {
  const t = useTranslations("campaigns");
  return (
    <div className="flex items-center gap-6">
      {/* Date grouping selector */}
      <Select value={dateGrouping} onValueChange={onDateGroupingChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_GROUPINGS.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Toggle controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="variation-mode"
            checked={showVariation}
            onCheckedChange={onShowVariationChange}
          />
          <Label htmlFor="variation-mode">
            {showVariation ? "Show Variation" : "Show Ranking"}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-details"
            checked={showDetails}
            onCheckedChange={onShowDetailsChange}
          />
          <Label htmlFor="show-details">{t("showDetailColumns")}</Label>
        </div>
      </div>
    </div>
  );
}
