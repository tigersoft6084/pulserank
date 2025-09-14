import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_DATA } from "@/lib/config";
import { useTranslations } from "next-intl";

interface KeywordSearchFormProps {
  keyword: string;
  base: string;
  onKeywordChange: (keyword: string) => void;
  onBaseChange: (base: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function KeywordSearchForm({
  keyword,
  base,
  onKeywordChange,
  onBaseChange,
  onSubmit,
}: KeywordSearchFormProps) {
  const t = useTranslations("serpMachine.searchForm");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t("inputPlaceholder")}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
          </div>
          <Select value={base} onValueChange={onBaseChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(BASE_DATA).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={!keyword.trim()}>
            {t("searchButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
