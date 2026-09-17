import { cache } from "react";
import { asText, NotFoundError } from "@prismicio/client";
import { createClient, routesForTypes } from "@/prismicio";
import { copy, locales, localizedPath, type Locale } from "./site";
import type { SiteDocument } from "./content-types";

export const repository = cache(async () => createClient().getRepository());
export const availableLocales = cache(async () => {
  const repo = await repository();
  return (Object.keys(locales) as Locale[]).filter((key) =>
    repo.languages.some((lang) => lang.id === locales[key]),
  );
});
export const documents = cache(
  async (type: SiteDocument["type"], locale: Locale) => {
    const repo = await repository();
    if (
      !repo.types[type] ||
      !repo.languages.some((lang) => lang.id === locales[locale])
    )
      return [];
    return createClient({ routes: routesForTypes(repo.types) }).getAllByType(
      type,
      { lang: locales[locale] },
    );
  },
);
export const document = cache(
  async (type: SiteDocument["type"], uid: string, locale: Locale) => {
    const repo = await repository();
    if (
      !repo.types[type] ||
      !repo.languages.some((lang) => lang.id === locales[locale])
    )
      return null;
    try {
      return await createClient({
        routes: routesForTypes(repo.types),
      }).getByUID(type, uid, { lang: locales[locale] });
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  },
);
export function documentTitle(doc: SiteDocument) {
  if (doc.type === "page" || doc.type === "post") return asText(doc.data.title);
  if (doc.type === "experience") return doc.data.company || doc.uid || "";
  return "name" in doc.data ? doc.data.name || doc.uid || "" : doc.uid || "";
}
export function documentPath(doc: {
  type: SiteDocument["type"];
  uid?: string | null;
  lang: string;
}) {
  const locale = (Object.keys(locales) as Locale[]).find(
    (key) => locales[key] === doc.lang,
  );
  if (!locale || !doc.uid) return null;
  const path =
    doc.type === "post"
      ? `/articles/${doc.uid}`
      : doc.type === "experience"
        ? `/trabalho/profissional/${doc.uid}`
        : doc.type === "community"
          ? `/trabalho/comunidade/${doc.uid}`
          : doc.type === "page"
            ? doc.uid === "home"
              ? "/"
              : doc.uid === "xp"
                ? "/trabalho"
                : `/${doc.uid}`
            : null;
  return path ? localizedPath(path, locale) : null;
}
export function languageLinks(
  doc: SiteDocument,
): Partial<Record<Locale, string>> {
  const links: Partial<Record<Locale, string>> = {};
  for (const item of [
    doc,
    ...doc.alternate_languages.map((alt) => ({ ...alt, type: doc.type })),
  ]) {
    const locale = (Object.keys(locales) as Locale[]).find(
      (key) => locales[key] === item.lang,
    );
    const path = documentPath(item);
    if (locale && path) links[locale] = path;
  }
  return links;
}
export function dateLabel(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ""
    : new Intl.DateTimeFormat(locales[locale], {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}
export function period(
  start: string | null,
  end: string | null,
  locale: Locale,
) {
  return [
    dateLabel(start, locale),
    end ? dateLabel(end, locale) : copy[locale].present,
  ]
    .filter(Boolean)
    .join(" — ");
}
