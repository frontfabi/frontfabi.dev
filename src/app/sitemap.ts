import type { MetadataRoute } from "next";
import {
  documents,
  documentPath,
  availableLocales,
  languageLinks,
} from "@/lib/content";
import { siteUrl, locales, localizedPath } from "@/lib/site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const langs = await availableLocales();
  const groups = await Promise.all(
    langs.flatMap((locale) =>
      (["page", "post", "experience", "community"] as const).map((type) =>
        documents(type, locale),
      ),
    ),
  );
  const entries: MetadataRoute.Sitemap = groups.flat().flatMap((doc) => {
    const path = documentPath(doc);
    return path
      ? [
          {
            url: new URL(path, siteUrl).href,
            lastModified: doc.last_publication_date,
            alternates: {
              languages: Object.fromEntries(
                Object.entries(languageLinks(doc)).map(([lang, url]) => [
                  locales[lang as keyof typeof locales],
                  new URL(url!, siteUrl).href,
                ]),
              ),
            },
          },
        ]
      : [];
  });
  for (const locale of langs) {
    const url = new URL(localizedPath("/", locale), siteUrl).href;
    if (!entries.some((entry) => entry.url === url)) entries.push({ url });
  }
  for (const locale of langs) {
    for (const [path, types] of [
      ["/blog", ["post"]],
      ["/trabalho", ["experience", "community"]],
    ] as [string, string[]][]) {
      const hasContent = groups
        .flat()
        .some(
          (doc) => doc.lang === locales[locale] && types.includes(doc.type),
        );
      const url = new URL(localizedPath(path as string, locale), siteUrl).href;
      if (hasContent && !entries.some((entry) => entry.url === url))
        entries.push({ url });
    }
  }
  return entries;
}
