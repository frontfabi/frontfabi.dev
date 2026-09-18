import type { MetadataRoute } from "next";
import {
  documents,
  documentPath,
  availableLocales,
  languageLinks,
  siteSettings,
} from "@/lib/content";
import { getDevArticles } from "@/lib/devto";
import { siteUrl, locales, localizedPath } from "@/lib/site";
import { staticSitePaths } from "@/lib/seo";
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
  for (const path of staticSitePaths(langs)) {
    const url = new URL(path, siteUrl).href;
    const section = path.endsWith("/sobre") ? "/sobre" : "/";
    if (!entries.some((entry) => entry.url === url))
      entries.push({
        url,
        alternates: {
          languages: Object.fromEntries(
            langs.map((locale) => [
              locales[locale],
              new URL(localizedPath(section, locale), siteUrl).href,
            ]),
          ),
        },
      });
  }
  for (const locale of langs) {
    const blogPosts = await getDevArticles(
      (await siteSettings(locale)).blog.devUsername,
    ).catch(() => []);
    for (const [path, types] of [
      ["/blog", ["post"]],
      ["/trabalho", ["experience", "community"]],
    ] as [string, string[]][]) {
      const hasContent =
        (path === "/blog" && blogPosts.length > 0) ||
        groups
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
