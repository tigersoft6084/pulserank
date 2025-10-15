"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useLanguageStore } from "@/store/language-store";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { AxiosInstance } from "@/lib/axios-instance";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const t = useTranslations("settings");
  // const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const { setLocale } = useLanguageStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const handleProfileSave = async () => {
    const localErrors: typeof errors = {};
    if (!name.trim()) localErrors.name = t("profile.name") + " is required";
    if (!email.trim()) localErrors.email = t("profile.email") + " is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      localErrors.email = t("profile.email") + " is invalid";
    setErrors(localErrors);
    if (Object.keys(localErrors).length) return;

    try {
      await AxiosInstance.patch("/api/users/profile", { name, email });
      await update({ name, email });
      toast({ title: t("common.saved", { default: "Saved" }) });
    } catch (e) {
      console.error(e);
      toast({
        title: t("common.error", { default: "Error" }),
        variant: "destructive",
      });
    }
  };

  const handlePasswordSave = async () => {
    const localErrors: typeof errors = {};
    if (!password || password.length < 8)
      localErrors.password =
        t("security.password") + " must be at least 8 characters";
    setErrors(localErrors);
    if (Object.keys(localErrors).length) return;

    try {
      await AxiosInstance.patch("/api/users/password", {
        currentPassword: currentPassword || undefined,
        newPassword: password,
      });
      setPassword("");
      setCurrentPassword("");
      toast({ title: t("security.updated", { default: "Password updated" }) });
    } catch (e) {
      console.error(e);
      toast({
        title: t("common.error", { default: "Error" }),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title", { default: "Profile" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t("profile.name", { default: "Name" })}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t("profile.email", { default: "Email" })}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleProfileSave}>
              {t("common.save", { default: "Save" })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("security.title", { default: "Security" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">
              {t("security.currentPassword", { default: "Current Password" })}
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              {t("security.password", { default: "New Password" })}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handlePasswordSave}>
              {t("common.update", { default: "Update" })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("preferences.title", { default: "Preferences" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="grid gap-2">
            <Label>{t("preferences.theme", { default: "Theme" })}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  {t("preferences.light", { default: "Light" })}
                </SelectItem>
                <SelectItem value="dark">
                  {t("preferences.dark", { default: "Dark" })}
                </SelectItem>
                <SelectItem value="system">
                  {t("preferences.system", { default: "System" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* <Separator /> */}

          <div className="grid gap-2">
            <Label>{t("preferences.language", { default: "Language" })}</Label>
            <Select
              value={locale}
              onValueChange={(v) => {
                setLocale(v);
                // Use locale-aware router to switch language
                router.replace(pathname, { locale: v });
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
