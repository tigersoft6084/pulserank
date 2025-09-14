"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowUp, LifeBuoy } from "lucide-react";
import { useTranslations } from "next-intl";
export function Footer() {
  const t = useTranslations("footer");
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t">
      <div className="relative flex w-full h-14 items-center justify-center">
        <Link
          href="/contact"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <LifeBuoy className="w-4 h-4" /> {t("contact")}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 rounded-full"
          onClick={scrollToTop}
          title={t("scrollToTop")}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
}
