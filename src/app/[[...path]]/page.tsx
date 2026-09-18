import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { asText } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import Desktop from "@/components/Desktop";
import MarkdownContent from "@/components/MarkdownContent";
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
import { metadataDescription, muralPath, profileTitle } from "@/lib/seo";
import type { SiteDocument } from "@/lib/content-types";
import type { SiteSettings } from "@/lib/site-settings";
import {
  devArticlePath,
  getDevArticle,
  getDevArticles,
  type DevArticleDetail,
} from "@/lib/devto";

type Props = { params: Promise<{ path?: string[] }> };

function ProfileActions({ settings }: { settings: SiteSettings }) {
  return (
    <div className="welcome-actions" aria-label="Redes sociais">
      <a
        className="button"
        href={settings.contact.linkedinUrl}
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn ↗
      </a>
      <a
        className="button"
        href={settings.contact.instagramUrl}
        target="_blank"
        rel="noreferrer"
      >
        Instagram ↗
      </a>
    </div>
  );
}

async function resolve(path?: string[]) {
  const { locale, segments } = parsePath(path);
  if (!(await availableLocales()).includes(locale)) notFound();
  if (segments.join("/") === "xp")
    permanentRedirect(localizedPath("/trabalho", locale));
  if (segments.join("/") === "home")
    permanentRedirect(localizedPath("/", locale));
  const section = segments[0] || "home";
  let doc: SiteDocument | null = null;
  let devArticle: DevArticleDetail | null = null;
  if (segments.length <= 1) doc = await document("page", section, locale);
  else if (segments.length === 2 && section === "articles") {
    const devArticleId = /^dev-(\d+)-/.exec(segments[1])?.[1];
    if (devArticleId) {
      const settings = await siteSettings(locale);
      devArticle = await getDevArticle(
        Number(devArticleId),
        settings.blog.devUsername,
      );
      if (
        devArticle &&
        segments[1] !== devArticlePath(devArticle).slice("/articles/".length)
      )
        permanentRedirect(localizedPath(devArticlePath(devArticle), locale));
    } else doc = await document("post", segments[1], locale);
  } else if (
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
    !devArticle &&
    (segments.length > 1 ||
      !["home", "sobre", "blog", "trabalho"].includes(section))
  )
    notFound();
  return { locale, section, doc, devArticle };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const { locale, section, doc, devArticle } = await resolve(path);
  const t = copy[locale];
  const profile =
    section === "home" || section === "sobre"
      ? await siteSettings(locale)
      : null;
  const title =
    section === "home"
      ? profileTitle(profile!.profile.name, profile!.profile.role)
      : devArticle
        ? devArticle.title
        : doc
          ? documentTitle(doc)
          : section === "sobre"
            ? profileTitle(profile!.profile.name, profile!.profile.role)
            : section === "blog"
              ? t.blog
              : t.work;
  const data = doc?.data;
  const description =
    devArticle?.description ||
    (data && "meta_description" in data
      ? metadataDescription(data.meta_description, t.intro)
      : profile
        ? metadataDescription(asText(profile.profile.description), t.intro)
        : t.intro);
  const image =
    devArticle?.coverImage ||
    (data && "meta_image" in data
      ? data.meta_image.url
      : data && "cover" in data
        ? data.cover.url
        : profile?.profile.avatarUrl);
  const blogHasPosts =
    section === "blog"
      ? await getDevArticles((await siteSettings(locale)).blog.devUsername)
          .then((posts) => posts.length > 0)
          .catch(() => false)
      : false;
  const hasContent =
    Boolean(doc) ||
    Boolean(devArticle) ||
    section === "home" ||
    section === "sobre" ||
    blogHasPosts ||
    (section === "trabalho" &&
      ((await documents("experience", locale)).length > 0 ||
        (await documents("community", locale)).length > 0));
  const canonical = devArticle?.url || `/${(path || []).join("/")}`;
  const languages = doc
    ? Object.fromEntries(
        Object.entries(languageLinks(doc)).map(([lang, url]) => [
          locales[lang as keyof typeof locales],
          url,
        ]),
      )
    : ["home", "sobre", "blog", "trabalho"].includes(section)
      ? Object.fromEntries(
          (await availableLocales()).map((lang) => [
            locales[lang],
            localizedPath(section === "home" ? "/" : `/${section}`, lang),
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
      siteName: "frontfabi.dev",
      type: doc?.type === "post" || devArticle ? "article" : "website",
      ...(image
        ? { images: [{ url: image, alt: profile?.profile.avatarAlt }] }
        : {}),
    },
    twitter: {
      card: "summary",
      title,
      description: description || undefined,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function SitePage({ params }: Props) {
  const { path } = await params;
  const { locale, section, doc, devArticle } = await resolve(path);
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
        <div className="detail-actions">
          <Link className="mural-post-link" href={muralPath(documentPath(doc)!)}>
            ☁ {t.commentOnMural}
          </Link>
          <Link href={href("/trabalho")}>← {t.work}</Link>
        </div>
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
  else if (devArticle)
    content = (
      <article className="document-sheet dev-article">
        <h1>{devArticle.title}</h1>
        <p className="meta">
          {dateLabel(devArticle.publishedAt, locale)} ·{" "}
          {devArticle.tags.join(" · ")} · {devArticle.readingTimeMinutes} min
        </p>
        {devArticle.coverImage && <img src={devArticle.coverImage} alt="" />}
        <MarkdownContent>{devArticle.bodyMarkdown}</MarkdownContent>
        <p className="dev-article-actions">
          <a href={devArticle.url} target="_blank" rel="noreferrer">
            {settings.blog.readOnDevLabel} — {devArticle.positiveReactionsCount}{" "}
            {settings.blog.reactionsLabel} · {devArticle.commentsCount}{" "}
            {settings.blog.commentsLabel} ↗
          </a>
        </p>
        <div className="detail-actions">
          <Link
            className="mural-post-link"
            href={muralPath(localizedPath(devArticlePath(devArticle), locale))}
          >
            ☁ {t.commentOnMural}
          </Link>
          <Link href={href("/blog")}>← {t.blog}</Link>
        </div>
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
        <div className="detail-actions">
          <Link className="mural-post-link" href={muralPath(documentPath(doc)!)}>
            ☁ {t.commentOnMural}
          </Link>
          <Link href={href("/blog")}>← {t.blog}</Link>
        </div>
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
          <div className="welcome-heading">
            <div>
              <h1>{settings.profile.name}</h1>
              <p className="eyebrow">{settings.profile.role}</p>
            </div>
            <img
              className="welcome-avatar"
              src={settings.profile.avatarUrl}
              alt={settings.profile.avatarAlt}
            />
          </div>
          <PrismicRichText field={settings.profile.description} />
          <ProfileActions settings={settings} />
        </div>
      </div>
    );
  else if (section === "sobre")
    content = (
      <article className="document-sheet about-page">
        <div className="welcome-heading">
          <div>
            <h1>{settings.profile.name}</h1>
            <p className="eyebrow">{settings.profile.role}</p>
          </div>
          <img
            className="welcome-avatar"
            src={settings.profile.avatarUrl}
            alt={settings.profile.avatarAlt}
          />
        </div>
        <PrismicRichText field={settings.profile.description} />
        <ProfileActions settings={settings} />
      </article>
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
    Boolean(devArticle) ||
    Boolean(doc && ["post", "experience", "community"].includes(doc.type));
  const profileSchema =
    section === "home" || section === "sobre"
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings.profile.name,
          jobTitle: settings.profile.role,
          url: new URL(section === "home" ? "/" : "/sobre", siteUrl).href,
          image: settings.profile.avatarUrl,
          sameAs: [
            settings.contact.linkedinUrl,
            settings.contact.instagramUrl,
          ],
        }
      : null;
  return (
    <Desktop
      key={`${locale}/${path?.join("/")}`}
      locale={locale}
      app={app}
      title={title}
      languages={languages}
      detail={isDetail ? content : undefined}
      detailTitle={
        isDetail
          ? devArticle
            ? `dev-${devArticle.id}.txt`
            : `${doc!.uid}.txt`
          : undefined
      }
      detailBack={href(app === "work" ? "/trabalho" : "/blog")}
    >
      {isDetail ? (
        app === "work" ? (
          <WorkIndex locale={locale} />
        ) : (
          <BlogIndex settings={settings} />
        )
      ) : (
        <>
          {content}
          {profileSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(profileSchema).replace(/</g, "\\u003c"),
              }}
            />
          )}
        </>
      )}
    </Desktop>
  );
}
