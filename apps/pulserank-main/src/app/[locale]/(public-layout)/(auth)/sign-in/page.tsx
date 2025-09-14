"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "@/components/features/account/google-auth";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AuthTitle } from "@/components/layout/header/auth-title";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations("auth.signIn");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: t("error.title"),
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("💥Error signing in:", error);
      toast({
        title: t("error.title"),
        description: t("error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center relative">
      <div className="absolute top-4 left-4">
        <AuthTitle />
      </div>
      <div className="w-full max-w-xs space-y-8">
        <div className="flex flex-row justify-center items-center">
          <h2 className="text-center text-3xl font-bold ml-3">{t("title")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            className="h-14"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            required
          />
          <div className="relative">
            <Input
              className="h-14"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              required
            />
            <Button
              type="button"
              variant={"ghost"}
              onClick={togglePasswordVisibility}
              className="absolute top-2.5 right-2 flex items-center rounded-full p-2.5"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base font-normal bg-green-600 hover:bg-green-700 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("loadingButton") : t("submitButton")}
          </button>
        </form>

        <p className="text-center text-sm text-foreground">
          {t("dontHaveAccount")}{" "}
          <Link href="/sign-up" className="text-[#10A37F] hover:underline">
            {t("signUpLink")}
          </Link>
        </p>

        <div className="relative h-0">
          <Separator />
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 -mt-2 text-xs">{t("or")}</span>
          </div>
        </div>
        <GoogleSignIn />
        <div className="flex w-full"></div>
        <div className="flex items-center gap-4 text-sm justify-center h-4">
          <Link href="/sign-in" className="text-[#10A37F] hover:underline">
            {t("termsOfUse")}
          </Link>
          <Separator orientation="vertical" className="text-primary" />
          <Link href="/sign-in" className="text-[#10A37F] hover:underline">
            {t("privacyPolicy")}
          </Link>
        </div>
      </div>
    </div>
  );
}
