import { copy, type Locale } from "./site.ts";

export const navigationKeys = ["about", "blog", "work", "contact"] as const;
export type NavigationKey = (typeof navigationKeys)[number];
export type NavigationItem = { key: NavigationKey; label: string };

export type SiteSettings = {
  navigation: NavigationItem[];
  contact: {
    heading: string;
    email: string;
    cvUrl: string;
    cvLabel: string;
    linkedinUrl: string;
    linkedinLabel: string;
    instagramUrl: string;
    instagramLabel: string;
  };
  blog: {
    devUsername: string;
    title: string;
    intro: string;
    emptyMessage: string;
    readOnDevLabel: string;
    reactionsLabel: string;
    commentsLabel: string;
  };
  copy: Record<string, string>;
  legacyArticleRedirects: { legacyUid: string; devArticleUrl: string }[];
};

const cvUrl =
  "https://frontfabi.cdn.prismic.io/frontfabi/Z5WBKZbqstJ992ad_CVFabiRodrigues-EN.pdf";

const localeLabel = (locale: Locale, values: Record<Locale, string>) =>
  values[locale];

export function fallbackSettings(locale: Locale): SiteSettings {
  const t = copy[locale];
  const contact = localeLabel(locale, {
    pt: "Contato",
    en: "Contact",
    es: "Contacto",
  });
  const computer = localeLabel(locale, {
    pt: "Meu computador",
    en: "My computer",
    es: "Mi ordenador",
  });

  return {
    navigation: [
      { key: "about", label: t.about },
      { key: "blog", label: t.blog },
      { key: "work", label: t.work },
      { key: "contact", label: contact },
    ],
    contact: {
      heading: t.contact,
      email: "falacomigo@frontfabi.dev",
      cvUrl,
      cvLabel: "CV.pdf",
      linkedinUrl: "https://linkedin.com/in/frontfabi",
      linkedinLabel: "LinkedIn",
      instagramUrl: "https://instagram.com/frontfabi",
      instagramLabel: "Instagram",
    },
    blog: {
      devUsername: "frontfabi",
      title: t.blog,
      intro: "",
      emptyMessage: t.empty,
      readOnDevLabel: localeLabel(locale, {
        pt: "Ler no DEV",
        en: "Read on DEV",
        es: "Leer en DEV",
      }),
      reactionsLabel: localeLabel(locale, {
        pt: "reações",
        en: "reactions",
        es: "reacciones",
      }),
      commentsLabel: localeLabel(locale, {
        pt: "comentários",
        en: "comments",
        es: "comentarios",
      }),
    },
    copy: {
      ...t,
      contact,
      computer,
      arrangeWindows: locale === "pt" ? "Organizar janelas" : "Arrange windows",
      helpTitle: locale === "pt" ? "Como navegar" : "How to navigate",
      helpBody:
        locale === "pt"
          ? "Arraste a barra de título para mover uma janela. Arraste o canto inferior direito para redimensionar. Use □ para maximizar e × para fechar."
          : "Drag a title bar to move a window. Drag its bottom-right corner to resize. Use □ to maximize and × to close.",
      helpKeyboard:
        locale === "pt"
          ? "Pelo teclado: Tab até a barra de título, setas para mover e Shift + setas para redimensionar. O logo frontfabi restaura a home."
          : "Keyboard: focus a title bar, use arrows to move or Shift + arrows to resize. The frontfabi logo restores the home screen.",
      languageNotice:
        locale === "pt"
          ? "As traduções disponíveis são publicadas pelo Prismic."
          : "Available translations are published through Prismic.",
    },
    legacyArticleRedirects: [],
  };
}

export function isValidNavigation(
  items: { key: string; label: string }[],
): items is NavigationItem[] {
  return (
    items.length === navigationKeys.length &&
    new Set(items.map((item) => item.key)).size === navigationKeys.length &&
    items.every(
      (item) =>
        navigationKeys.includes(item.key as NavigationKey) &&
        item.label.trim().length > 0,
    )
  );
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function httpsUrl(value: unknown, fallback: string) {
  const link = record(value);
  const url =
    typeof value === "string"
      ? value
      : typeof link.url === "string"
        ? link.url
        : "";
  try {
    return new URL(url).protocol === "https:" ? url : fallback;
  } catch {
    return fallback;
  }
}

export function settingsFromDocument(
  document: unknown,
  locale: Locale,
): SiteSettings {
  const fallback = fallbackSettings(locale);
  const data = record(record(document).data);
  const navigation = Array.isArray(data.navigation_items)
    ? data.navigation_items
        .map((item) => record(item))
        .map((item) => ({ key: String(item.key || ""), label: String(item.label || "") }))
    : [];
  const redirects = Array.isArray(data.legacy_article_redirects)
    ? data.legacy_article_redirects
        .map((item) => record(item))
        .map((item) => ({
          legacyUid: text(item.legacy_uid, ""),
          devArticleUrl: httpsUrl(item.dev_article_url, ""),
        }))
        .filter((item) => item.legacyUid && item.devArticleUrl)
    : fallback.legacyArticleRedirects;

  return {
    navigation: isValidNavigation(navigation) ? navigation : fallback.navigation,
    contact: {
      heading: text(data.contact_heading, fallback.contact.heading),
      email: text(data.contact_email, fallback.contact.email),
      cvUrl: httpsUrl(data.cv_link, fallback.contact.cvUrl),
      cvLabel: text(data.cv_label, fallback.contact.cvLabel),
      linkedinUrl: httpsUrl(data.linkedin_url, fallback.contact.linkedinUrl),
      linkedinLabel: text(data.linkedin_label, fallback.contact.linkedinLabel),
      instagramUrl: httpsUrl(data.instagram_url, fallback.contact.instagramUrl),
      instagramLabel: fallback.contact.instagramLabel,
    },
    blog: {
      devUsername: text(data.dev_username, fallback.blog.devUsername),
      title: text(data.blog_title, fallback.blog.title),
      intro: text(data.blog_intro, fallback.blog.intro),
      emptyMessage: text(data.blog_empty_message, fallback.blog.emptyMessage),
      readOnDevLabel: text(data.blog_read_on_dev_label, fallback.blog.readOnDevLabel),
      reactionsLabel: text(data.blog_reactions_label, fallback.blog.reactionsLabel),
      commentsLabel: text(data.blog_comments_label, fallback.blog.commentsLabel),
    },
    copy: fallback.copy,
    legacyArticleRedirects: redirects,
  };
}

export function legacyArticleRedirect(settings: SiteSettings, uid: string) {
  return (
    settings.legacyArticleRedirects.find((item) => item.legacyUid === uid)
      ?.devArticleUrl || null
  );
}
