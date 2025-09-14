import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function AuthTitle() {
  const t = useTranslations("header");
  return (
    <Link href="/dashboard" className="mx-4 min-w-[128px]">
      <Image src="/logo.svg" alt={t("logo")} width={128} height={48} />
    </Link>
  );
}
