import Link from "next/link";
import { asText } from "@prismicio/client";
import { copy, type Locale } from "@/lib/site";
import {
  documents,
  documentPath,
  documentTitle,
  dateLabel,
} from "@/lib/content";
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
export async function BlogIndex({ locale }: { locale: Locale }) {
  const t = copy[locale];

  const posts = (await documents("post", locale))
    .filter((item) => item.type === "post")
    .sort((a, b) =>
      (b.data.published_date || b.first_publication_date).localeCompare(
        a.data.published_date || a.first_publication_date,
      ),
    );
  return (
    <>
      <h1>{t.blog}</h1>
      <p className="meta">
        {posts.length} {t.posts.toLowerCase()}
      </p>
      {posts.length ? (
        <ul className="file-list posts">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={documentPath(post)!}>
                <strong>{asText(post.data.title)}</strong>
                <span>{post.data.excerpt}</span>
                <span className="meta">
                  {dateLabel(post.data.published_date, locale)} ·{" "}
                  {post.data.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{t.empty}</p>
      )}
    </>
  );
}
