import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/language-store";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";

export function SearchInput({
  title,
  placeholder,
  icon,
  showFlag = false,
  dataTourId,
  searchFunction,
  value,
  onChange,
}: {
  title: string;
  placeholder: string;
  icon: React.ReactNode;
  showFlag?: boolean;
  dataTourId?: string;
  searchFunction?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { currentBase } = useLanguageStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchFunction) {
      searchFunction();
    }
  };

  // Get flag component based on current base
  const getFlagComponent = () => {
    const countryCode = baseToCountryCode[currentBase] || "US";
    return flagMap[countryCode] || flagMap["US"];
  };

  const FlagComponent = getFlagComponent();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium flex items-center gap-3">
        {icon}
        {title}
      </h2>
      <div className="flex" data-tour-id={dataTourId}>
        {showFlag ? (
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FlagComponent title={currentBase} className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder={placeholder}
              className="pl-12 h-10 rounded-r-none"
              onKeyDown={handleKeyDown}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
            />
          </div>
        ) : (
          <Input
            type="text"
            placeholder={placeholder}
            className="h-10 rounded-r-none"
            onKeyDown={handleKeyDown}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )}
        <Button
          size="lg"
          className="px-3 h-10 rounded-l-none"
          onClick={searchFunction}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
