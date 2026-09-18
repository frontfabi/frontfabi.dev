import Link from "next/link";
import { copy, type Locale } from "@/lib/site";
import {
  documents,
  documentPath,
  documentTitle,
  dateLabel,
} from "@/lib/content";
import { getDevArticles, type DevArticle } from "@/lib/devto";
import type { SiteSettings } from "@/lib/site-settings";
import type { SiteDocument } from "@/lib/content-types";
export async function WorkIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  const [experiences, community] = await Promise.all([
    documents("experience", locale),
    documents("community", locale),
  ]);
  return (
    <>
      <h1>{t.work}</h1>
      <nav className="category-links" aria-label={t.folders}>
        <a href="#professional">{t.professional}</a>
        <a href="#community">{t.community}</a>
      </nav>
      {[
        { id: "professional", title: t.professional, items: experiences },
        { id: "community", title: t.community, items: community },
      ].map((group) => (
        <section id={group.id} key={group.id}>
          <h2>{group.title}</h2>
          {group.items.length ? (
            <ul className="file-list">
              {group.items
                .sort((a, b) => {
                  const date = (d: SiteDocument) =>
                    d.type === "experience"
                      ? d.data.startDate || ""
                      : d.type === "community"
                        ? d.data.date || ""
                        : "";
                  return date(b).localeCompare(date(a));
                })
                .map((item) => (
                  <li key={item.id}>
                    <Link href={documentPath(item)!}>
                      <strong>{documentTitle(item)}</strong>
                      {item.type === "experience" && (
                        <>
                          <span>{item.data.jobTitle}</span>
                          <span className="meta">
                            {dateLabel(item.data.startDate, locale)} —{" "}
                            {dateLabel(item.data.endDate, locale) || t.present}
                          </span>
                        </>
                      )}
                      {item.type === "community" && (
                        <span className="meta">
                          {item.data.contribution} ·{" "}
                          {dateLabel(item.data.date, locale)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="empty-state">{t.empty}</p>
          )}
        </section>
      ))}
    </>
  );
}
export async function BlogIndex({ settings }: { settings: SiteSettings }) {
  let posts: DevArticle[] = [];
  try {
    posts = await getDevArticles(settings.blog.devUsername);
  } catch {
    posts = [];
  }
  return (
    <>
      <h1>{settings.blog.title}</h1>
      {settings.blog.intro && <p>{settings.blog.intro}</p>}
      <p className="meta">
        {posts.length} {settings.copy.posts.toLowerCase()}
      </p>
      {posts.length ? (
        <ul className="file-list posts">
          {posts.map((post) => (
            <li key={post.id}>
              <a href={post.url} target="_blank" rel="noreferrer">
                <strong>{post.title}</strong>
                <span>{post.description}</span>
                <span className="meta">
                  {post.tags.join(" · ")} · {post.readingTimeMinutes} min · {post.positiveReactionsCount} {settings.blog.reactionsLabel} · {post.commentsCount} {settings.blog.commentsLabel}
                </span>
                <span>{settings.blog.readOnDevLabel} ↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{settings.blog.emptyMessage}</p>
      )}
    </>
  );
}
