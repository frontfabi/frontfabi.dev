# Prismic Settings and DEV Blog Design

## Goal

Make Prismic the editable source for frontfabi.dev's static and structural
content, use DEV (`frontfabi`) as the sole editorial and community platform for
blog posts, and replace the site's semantic heading font with licensed Hannover
Messe Sans.

## Decisions

- **Prismic owns:** site identity, homepage copy, contact details, CV URL,
  navigation labels, UI copy, translations, metadata, and the blog's display
  configuration.
- **DEV owns:** article bodies, cover images, tags, dates, reading time,
  reactions, comments, authorship, and moderation.
- **No visitor-generated data is stored by frontfabi.dev.** A visitor reads,
  reacts, and comments on DEV using their DEV account.
- **DEV is canonical for every blog post.** The portfolio is a branded,
  cached archive/index and links readers to DEV for the full article and
  discussion.
- **Hannover Messe Sans is restricted to semantic headings and the site brand.**
  Silkscreen remains the OS-like interface font and VT323 remains body copy.

## Architecture

```text
Prismic (localized singleton) ──> server-rendered site settings ──> Desktop UI
DEV public API ────────────────> cached server-side blog index ──> Blog window
DEV article URL ───────────────> browser navigation ────────────> reading + community
```

The existing Next.js App Router remains unchanged. Prismic queries retain the
`prismic` cache tag and its publish webhook continues to invalidate that tag.
DEV requests use a separate cache lifetime and never use the Prismic webhook.

## Prismic content model

Create a localized, non-repeatable custom type with API ID `site_settings`.
There is exactly one published document per enabled locale: `pt-br`, `en-us`,
and `es-es`. It is queried by type and locale, not UID.

Use named tabs in the Custom Type UI to make a large settings document
manageable. Fields which occur once belong in the static zone; use repeatable
groups only when an editor can add, remove, or reorder whole items.

### Identity and home

Static fields:

- `site_name`, `person_name`, `role`, `domain`, `home_badge`
- `home_welcome`, `home_intro`, `home_cta_label`
- `default_meta_title`, `default_meta_description`, `default_meta_image`

`home_intro` is rich text. All other copy is Key Text except the image.
`page` documents remain responsible for the long-form content of Home and
Sobre, including slices.

### Contact and links

Static fields:

- `contact_heading`, `contact_email`, `cv_link`, `cv_label`
- `linkedin_url`, `linkedin_label`

This replaces the email, LinkedIn URL, and hard-coded Prismic CDN CV URL in
the Desktop component. A future social account is an item in the repeatable
`social_links` group (`label`, `url`, `icon_id`), rather than a new code change.

### Navigation and UI copy

The `navigation_items` repeatable group has `key` and `label`; allowed keys are
`about`, `blog`, `work`, and `contact`. Its order is the visible application
order. Code validates that all four keys are present before using it, otherwise
uses the compiled fallback.

All other current keys in `src/lib/site.ts` are static, explicitly named
fields grouped in tabs:

- `window_actions`: `close`, `minimize`, `maximize`, `restore`,
  `arrange_windows`, `help_title`.
- `content_labels`: `professional`, `community`, `empty`, `missing`,
  `back`, `present`, `all`, `archive`, `posts`, `folders`, `read`, `status`,
  `unavailable`.
- `accessibility_and_settings`: `desktop`, `settings`, `language`, `skip`,
  `navigation_aria_label`, `computer_label`, `help_body`.

These fields deliberately do not use a generic key/value group: the generated
Prismic types remain precise, the editor sees meaningful labels, and missing
required copy is detectable. A small compiled fallback remains only for an
unpublished or incomplete settings document, never as a parallel source of
truth after migration.

### Blog configuration

Static fields:

- `dev_username` (initial value: `frontfabi`)
- `blog_title`, `blog_intro`, `blog_empty_message`
- `blog_read_on_dev_label`, `blog_reactions_label`, `blog_comments_label`

No Prismic `post` documents, comment fields, like fields, reaction counters,
or article-body slices are created. Existing `post` custom type data is not
deleted in this release; it is simply no longer queried by the public blog.

### Legacy article redirects

`legacy_article_redirects` is a repeatable group with `legacy_uid` and
`dev_article_url`. It is optional and only receives rows for existing public
`/articles/:uid` URLs that need preservation. The route sends a permanent
redirect to the configured DEV URL. An unknown old UID remains a 404.

## DEV integration

The server fetches DEV's public articles endpoint with the configured username:

`GET https://dev.to/api/articles?username=frontfabi&per_page=100`

It maps the returned article object to a local `DevArticle` boundary type:

- `id`, `title`, `description`, `slug`, `url`, `published_at`
- `tag_list`, `cover_image`, `reading_time_minutes`
- `positive_reactions_count`, `comments_count`

No DEV API key is required for this public feed and no secret is exposed to the
browser. Requests include a descriptive User-Agent, are cached with a finite
Next.js revalidation interval (six hours), and fail closed to a clear localized
empty/error state. The last successful list remains available through the
cache during a transient DEV failure.

`/blog` renders the mapped article list in the existing desktop design. Each
item presents date, tags, reading time, positive reactions, and comment count.
The article link is an external DEV link, opened in a new tab with
`rel="noreferrer"`; its accessible label makes that destination explicit.

The former `post` detail rendering and its JSON-LD are removed from the public
routing path. The current `/articles/:uid` route remains only for configured
permanent redirects. This prevents duplicate full-article pages and makes the
DEV article URL canonical.

## Comments and likes

Likes and comments are not embedded as writable controls in frontfabi.dev.
The blog index may display the DEV counts, but the action is performed on the
DEV article page. This gives visitors native DEV authentication, threaded
comments, moderation, notifications, and reactions without building a second
identity, database, abuse-prevention, or moderation system.

The public DEV API can read article and comment data, but this project will not
mirror the complete discussion in the first release. A read-only comment mirror
would have stale-cache, HTML-sanitization, and navigation complexity while
still forcing visitors to DEV to reply.

## Typography

The repository must receive a legally licensed web-embedding copy of Hannover
Messe Sans before implementation. Add the derived/received WOFF2 file and its
license notice under `public/fonts/`. CSS declares a local `@font-face` with
`font-display: swap` and a serif/sans fallback.

Apply it to `h1`, `h2`, `h3`, and `.brand`. Preserve Silkscreen on system panel
controls, window titles, dock, icons, buttons, and other OS chrome, so the
retro desktop vocabulary remains intact. Verify Portuguese accents and line
wrapping in home, About, Work, Blog, and detail headings at desktop and mobile
widths.

## Publication sequence

1. Add the local custom type and settings adapter with fallbacks.
2. Synchronize the model through Slice Machine; do not remove existing remote
   fields or custom types.
3. Create and publish the Portuguese `site_settings` document, then linked
   English and Spanish versions.
4. Add any necessary legacy redirects after checking currently indexed URLs.
5. Publish a preview deployment, validate the localized desktop UI and DEV
   feed, then merge to `main` for Vercel production.
6. Configure/update the DEV profile website URL to `https://frontfabi.dev` as
   a manual DEV profile setting; it is outside this repository.

## Failure handling and validation

- Settings document unavailable: retain the current compiled Portuguese,
  English, or Spanish fallback and log the failure server-side.
- Required navigation item missing or duplicated: ignore the CMS navigation
  group and use the fallback collection for that request.
- DEV returns no articles: show `blog_empty_message`, never sample posts.
- DEV request fails: retain cached data when present; otherwise show a distinct
  localized unavailable state with no broken links.
- Invalid external URLs from settings: do not render the respective link.
- Font unavailable or unlicensed: do not ship it; keep Silkscreen headings.

Automated coverage includes the DEV response mapper, invalid/missing settings
fallbacks, navigation validation, legacy redirect lookup, and the existing
desktop interaction suite. Full verification includes lint, TypeScript, unit
tests, production build, and manual Preview Deployment checks.
