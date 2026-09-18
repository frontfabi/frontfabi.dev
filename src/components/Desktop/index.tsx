"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { copy, localizedPath, type Locale } from "@/lib/site";
import Window from "./Window";

export function PixelIcon({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      unoptimized
    />
  );
}
type Utility = "contact" | "settings" | "help" | "computer";
const cv =
  "https://frontfabi.cdn.prismic.io/frontfabi/Z5WBKZbqstJ992ad_CVFabiRodrigues-EN.pdf";
export default function Desktop({
  children,
  locale,
  title,
  app,
  languages,
  detail,
  detailTitle,
  detailBack,
}: {
  children: React.ReactNode;
  detail?: React.ReactNode;
  detailTitle?: string;
  detailBack: string;
  locale: Locale;
  title?: string;
  app?: "about" | "blog" | "work";
  languages: Partial<Record<Locale, string>>;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [detailOpen, setDetailOpen] = useState(Boolean(detail));
  const [mainOpen, setMainOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [open, setOpen] = useState<Utility[]>(["contact"]);
  const [menu, setMenu] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const [orders, setOrders] = useState<Record<string, number>>({
    main: 2,
    contact: 1,
    detail: 3,
  });
  const focus = (id: string) =>
    setOrders((prev) => ({
      ...prev,
      [id]: Math.max(0, ...Object.values(prev)) + 1,
    }));
  const launch = (id: Utility) => {
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    focus(id);
    setMenu(null);
  };
  const restoreHome = () => {
    setDetailOpen(false);
    setMainOpen(true);
    setMinimized(false);
    setMenu(null);
    setReset((n) => n + 1);
    setOrders({ main: 2, contact: 1 });
  };
  const apps = [
    { key: "about", path: "/sobre", label: t.about },
    { key: "blog", path: "/blog", label: t.blog },
    { key: "work", path: "/trabalho", label: t.work },
  ];
  const contact =
    locale === "pt" ? "Contato" : locale === "es" ? "Contacto" : "Contact";
  const computer =
    locale === "pt"
      ? "Meu computador"
      : locale === "es"
        ? "Mi ordenador"
        : "My computer";
  const run = (action: () => void) => {
    action();
    setMenu(null);
  };
  const menus: Record<string, { label: string; action: () => void }[]> = {
    File: [
      ...apps.map((item) => ({
        label: item.label,
        action: () => {
          setMainOpen(true);
          setMinimized(false);
          router.push(localizedPath(item.path, locale));
        },
      })),
      { label: contact, action: () => launch("contact") },
      {
        label: "CV.pdf ↗",
        action: () => window.open(cv, "_blank", "noopener,noreferrer"),
      },
    ],
    Edit: [{ label: t.settings, action: () => launch("settings") }],
    View: [
      { label: computer, action: () => launch("computer") },
      { label: t.language, action: () => launch("settings") },
    ],
    Window: [
      {
        label: t.restore,
        action: () => {
          setMainOpen(true);
          setMinimized(false);
          focus("main");
        },
      },
      {
        label: locale === "pt" ? "Organizar janelas" : "Arrange windows",
        action: () => setReset((n) => n + 1),
      },
      {
        label: t.close,
        action: () => {
          setMainOpen(false);
          setDetailOpen(false);
          setOpen([]);
        },
      },
    ],
    Help: [
      {
        label: locale === "pt" ? "Como navegar" : "How to navigate",
        action: () => launch("help"),
      },
    ],
  };
  return (
    <div
      className={`desktop ${app ? "inside-app" : "home-desktop"} ${detailOpen ? "has-detail" : ""}`}
      lang={locale}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenu(null);
      }}
    >
      <a className="skip-link" href="#content">
        {t.skip}
      </a>
      <header className="system-panel">
        <h1 className="brand">
          <Link href={localizedPath("/", locale)} onClick={restoreHome}>
            frontfabi
          </Link>
        </h1>
        <nav className="system-menus" aria-label="Menu">
          {Object.entries(menus).map(([label, items]) => (
            <div
              className="menu-container"
              key={label}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setMenu((current) => (current === label ? null : current));
              }}
            >
              <button
                aria-expanded={menu === label}
                aria-controls={`menu-${label}`}
                onClick={() => setMenu(menu === label ? null : label)}
              >
                {label}
              </button>
              {menu === label && (
                <div id={`menu-${label}`} className="dropdown">
                  {items.map((item) => (
                    <button key={item.label} onClick={() => run(item.action)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <button
          className="panel-language"
          onClick={() => launch("settings")}
          aria-label={t.settings}
        >
          ◎ {locale.toUpperCase()} ▾
        </button>
      </header>
      <nav className="desktop-icons" aria-label={t.desktop}>
        <button className="app-icon" onClick={() => launch("computer")}>
          <span className="icon-tile">
            <PixelIcon name="computer" />
          </span>
          <span>{computer}</span>
        </button>
        {apps.map((item) => (
          <Link
            key={item.key}
            href={localizedPath(item.path, locale)}
            onClick={() => {
              setMainOpen(true);
              setMinimized(false);
              focus("main");
            }}
            className="app-icon"
            aria-current={app === item.key ? "page" : undefined}
          >
            <span className="icon-tile">
              <PixelIcon name={item.key} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button onClick={() => launch("contact")} className="app-icon">
          <span className="icon-tile">
            <PixelIcon name="mail" />
          </span>
          <span>{contact}</span>
        </button>
        <a href={cv} target="_blank" rel="noreferrer" className="app-icon">
          <span className="icon-tile">
            <PixelIcon name="blog" />
          </span>
          <span>Currículo.pdf</span>
        </a>
      </nav>
      <main id="content" tabIndex={-1}>
        {mainOpen && (
          <Window
            key={`main-${reset}`}
            title={`${title || t.about} — frontfabi.dev`}
            locale={locale}
            kind={`main ${app || "about"}`}
            order={orders.main}
            onFocus={() => focus("main")}
            minimized={minimized}
            onMinimize={() => setMinimized(true)}
            onClose={() => setMainOpen(false)}
          >
            <div className="app-layout">
              <nav className="window-sidebar" aria-label={t.desktop}>
                {apps.map((item) => (
                  <Link
                    key={item.key}
                    href={localizedPath(item.path, locale)}
                    onClick={() => {
                      setMainOpen(true);
                      setMinimized(false);
                      focus("main");
                    }}
                    aria-current={
                      (app || "about") === item.key ? "page" : undefined
                    }
                  >
                    □ {item.label}
                  </Link>
                ))}
                <button onClick={() => launch("contact")}>□ {contact}</button>
              </nav>
              <div className="document-content">{children}</div>
            </div>
            <footer className="window-status">{t.status}</footer>
          </Window>
        )}
        {open.map((id) => (
          <Window
            key={`${id}-${reset}`}
            title={
              id === "contact"
                ? `${contact}.txt`
                : id === "settings"
                  ? t.settings
                  : id === "computer"
                    ? computer
                    : "readme.txt"
            }
            locale={locale}
            kind={id}
            order={orders[id]}
            onFocus={() => focus(id)}
            onClose={() =>
              setOpen((prev) => prev.filter((item) => item !== id))
            }
          >
            {id === "contact" ? (
              <div className="contact-content">
                <p>{t.contact}</p>
                <a
                  className="email-link"
                  href="mailto:falacomigo@frontfabi.dev"
                >
                  falacomigo@frontfabi.dev
                </a>
                <div className="contact-links">
                  <a
                    href="https://linkedin.com/in/frontfabi"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ● LinkedIn
                  </a>
                  <a href={cv} target="_blank" rel="noreferrer">
                    ● Download CV
                  </a>
                </div>
              </div>
            ) : id === "settings" ? (
              <div className="utility-content">
                <h2>{t.language}</h2>
                <nav className="language-options" aria-label={t.language}>
                  {(["pt", "en", "es"] as const).map((lang) =>
                    languages[lang] ? (
                      <Link
                        key={lang}
                        href={languages[lang]!}
                        hrefLang={lang}
                        aria-current={locale === lang ? "true" : undefined}
                      >
                        {locale === lang ? "●" : "○"}{" "}
                        {
                          { pt: "Português", en: "English", es: "Español" }[
                            lang
                          ]
                        }
                      </Link>
                    ) : (
                      <span key={lang} aria-disabled="true">
                        {lang.toUpperCase()} · {t.unavailable}
                      </span>
                    ),
                  )}
                </nav>
                <p className="meta">
                  {locale === "pt"
                    ? "As traduções disponíveis são publicadas pelo Prismic."
                    : "Available translations are published through Prismic."}
                </p>
              </div>
            ) : id === "computer" ? (
              <div className="utility-content">
                <h2>frontfabi.dev</h2>
                <p>{t.hint}</p>
                <nav className="computer-apps">
                  {apps.map((item) => (
                    <Link
                      key={item.key}
                      href={localizedPath(item.path, locale)}
                      onClick={() => {
                        setMainOpen(true);
                        setMinimized(false);
                        focus("main");
                      }}
                    >
                      <PixelIcon name={item.key} />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ) : (
              <div className="utility-content">
                <h2>frontfabi OS</h2>
                <p>
                  {locale === "pt"
                    ? "Arraste a barra de título para mover uma janela. Arraste o canto inferior direito para redimensionar. Use □ para maximizar e × para fechar."
                    : "Drag a title bar to move a window. Drag its bottom-right corner to resize. Use □ to maximize and × to close."}
                </p>
                <p>
                  {locale === "pt"
                    ? "Pelo teclado: Tab até a barra de título, setas para mover e Shift + setas para redimensionar. O logo frontfabi restaura a home."
                    : "Keyboard: focus a title bar, use arrows to move or Shift + arrows to resize. The frontfabi logo restores the home screen."}
                </p>
                <a
                  href="https://www.streamlinehq.com/icons/pixel"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.credits}
                </a>
              </div>
            )}
          </Window>
        ))}
        {detail && detailOpen && (
          <Window
            key={`detail-${reset}`}
            title={detailTitle || title || "document.txt"}
            locale={locale}
            kind="detail"
            order={orders.detail}
            onFocus={() => focus("detail")}
            onClose={() => {
              setDetailOpen(false);
              router.push(detailBack);
            }}
          >
            {detail}
          </Window>
        )}
      </main>
      <nav className="dock" aria-label={t.desktop}>
        {apps.map((item) => (
          <Link
            key={item.key}
            href={localizedPath(item.path, locale)}
            onClick={() => {
              setMainOpen(true);
              setMinimized(false);
              focus("main");
            }}
            aria-current={app === item.key ? "page" : undefined}
          >
            <PixelIcon name={item.key} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button onClick={() => launch("contact")}>
          <PixelIcon name="mail" />
          <span>{contact}</span>
        </button>
        <a href={cv} target="_blank" rel="noreferrer">
          <PixelIcon name="blog" />
          <span>CV</span>
        </a>
        <button onClick={() => launch("settings")}>
          <PixelIcon name="settings" />
          <span>Config</span>
        </button>
        {minimized && (
          <button
            className="restore-task"
            onClick={() => {
              setMinimized(false);
              focus("main");
            }}
            aria-label={t.restore}
          >
            ↑<span>{t.restore}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
