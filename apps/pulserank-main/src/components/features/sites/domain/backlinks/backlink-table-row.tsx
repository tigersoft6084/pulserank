import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";
import { GoogleIndexCell } from "@/components/features/sites/domain/google-index-cell";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import { TTF_COLOR_DATA } from "@/lib/config";
import { BacklinkFlags } from "@/types/backlinks";

interface BacklinkTableRowProps {
  backlink: {
    SourceURL: string;
    AnchorText: string;
    keywordsCount: number;
    Flags: BacklinkFlags;
    LastSeenDate: string;
    SourceTopicalTrustFlow_Value_0: number;
    SourceTopicalTrustFlow_Topic_0: string;
  };
  googleIndexStatuses: Record<
    string,
    "indexed" | "not-indexed" | "unknown" | "loading"
  >;
  googleIndexFilter: string | null;
  flagFilters: Set<number>;
  onGoogleIndexClick: (url: string) => void;
  onFlagClick: (flagIndex: number) => void;
}

export function BacklinkTableRow({
  backlink,
  flagFilters,
  onGoogleIndexClick,
  onFlagClick,
}: BacklinkTableRowProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TableRow>
      <TableCell className="truncate max-w-[200px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Favicon url={backlink.SourceURL} size={16} />
                <a
                  href={backlink.SourceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {backlink.SourceURL}
                </a>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>{backlink.SourceURL}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="truncate max-w-[200px]">
        {backlink.AnchorText || "N/A"}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => {
            router.push(
              `/urls/keywords?url=${encodeURIComponent(backlink.SourceURL)}`,
            );
          }}
        >
          {backlink.keywordsCount}
        </Badge>
      </TableCell>
      <TableCell>
        <div
          className={"cursor-pointer hover:bg-gray-50 p-1 rounded"}
          onClick={() => onGoogleIndexClick(backlink.SourceURL)}
        >
          <GoogleIndexCell url={backlink.SourceURL} />
        </div>
      </TableCell>
      <TableCell>
        <FlagIcons
          Flags={backlink.Flags}
          onFlagClick={onFlagClick}
          activeFilters={flagFilters}
        />
      </TableCell>
      <TableCell>{formatDate(backlink.LastSeenDate)}</TableCell>
      <TableCell>
        <Badge
          style={{
            backgroundColor:
              TTF_COLOR_DATA[
                backlink.SourceTopicalTrustFlow_Topic_0.split(
                  "/",
                )[0] as keyof typeof TTF_COLOR_DATA
              ],
          }}
        >
          {backlink.SourceTopicalTrustFlow_Value_0}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
