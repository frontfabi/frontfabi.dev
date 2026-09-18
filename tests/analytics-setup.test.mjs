import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("loads analytics only through the consent-aware component", async () => {
  const [layout, analytics, environment] = await Promise.all([
    readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Analytics/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /import Analytics from "@\/components\/Analytics"/);
  assert.match(layout, /<Analytics\s*\/>/);
  assert.match(analytics, /NEXT_PUBLIC_GA_ID/);
  assert.match(analytics, /consent === "granted"/);
  assert.match(environment, /^NEXT_PUBLIC_GA_ID=/m);
});

test("tracks the portfolio calls to action", async () => {
  const desktop = await readFile(
    new URL("../src/components/Desktop/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(desktop, /trackEvent\("open_contact"\)/);
  assert.match(desktop, /trackEvent\("open_game"\)/);
  assert.match(desktop, /trackEvent\("download_cv"/);
});
