import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function AuthTitle() {
  const t = useTranslations("header");
  return (
    <div className="w-full flex items-center justify-between px-4">
      <Link href="/" className="min-w-[128px]">
        <Image src="/logo.svg" alt={t("logo")} width={128} height={48} />
      </Link>
      <Button variant="ghost" asChild>
        <Link href="/sign-out">{t("signOut")}</Link>
      </Button>
    </div>
  );
}
