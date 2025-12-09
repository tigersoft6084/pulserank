import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /favicon.ico, /sitemap.xml (static files)
  // - /icons (static icons)
  // - /logo.svg (static logo)
  matcher: [
    "/((?!api|_next|_vercel|icons|flags|fonts|images|favicon.ico|sitemap.xml|logo.svg).*)",
  ],
};
