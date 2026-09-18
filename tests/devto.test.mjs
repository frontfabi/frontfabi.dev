import test from "node:test";
import assert from "node:assert/strict";
import { mapDevArticle } from "../src/lib/devto.ts";

test("maps public DEV metrics and article URL", () => {
  assert.deepEqual(mapDevArticle({ id: 1, title: "Post", description: "Resumo", slug: "post", url: "https://dev.to/frontfabi/post", published_at: "2022-09-07T03:08:53Z", tag_list: ["devrel"], cover_image: null, reading_time_minutes: 2, positive_reactions_count: 7, comments_count: 0 }), { id: 1, title: "Post", description: "Resumo", slug: "post", url: "https://dev.to/frontfabi/post", publishedAt: "2022-09-07T03:08:53Z", tags: ["devrel"], coverImage: null, readingTimeMinutes: 2, positiveReactionsCount: 7, commentsCount: 0 });
});

test("rejects an article without an HTTPS DEV URL", () => {
  assert.equal(mapDevArticle({ id: 1, url: "javascript:alert(1)" }), null);
});
