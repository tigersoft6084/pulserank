import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid
  const validLocale = locale && ["en", "fr"].includes(locale) ? locale : "en";

  return {
    messages: (await import(`../messages/${validLocale}.json`)).default,
    locale: validLocale,
  };
});
