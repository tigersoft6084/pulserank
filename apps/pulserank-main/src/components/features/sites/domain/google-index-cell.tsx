import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGoogleIndex } from "@/hooks/features/sites/use-google-index";
import { useLanguageStore } from "@/store/language-store";

interface GoogleIndexCellProps {
  url: string;
}

export function GoogleIndexCell({ url }: GoogleIndexCellProps) {
  const { currentBase } = useLanguageStore();
  const {
    data: googleIndexInfo,
    isLoading,
    error,
  } = useGoogleIndex(url, currentBase);

  const formatIndexationDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getGoogleIndexIcon = (
    googleIndexed: boolean,
    lastIndexationCheck: string,
  ) => {
    const hoursSinceCheck =
      (Date.now() - new Date(lastIndexationCheck).getTime()) / (1000 * 60 * 60);
    const isRecent = hoursSinceCheck < 24;

    if (googleIndexed) {
      if (isRecent) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else {
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getGoogleIndexTooltip = (
    googleIndexed: boolean,
    lastIndexationCheck: string,
    indexedURL: string | null,
  ) => {
    const hoursSinceCheck =
      (Date.now() - new Date(lastIndexationCheck).getTime()) / (1000 * 60 * 60);
    const isRecent = hoursSinceCheck < 24;

    let status = googleIndexed ? "Indexed" : "Not Indexed";
    if (googleIndexed && !isRecent) {
      status = "Indexed (not recent)";
    }

    return `Status: ${status}\nLast Check: ${formatIndexationDate(lastIndexationCheck)}\n${indexedURL ? `Indexed URL: ${indexedURL}` : ""}`;
  };

  if (isLoading) {
    return (
      //   <div className="flex items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      //   </div>
    );
  }

  if (error || !googleIndexInfo) {
    return (
      <div className="flex items-center justify-center">
        <XCircle className="w-4 h-4 text-red-500" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {getGoogleIndexIcon(
              googleIndexInfo.googleIndexed,
              googleIndexInfo.lastIndexationCheck,
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <pre className="whitespace-pre-wrap text-xs">
            {getGoogleIndexTooltip(
              googleIndexInfo.googleIndexed,
              googleIndexInfo.lastIndexationCheck,
              googleIndexInfo.indexedURL,
            )}
          </pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
