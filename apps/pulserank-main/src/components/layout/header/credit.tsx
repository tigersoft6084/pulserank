import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Coins, Eye, Target, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";

export function Credit() {
  const { data: session } = useSession();
  const t = useTranslations("header");

  const credits = session?.user?.credits;

  if (!credits) {
    return null;
  }

  return (
    <DropdownMenu>
      {/**triger when hover */}
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 text-sm p-2 rounded-md hover:bg-secondary relative">
          {/**if ant of the credits is used, show a red dot */}
          {Object.values(credits).some(
            (credit) => credit.used >= credit.limit,
          ) && (
            <span className="absolute right-0 top-0 z-1 size-2 rounded-full bg-destructive  ">
              <span className="absolute inset-0 animate-ping -z-1 rounded-full bg-destructive opacity-75" />
            </span>
          )}
          <Coins className="w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          {t("credit")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={`flex items-center justify-between ${
            credits.trackingSitesCount?.used &&
            credits.trackingSitesCount?.used >=
              credits.trackingSitesCount?.limit
              ? "text-destructive"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{t("trackingSites")}</span>
          </div>
          <span
            className={`text-sm  ${
              credits.trackingSitesCount?.used &&
              credits.trackingSitesCount?.used >=
                credits.trackingSitesCount?.limit
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {credits.trackingSitesCount?.used || 0}/
            {credits.trackingSitesCount?.limit || 0}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={`flex items-center justify-between ${
            credits.keywordsCount?.used &&
            credits.keywordsCount?.used >= credits.keywordsCount?.limit
              ? "text-destructive"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{t("keywords")}</span>
          </div>
          <span
            className={`text-sm  ${
              credits.keywordsCount?.used &&
              credits.keywordsCount?.used >= credits.keywordsCount?.limit
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {credits.keywordsCount?.used || 0}/
            {credits.keywordsCount?.limit || 0}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={`flex items-center justify-between ${
            credits.unlockedDomainsCount?.used &&
            credits.unlockedDomainsCount?.used >=
              credits.unlockedDomainsCount?.limit
              ? "text-destructive"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4" />
            <span>{t("unlockedDomains")}</span>
          </div>

          <span
            className={`text-sm  ${
              credits.unlockedDomainsCount?.used &&
              credits.unlockedDomainsCount?.used >=
                credits.unlockedDomainsCount?.limit
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {credits.unlockedDomainsCount?.used || 0}/
            {credits.unlockedDomainsCount?.limit || 0}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
