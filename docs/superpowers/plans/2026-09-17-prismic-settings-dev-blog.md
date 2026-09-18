# Prismic Settings and DEV Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Prismic the localized source for static site content and use DEV as the canonical, interactive blog platform.

**Architecture:** A single localized `site_settings` document is fetched once per server-rendered route and converted to a typed UI settings object with compiled fallbacks. A separate cached DEV client fetches `frontfabi` articles for the blog index; articles link out to DEV, where reactions and comments remain native.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prismic client/Slice Machine, DEV public API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-17-prismic-settings-dev-blog-design.md`

## Global Constraints

- Keep Prismic as the source of static and structural content; DEV owns article bodies, comments, likes, and moderation.
- Do not introduce a visitor database, custom authentication, DEV API key, or client-side secret.
- Keep `page`, `experience`, and `community` documents and their existing URLs working.
- Do not delete the existing `post` custom type or remote content in this release.
- DEV articles are canonical and open externally with an explicit accessible label and `rel="noreferrer"`.
- Query DEV server-side with a descriptive User-Agent and a six-hour Next.js revalidation interval.
- Preserve a localized compiled fallback only for unavailable or incomplete `site_settings` documents.
- Ship Hannover Messe only after a licensed WOFF2 asset and its license notice are provided; retain Silkscreen if they are absent.
- Validate with `npm run lint`, `npx tsc --noEmit`, `node --experimental-strip-types --test tests/*.test.mjs`, and `npm run build` before merge.

---

## Planned file structure

- Create `customtypes/site_settings/index.json`: localized singleton Prismic schema.
- Create `src/lib/site-settings.ts`: normalized settings type, fallback, CMS mapping, and navigation validation.
- Create `src/lib/devto.ts`: DEV response boundary, mapper, and cached fetcher.
- Create `tests/site-settings.test.mjs`: settings fallback and navigation validation tests.
- Create `tests/devto.test.mjs`: DEV payload mapper and fetch URL tests.
- Modify `src/lib/content.ts`: query `site_settings` by locale.
- Modify `src/lib/content-types.ts`: add the temporary additive `SiteSettingsDocument` type.
- Modify `src/lib/site.ts`, `src/components/Desktop/index.tsx`, `src/components/ContentIndexes.tsx`, and `src/app/[[...path]]/page.tsx`: consume settings and DEV blog data rather than hard-coded copy/Prismic posts.
- Modify `src/theme/global.css`: conditionally register and apply Hannover Messe.
- Modify `README.md` and `.env.example`: document Prismic sync, DEV source-of-truth, and optional font asset.

### Task 1: Model and normalize localized site settings

**Files:**
- Create: `customtypes/site_settings/index.json`
- Create: `src/lib/site-settings.ts`
- Create: `tests/site-settings.test.mjs`
- Modify: `src/lib/content-types.ts`
- Modify: `src/lib/content.ts`

**Interfaces:**
- Produces `SiteSettings`, `fallbackSettings(locale)`, `settingsFromDocument(document, locale)`, and `isValidNavigation(items)` from `src/lib/site-settings.ts`.
- Produces `siteSettings(locale)` from `src/lib/content.ts`, returning `Promise<SiteSettings>`.
- Consumes Prismic's localized singleton `site_settings` document when it exists.

- [ ] **Step 1: Write failing settings-normalization tests**

Create `tests/site-settings.test.mjs` with exact checks for a missing document,
an incomplete navigation group, and a complete Portuguese group:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  fallbackSettings,
  isValidNavigation,
  settingsFromDocument,
} from "../src/lib/site-settings.ts";

test("falls back to compiled Portuguese copy without a settings document", () => {
  assert.equal(settingsFromDocument(null, "pt").contact.email, "falacomigo@frontfabi.dev");
  assert.equal(settingsFromDocument(null, "pt").blog.devUsername, "frontfabi");
});

test("accepts each required navigation key exactly once", () => {
  assert.equal(isValidNavigation([
    { key: "about", label: "Sobre" }, { key: "blog", label: "Blog" },
    { key: "work", label: "Trabalho" }, { key: "contact", label: "Contato" },
  ]), true);
  assert.equal(isValidNavigation([{ key: "about", label: "Sobre" }]), false);
});

test("keeps fallback navigation when CMS navigation is incomplete", () => {
  const settings = settingsFromDocument({ data: { navigation_items: [{ key: "about", label: "Sobre" }] } }, "pt");
  assert.deepEqual(settings.navigation.map((item) => item.key), ["about", "blog", "work", "contact"]);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the module is absent**

Run: `node --experimental-strip-types --test tests/site-settings.test.mjs`

Expected: failure resolving `src/lib/site-settings.ts`.

- [ ] **Step 3: Add the singleton schema and minimal mapper**

Create `customtypes/site_settings/index.json` with `format: "custom"`,
`repeatable: false`, and tabs `Identity & Home`, `Contact`, `Navigation`,
`UI Copy`, and `Blog`. Add all fields named in the approved spec. Configure
`navigation_items` as a repeatable `Group` with `key` Select options
`about`, `blog`, `work`, `contact` and `label` Text. Configure
`legacy_article_redirects` as a `Group` with `legacy_uid` Text and
`dev_article_url` Link.

Implement this exact public shape in `src/lib/site-settings.ts`:

```ts
export type SiteSettings = {
  navigation: { key: "about" | "blog" | "work" | "contact"; label: string }[];
  contact: { heading: string; email: string; cvUrl: string; cvLabel: string; linkedinUrl: string; linkedinLabel: string };
  blog: { devUsername: string; title: string; intro: string; emptyMessage: string; readOnDevLabel: string; reactionsLabel: string; commentsLabel: string };
  copy: Record<string, string>;
  legacyArticleRedirects: { legacyUid: string; devArticleUrl: string }[];
};

export function siteSettingsFromDocument(document: unknown, locale: Locale): SiteSettings;
export function fallbackSettings(locale: Locale): SiteSettings;
export function isValidNavigation(items: { key: string; label: string }[]): boolean;
```

Use the current `copy` object and Desktop constants only to construct the
fallback. Map a filled CMS field over its fallback equivalent. Reject invalid
external URLs with `new URL(value)` and keep the fallback URL. Accept only a
complete, unique four-item navigation group.

Add a temporary additive `SiteSettingsDocument` to `src/lib/content-types.ts`
with optional fields so TypeScript compiles before Slice Machine generates the
official types. Extend `SiteDocument` with it. In `src/lib/content.ts`, add a
cached `siteSettings(locale)` query that checks repository type/language
availability, calls `getSingle("site_settings", { lang })`, catches
`NotFoundError`, and normalizes its result.

- [ ] **Step 4: Run normalization tests and type-check**

Run: `node --experimental-strip-types --test tests/site-settings.test.mjs && npx tsc --noEmit`

Expected: all three tests pass and TypeScript reports no errors.

- [ ] **Step 5: Commit the settings foundation**

```bash
git add customtypes/site_settings/index.json src/lib/site-settings.ts src/lib/content-types.ts src/lib/content.ts tests/site-settings.test.mjs
git commit -m "feat: add localized site settings model"
```

### Task 2: Add a safe, cached DEV article client

**Files:**
- Create: `src/lib/devto.ts`
- Create: `tests/devto.test.mjs`

**Interfaces:**
- Consumes `settings.blog.devUsername` from Task 1.
- Produces `DevArticle`, `mapDevArticle(value)`, and `getDevArticles(username)`.
- Is consumed by `BlogIndex` in Task 3.

- [ ] **Step 1: Write failing DEV mapper tests**

Create `tests/devto.test.mjs` with a representative DEV list item and a
malformed item:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { mapDevArticle } from "../src/lib/devto.ts";

test("maps public DEV metrics and article URL", () => {
  const article = mapDevArticle({
    id: 1186668, title: "Um post", description: "Resumo", slug: "um-post",
    url: "https://dev.to/frontfabi/um-post", published_at: "2022-09-07T03:08:53Z",
    tag_list: ["devrel"], cover_image: null, reading_time_minutes: 2,
    positive_reactions_count: 7, comments_count: 0,
  });
  assert.deepEqual(article, {
    id: 1186668, title: "Um post", description: "Resumo", slug: "um-post",
    url: "https://dev.to/frontfabi/um-post", publishedAt: "2022-09-07T03:08:53Z",
    tags: ["devrel"], coverImage: null, readingTimeMinutes: 2,
    positiveReactionsCount: 7, commentsCount: 0,
  });
});

test("rejects an article without an HTTPS DEV URL", () => {
  assert.equal(mapDevArticle({ id: 1, url: "javascript:alert(1)" }), null);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the module is absent**

Run: `node --experimental-strip-types --test tests/devto.test.mjs`

Expected: failure resolving `src/lib/devto.ts`.

- [ ] **Step 3: Implement the DEV boundary and fetcher**

Create `src/lib/devto.ts`. Require a positive integer ID, nonempty title,
description and slug, ISO date string, and an `https://dev.to/` URL in
`mapDevArticle`; normalize missing tags to `[]`, image to `null`, and metrics
to zero. Export this exact function:

```ts
export async function getDevArticles(username: string): Promise<DevArticle[]> {
  const response = await fetch(
    `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=100`,
    { headers: { "User-Agent": "frontfabi.dev blog index" }, next: { revalidate: 21600 } },
  );
  if (!response.ok) throw new Error(`DEV API request failed: ${response.status}`);
  const value: unknown = await response.json();
  return Array.isArray(value) ? value.map(mapDevArticle).filter((item): item is DevArticle => item !== null) : [];
}
```

The function does not accept a token and does not call article creation,
comment, or reaction endpoints.

- [ ] **Step 4: Run DEV tests and lint**

Run: `node --experimental-strip-types --test tests/devto.test.mjs && npm run lint`

Expected: both DEV tests pass and ESLint exits zero.

- [ ] **Step 5: Commit the DEV client**

```bash
git add src/lib/devto.ts tests/devto.test.mjs
git commit -m "feat: fetch DEV articles for blog index"
```

### Task 3: Render settings and DEV articles in the desktop shell

**Files:**
- Modify: `src/components/Desktop/index.tsx`
- Modify: `src/components/ContentIndexes.tsx`
- Modify: `src/app/[[...path]]/page.tsx`
- Modify: `src/lib/site.ts`
- Modify: `tests/desktop.test.mjs`

**Interfaces:**
- Consumes `SiteSettings` from Task 1 and `getDevArticles()` from Task 2.
- Produces a Blog index whose articles link to DEV, and a Desktop shell whose
  editorial labels/URLs come from `SiteSettings`.
- Leaves interaction logic and window geometry unchanged.

- [ ] **Step 1: Write failing route and blog rendering tests**

Extend `tests/desktop.test.mjs` with the new URL rule:

```js
test("legacy article paths stay representable while DEV owns new articles", () => {
  assert.equal(localizedPath("/articles/old-post", "pt"), "/articles/old-post");
  assert.equal(localizedPath("/blog", "en"), "/en/blog");
});
```

Add a focused pure helper test in `tests/site-settings.test.mjs` for resolving
`legacyUid` to the configured HTTPS DEV URL and returning `null` for an unknown
UID. It must initially fail because the resolver is absent.

- [ ] **Step 2: Run the relevant tests and confirm the new resolver test fails**

Run: `node --experimental-strip-types --test tests/site-settings.test.mjs tests/desktop.test.mjs`

Expected: failure naming the missing legacy redirect resolver.

- [ ] **Step 3: Pass normalized settings through server components**

Add `legacyArticleRedirect(settings, uid): string | null` to
`src/lib/site-settings.ts`. In `page.tsx`, fetch `siteSettings(locale)` in
`resolve()`. For `/articles/:uid`, permanently redirect only when this function
returns a URL; otherwise call `notFound()`. Remove the Prismic `post` detail
branch and remove `post` from sitemap/content page discovery while retaining
the custom type on disk.

Change `Desktop` to accept `settings: SiteSettings`, replace its contact/CV,
navigation labels, home/utility text, and desktop labels with settings values.
Keep the internal `Utility` identifiers in code. Pass settings from `SitePage`.

Change `BlogIndex` to accept `{ locale, settings }`; call
`getDevArticles(settings.blog.devUsername)` in a `try/catch`. Render article
metadata as `reactions · comments · reading time`, and make every article link
an external `<a href={article.url} target="_blank" rel="noreferrer">` whose
text includes `settings.blog.readOnDevLabel`. If the request fails or has no
valid entries, render `settings.blog.emptyMessage`. Do not render DEV HTML or
Markdown inside frontfabi.dev.

Retain `copy` only as `fallbackSettings` input; remove direct `copy[locale]`
consumption from Desktop and ContentIndexes.

- [ ] **Step 4: Run focused tests, type-check, and inspect the development page**

Run: `node --experimental-strip-types --test tests/*.test.mjs && npx tsc --noEmit && npm run build`

Expected: all tests, types, and build pass. With `npm run next:dev`, visit
`/blog` and confirm the three current DEV articles render with their live
reaction/comment counts and external DEV links.

- [ ] **Step 5: Commit the presentation migration**

```bash
git add src/components/Desktop/index.tsx src/components/ContentIndexes.tsx src/app/[[...path]]/page.tsx src/lib/site.ts src/lib/site-settings.ts tests/desktop.test.mjs tests/site-settings.test.mjs
git commit -m "feat: render blog from DEV and desktop from site settings"
```

### Task 4: Add the heading-font integration and operational documentation

**Files:**
- Create: `public/fonts/HannoverMesseSans.woff2` only after receiving the licensed file
- Create: `public/fonts/HannoverMesse-LICENSE.txt` only from the received license terms
- Modify: `src/theme/global.css`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes the licensed local font asset.
- Produces `Hannover Messe Sans` rendering for semantic headings and `.brand`.
- Documents the Prismic model sync and DEV blog source-of-truth workflow.

- [ ] **Step 1: Write a font-application assertion before adding CSS**

Add this check to `tests/site-settings.test.mjs` using `readFile`:

```js
import { readFile } from "node:fs/promises";

test("semantic headings declare Hannover Messe before fallback fonts", async () => {
  const css = await readFile(new URL("../src/theme/global.css", import.meta.url), "utf8");
  assert.match(css, /h1,\s*h2,\s*h3,\s*\.brand[\s\S]*font-family: Hannover Messe Sans,/);
});
```

- [ ] **Step 2: Run the assertion and confirm it fails**

Run: `node --experimental-strip-types --test tests/site-settings.test.mjs`

Expected: the font declaration assertion fails.

- [ ] **Step 3: Add font declaration only with the licensed asset**

After the font license and WOFF2 file are supplied, add:

```css
@font-face {
  font-family: "Hannover Messe Sans";
  src: url("/fonts/HannoverMesseSans.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Split the current combined Silkscreen selector so `h1`, `h2`, `h3`, and
`.brand` use `"Hannover Messe Sans", Silkscreen, monospace`; leave all other
selectors in that group on Silkscreen. Update `.env.example` with
`NEXT_PUBLIC_PRISMIC_ENVIRONMENT=frontfabi` and `NEXT_PUBLIC_SITE_URL`, and
update README with exact Slice Machine synchronization, `site_settings`
document creation, DEV feed behavior, legacy redirects, and the no-key policy.

- [ ] **Step 4: Run full verification and manual responsive checks**

Run: `npm run lint && npx tsc --noEmit && node --experimental-strip-types --test tests/*.test.mjs && npm run build`

Expected: all commands exit zero. In a Vercel Preview Deployment, inspect
Portuguese accented headings on `/`, `/sobre`, `/trabalho`, and `/blog` at
375px and 1280px; verify OS chrome still uses Silkscreen and Blog articles
open DEV in a separate tab.

- [ ] **Step 5: Commit documentation and licensed font integration**

```bash
git add src/theme/global.css public/fonts/HannoverMesseSans.woff2 public/fonts/HannoverMesse-LICENSE.txt .env.example README.md tests/site-settings.test.mjs
git commit -m "feat: add Hannover Messe headings and document CMS workflow"
```

## Plan self-review

- **Spec coverage:** Task 1 implements localized settings and fallbacks; Task 2
  implements DEV ownership and cache behavior; Task 3 changes public routing,
  UI, metrics, and redirects; Task 4 implements typography, documentation, and
  preview validation.
- **Scope:** The plan deliberately excludes custom comment/like storage and
  authentication because DEV provides those interactions.
- **Consistency:** `SiteSettings`, `getDevArticles`, and `legacyArticleRedirect`
  are introduced before their consumers. DEV is never queried with a secret.
- **Operational gate:** Task 4 is blocked until a legally embeddable Hannover
  Messe WOFF2 and license text are supplied.
