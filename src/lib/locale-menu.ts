import type { Locale } from "@/lib/site";

const localeLabels: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export function availableLocaleMenuItems(
  languages: Partial<Record<Locale, string>>,
) {
  return (Object.keys(localeLabels) as Locale[]).flatMap((locale) => {
    const href = languages[locale];
    return href ? [{ locale, label: localeLabels[locale], href }] : [];
  });
}
