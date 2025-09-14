import "@/css/satoshi.css";
import "@/css/style.css";
import { Providers } from "@/providers/theme-provider";
import { TanstackQueryProvider } from "@/providers/tanstack-query-provider";
import NextAuthProvider from "@/providers/session-provider";
import { ToastProvider } from "../providers/toast-provider";
import ToastContainer from "../components/ui/toast-container";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-..."
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <NextAuthProvider>
          <TanstackQueryProvider>
            <ToastProvider>
              <Providers>{children}</Providers>
              <ToastContainer />
            </ToastProvider>
          </TanstackQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
