import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { asText } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import Desktop from "@/components/Desktop";
import { WorkIndex, BlogIndex } from "@/components/ContentIndexes";
import { ProfessionalRow } from "@/components/ProfessionalRow";
import { components } from "@/slices";
import {
  availableLocales,
  document,
  documents,
  documentPath,
  documentTitle,
  languageLinks,
  dateLabel,
  siteSettings,
} from "@/lib/content";
import { copy, locales, localizedPath, parsePath, siteUrl } from "@/lib/site";
import type { SiteDocument } from "@/lib/content-types";

type Props = { params: Promise<{ path?: string[] }> };
async function resolve(path?: string[]) {
  const { locale, segments } = parsePath(path);
  if (!(await availableLocales()).includes(locale)) notFound();
  if (segments.join("/") === "xp")
    permanentRedirect(localizedPath("/trabalho", locale));
  if (segments.join("/") === "home")
    permanentRedirect(localizedPath("/", locale));
  const section = segments[0] || "home";
  let doc: SiteDocument | null = null;
  if (segments.length <= 1) doc = await document("page", section, locale);
  else if (segments.length === 2 && section === "articles")
    doc = await document("post", segments[1], locale);
  else if (
    segments.length === 3 &&
    section === "trabalho" &&
    ["profissional", "comunidade"].includes(segments[1])
  )
    doc = await document(
      segments[1] === "profissional" ? "experience" : "community",
      segments[2],
      locale,
    );
  else notFound();
  if (
    !doc &&
    (segments.length > 1 ||
      !["home", "sobre", "blog", "trabalho"].includes(section))
  )
    notFound();
  return { locale, section, doc };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const { locale, section, doc } = await resolve(path);
  const t = copy[locale];
  const title =
    section === "home"
      ? "Fabiana Rodrigues · Front-end developer"
      : doc
        ? documentTitle(doc)
        : section === "sobre"
          ? t.about
          : section === "blog"
            ? t.blog
            : t.work;
  const data = doc?.data;
  const description =
    data && "meta_description" in data ? data.meta_description : t.intro;
  const image =
    data && "meta_image" in data
      ? data.meta_image.url
      : data && "cover" in data
        ? data.cover.url
        : undefined;
  const hasContent =
    Boolean(doc) ||
    section === "home" ||
    (section === "blog" && (await documents("post", locale)).length > 0) ||
    (section === "trabalho" &&
      ((await documents("experience", locale)).length > 0 ||
        (await documents("community", locale)).length > 0));
  const canonical = `/${(path || []).join("/")}`;
  const languages = doc
    ? Object.fromEntries(
        Object.entries(languageLinks(doc)).map(([lang, url]) => [
          locales[lang as keyof typeof locales],
          url,
        ]),
      )
    : undefined;
  return {
    title:
      data && "meta_title" in data && data.meta_title ? data.meta_title : title,
    description,
    alternates: { canonical, languages },
    robots: !hasContent ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
      locale: locales[locale].replace("-", "_"),
      type: doc?.type === "post" ? "article" : "website",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function SitePage({ params }: Props) {
  const { path } = await params;
  const { locale, section, doc } = await resolve(path);
  const settings = await siteSettings(locale);
  const t = copy[locale];
  const href = (path: string) => localizedPath(path, locale);
  const app =
    section === "home"
      ? undefined
      : section === "blog" || section === "articles"
        ? "blog"
        : section === "trabalho"
          ? "work"
          : "about";
  const languages =
    doc && doc.type !== "page"
      ? languageLinks(doc)
      : Object.fromEntries(
          (await availableLocales()).map((lang) => [
            lang,
            localizedPath(section === "home" ? "/" : `/${section}`, lang),
          ]),
        );
  const title = app === "work" ? t.work : app === "blog" ? t.blog : t.about;
  let content;
  if (doc?.type === "experience")
    content = (
      <article className="document-sheet">
        <h1>{documentTitle(doc)}</h1>
        <ProfessionalRow {...doc.data} locale={locale} />
        <Link href={href("/trabalho")}>← {t.work}</Link>
      </article>
    );
  else if (doc?.type === "community")
    content = (
      <article className="document-sheet">
        <h1>{documentTitle(doc)}</h1>
        <p className="meta">
          {doc.data.contribution} · {dateLabel(doc.data.date, locale)}
        </p>
        <PrismicRichText field={doc.data.description} />
        <PrismicNextLink field={doc.data.link}>{t.read} ↗</PrismicNextLink>
        <div className="gallery">
          {doc.data.gallery.map((item, i) => (
            <PrismicNextImage key={i} field={item.photo} />
          ))}
        </div>
        <Link href={href("/trabalho")}>← {t.work}</Link>
      </article>
    );
  else if (doc?.type === "post")
    content = (
      <article className="document-sheet">
        <h1>{asText(doc.data.title)}</h1>
        <p className="meta">
          {dateLabel(doc.data.published_date, locale)} · {doc.data.category}
        </p>
        <PrismicNextImage field={doc.data.cover} />
        <PrismicRichText
          field={doc.data.body}
          components={{
            hyperlink: ({ node, children }) => (
              <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
            ),
          }}
        />
        <Link href={href("/blog")}>← {t.blog}</Link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: asText(doc.data.title),
              datePublished:
                doc.data.published_date || doc.first_publication_date,
              dateModified: doc.last_publication_date,
              author: {
                "@type": "Person",
                name: "Fabiana Rodrigues",
                url: siteUrl,
              },
              mainEntityOfPage: new URL(documentPath(doc)!, siteUrl).href,
            }).replace(/</g, "\\u003c"),
          }}
        />
      </article>
    );
  else if (section === "trabalho") content = <WorkIndex locale={locale} />;
  else if (section === "blog") content = <BlogIndex settings={settings} />;
  else if (section === "home")
    content = (
      <div className="welcome-window">
        <div className="window-title">sobre — frontfabi.dev</div>
        <div className="welcome-body">
          <span className="sticker">EST. 2007</span>
          <h1>Fabiana Rodrigues</h1>
          <p className="eyebrow">Front-end developer · frontfabi.dev</p>
          {doc?.type === "page" && doc.data.home_intro?.length ? (
            <PrismicRichText field={doc.data.home_intro} />
          ) : (
            <>
              <p>{t.welcome}</p>
              <p>{t.intro}</p>
            </>
          )}
          <Link className="button" href={href("/sobre")}>
            {t.about} ↗
          </Link>
        </div>
      </div>
    );
  else
    content = (
      <>
        <h1>{doc ? documentTitle(doc) : t.about}</h1>
        {doc?.type === "page" ? (
          <SliceZone
            slices={doc.data.slices.filter(
              (slice) => slice.slice_type !== "navigation",
            )}
            components={components}
          />
        ) : (
          <p className="empty-state">{t.missing}</p>
        )}
      </>
    );
  const isDetail =
    doc && ["post", "experience", "community"].includes(doc.type);
  return (
    <Desktop
      key={`${locale}/${path?.join("/")}`}
      locale={locale}
      app={app}
      title={title}
      languages={languages}
      detail={isDetail ? content : undefined}
      detailTitle={isDetail ? `${doc.uid}.txt` : undefined}
      detailBack={href(app === "work" ? "/trabalho" : "/blog")}
    >
      {isDetail ? (
        app === "work" ? (
          <WorkIndex locale={locale} />
        ) : (
          <BlogIndex settings={settings} />
        )
      ) : (
        content
      )}
    </Desktop>
  );
}
