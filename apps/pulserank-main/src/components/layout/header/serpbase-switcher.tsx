// No routing side-effects; this switcher is SERP-base only
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
// import { useTranslations } from "next-intl";
import {
  useLanguageStore,
  ALL_SERP_BASES,
  getBaseDisplayName,
  getLanguageNameForBase,
} from "@/store/language-store";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { flagMap } from "@/lib/utils/flag-static-map";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import useDebounce from "@/hooks/use-debounce";

export function SerpBaseSwitcher() {
  const { currentBase, setBase } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const changeBase = (base: string) => {
    // Decoupled: only update SERP base, do not alter locale or route
    setBase(base);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Filter bases based on search term
  const filteredBases = useMemo(() => {
    if (!debouncedSearchTerm) return ALL_SERP_BASES;

    return ALL_SERP_BASES.filter((base) => {
      const countryName = getBaseDisplayName(base).toLowerCase();
      const languageName = getLanguageNameForBase(base).toLowerCase();
      const baseCode = base.toLowerCase();
      const search = debouncedSearchTerm.toLowerCase();

      return (
        countryName.includes(search) ||
        languageName.includes(search) ||
        baseCode.includes(search)
      );
    });
  }, [debouncedSearchTerm]);

  const getFlagComponent = (base: string) => {
    const countryCode = baseToCountryCode[base];
    return flagMap[countryCode] || flagMap["US"];
  };

  const CurrentFlag = getFlagComponent(currentBase);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2">
          <div className="flex items-center gap-1">
            <CurrentFlag
              title={`${getLanguageNameForBase(currentBase)} (${getBaseDisplayName(currentBase)})`}
              className="h-4 w-4"
            />
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Base List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredBases.map((base) => {
            const Flag = getFlagComponent(base);
            const isSelected = base === currentBase;

            return (
              <DropdownMenuItem
                key={base}
                onClick={() => changeBase(base)}
                className={`cursor-pointer ${isSelected ? "bg-accent" : ""}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Flag
                    title={`${getLanguageNameForBase(base)} (${getBaseDisplayName(base)})`}
                    className="h-4 w-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {getBaseDisplayName(base)}
                    </div>
                    <div className="text-xs text-muted-foreground">{base}</div>
                  </div>
                  {isSelected && (
                    <div className="text-xs text-primary font-medium">
                      Current
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}

          {filteredBases.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No countries found matching "{searchTerm}"
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
