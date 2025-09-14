import { TableCell } from "@/components/ui/table";
import { RankingData } from "@/types/campaigns";
import {
  getRankingForDate,
  getVariationForDate,
} from "../../../../lib/utils/date-utils";

interface DetailTableCellProps {
  ranking: RankingData;
  date: string;
  dateGrouping: string;
  dateColumns: string[];
  showVariation: boolean;
}

export function DetailTableCell({
  ranking,
  date,
  dateGrouping,
  dateColumns,
  showVariation,
}: DetailTableCellProps) {
  const value = showVariation
    ? getVariationForDate(ranking.rankings, date, dateGrouping, dateColumns)
    : getRankingForDate(ranking.rankings, date, dateGrouping);

  return (
    <TableCell className="text-center">
      {value !== null ? (
        showVariation ? (
          <span
            className={
              value > 0
                ? "text-red-600"
                : value < 0
                  ? "text-green-600"
                  : "text-gray-600"
            }
          >
            {value > 0 ? `+${value}` : value}
          </span>
        ) : (
          value
        )
      ) : (
        "-"
      )}
    </TableCell>
  );
}
