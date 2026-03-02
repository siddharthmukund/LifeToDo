import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { i18nConfig } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load messages. We resolve all namespaces concurrently
  // (In production, maybe selectively load based on route, 
  // but next-intl caches well and JSONs are small)
  const messages: Record<string, any> = {};

  await Promise.all(
    i18nConfig.namespaces.map(async (ns) => {
      try {
        const mod = await import(`../../messages/${locale}/${ns}.json`);
        messages[ns] = mod.default;
      } catch (e) {
        // Fallback to English if missing translation namespace layer
        try {
          const fallbackMod = await import(`../../messages/en/${ns}.json`);
          messages[ns] = fallbackMod.default;
        } catch (err) {
          console.error(`Missing translation namespace: ${ns} for locale: ${locale} and fallback en`);
        }
      }
    })
  );

  return {
    locale,
    messages
  };
});
