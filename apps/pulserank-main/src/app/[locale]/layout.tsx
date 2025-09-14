import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { NextStepProvider } from "nextstepjs";
import { TanstackQueryProvider } from "@/providers/tanstack-query-provider";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/providers/session-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import "./globals.css";
import IntercomProviderWrapper from "@/providers/intercom/intercom-provider";

export const metadata: Metadata = {
  title: "SEObserver",
  description: "SEObserver",
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Validate locale
  if (!locale || !["en", "fr"].includes(locale)) {
    console.error(`Invalid locale: ${locale}`);
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }

  return (
    <NextAuthProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Global error handler for Intercom
                window.addEventListener('error', function(event) {
                  if (event.error && (
                    event.error.message.includes('Intercom') || 
                    event.error.message.includes('location') ||
                    event.error.message.includes('Cannot read properties of null')
                  )) {
                    console.warn('Intercom error caught globally:', event.error.message);
                    event.preventDefault();
                    return false;
                  }
                });
                
                // Global unhandled rejection handler
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && (
                    event.reason.message.includes('Intercom') || 
                    event.reason.message.includes('location') ||
                    event.reason.message.includes('Cannot read properties of null')
                  )) {
                    console.warn('Intercom promise rejection caught globally:', event.reason.message);
                    event.preventDefault();
                    return false;
                  }
                });
              `,
            }}
          />
        </head>
        <body suppressHydrationWarning>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TanstackQueryProvider>
              <ErrorBoundary>
                <IntercomProviderWrapper>
                  <NextStepProvider>
                    {children}
                    <Toaster />
                  </NextStepProvider>
                </IntercomProviderWrapper>
              </ErrorBoundary>
            </TanstackQueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </NextAuthProvider>
  );
}
