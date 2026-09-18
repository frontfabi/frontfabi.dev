export type DevArticle = { id: number; title: string; description: string; slug: string; url: string; publishedAt: string; tags: string[]; coverImage: string | null; readingTimeMinutes: number; positiveReactionsCount: number; commentsCount: number };
export type DevArticleDetail = DevArticle & { bodyMarkdown: string };
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
export function mapDevArticle(value: unknown): DevArticle | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (!Number.isInteger(item.id) || (item.id as number) < 1 || !["title", "description", "slug", "url", "published_at"].every((key) => typeof item[key] === "string" && item[key].trim())) return null;
  try { const url = new URL(item.url as string); if (url.protocol !== "https:" || url.hostname !== "dev.to") return null; } catch { return null; }
  return { id: item.id as number, title: item.title as string, description: item.description as string, slug: item.slug as string, url: item.url as string, publishedAt: item.published_at as string, tags: Array.isArray(item.tag_list) ? item.tag_list.filter((tag): tag is string => typeof tag === "string") : [], coverImage: typeof item.cover_image === "string" ? item.cover_image : null, readingTimeMinutes: number(item.reading_time_minutes), positiveReactionsCount: number(item.positive_reactions_count), commentsCount: number(item.comments_count) };
}
export function mapDevArticleDetail(value: unknown): DevArticleDetail | null {
  const article = mapDevArticle(value);
  if (!article || !value || typeof value !== "object") return null;
  const bodyMarkdown = (value as Record<string, unknown>).body_markdown;
  return typeof bodyMarkdown === "string" && bodyMarkdown.trim()
    ? { ...article, bodyMarkdown }
    : null;
}
export function devArticlePath(article: Pick<DevArticle, "id" | "slug">) {
  return `/articles/dev-${article.id}-${article.slug}`;
}
export async function getDevArticles(username: string): Promise<DevArticle[]> {
  const response = await fetch(`https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=100`, { headers: { "User-Agent": "frontfabi.dev blog index" }, next: { revalidate: 21600 } });
  if (!response.ok) throw new Error(`DEV API request failed: ${response.status}`);
  const value: unknown = await response.json();
  return Array.isArray(value) ? value.map(mapDevArticle).filter((item): item is DevArticle => item !== null) : [];
}
export async function getDevArticle(id: number, username: string): Promise<DevArticleDetail | null> {
  const response = await fetch(`https://dev.to/api/articles/${id}`, { headers: { "User-Agent": "frontfabi.dev blog reader" }, next: { revalidate: 21600 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`DEV API request failed: ${response.status}`);
  const article = mapDevArticleDetail(await response.json());
  return article && new URL(article.url).pathname.startsWith(`/${username}/`) ? article : null;
}
