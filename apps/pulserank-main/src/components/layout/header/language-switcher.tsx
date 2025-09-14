import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useLanguageStore } from "@/store/language-store";
import { flagMap } from "@/lib/utils/flag-static-map";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function LanguageSwitcher() {
  const t = useTranslations("languages");
  const pathname = usePathname();
  const router = useRouter();
  const { currentLocale, currentBase, setLocale } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render until we have the current locale
  if (!currentLocale) {
    return null;
  }

  const changeLanguage = (locale: string) => {
    try {
      // Update the store (this will automatically update both locale and base)
      setLocale(locale);

      // Add a small delay to prevent race conditions with Intercom
      setTimeout(() => {
        // If the current path doesn't have a locale prefix, add it
        if (!["en", "fr"].includes(pathname.split("/")[1])) {
          router.push(`/${locale}${pathname}`);
        } else {
          // If it has a locale prefix, replace it
          const newPathname = pathname.replace(
            `/${currentLocale}`,
            `/${locale}`,
          );
          router.push(newPathname);
        }
      }, 100); // Small delay to prevent Intercom race conditions
    } catch (error) {
      console.error("Error changing language:", error);
      // Fallback: just update the store and let the page refresh
      setLocale(locale);
      if (typeof window !== "undefined" && window !== null) {
        window.location.reload();
      }
    }
  };

  const getFlagComponent = (locale: string) => {
    switch (locale) {
      case "en":
        return flagMap["US"];
      case "fr":
        return flagMap["FR"];
      default:
        return flagMap["US"];
    }
  };

  const CurrentFlag = getFlagComponent(currentLocale);
  const USFlag = flagMap["US"];
  const FRFlag = flagMap["FR"];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-12">
          <div className="flex items-center gap-1">
            <CurrentFlag
              title={`${currentLocale} (${currentBase})`}
              className="h-5 w-5"
            />
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className="cursor-pointer"
        >
          <USFlag title="en (com_en)" className="mr-1 h-5 w-5" />
          {t("en")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("fr")}
          className="cursor-pointer"
        >
          <FRFlag title="fr (fr_fr)" className="mr-1 h-5 w-5" />
          {t("fr")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
