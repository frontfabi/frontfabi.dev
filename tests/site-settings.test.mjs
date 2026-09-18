import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  fallbackSettings,
  isValidNavigation,
  settingsFromDocument,
} from "../src/lib/site-settings.ts";

test("falls back to compiled Portuguese copy without a settings document", () => {
  const settings = settingsFromDocument(null, "pt");

  assert.equal(settings.contact.email, "falacomigo@frontfabi.dev");
  assert.equal(settings.blog.devUsername, "frontfabi");
  assert.equal(settings.copy.about, "Sobre");
  assert.deepEqual(settings, fallbackSettings("pt"));
});

test("accepts each required navigation key exactly once", () => {
  assert.equal(
    isValidNavigation([
      { key: "about", label: "Sobre" },
      { key: "blog", label: "Blog" },
      { key: "work", label: "Trabalho" },
      { key: "contact", label: "Contato" },
    ]),
    true,
  );
  assert.equal(isValidNavigation([{ key: "about", label: "Sobre" }]), false);
});

test("keeps fallback navigation when CMS navigation is incomplete", () => {
  const settings = settingsFromDocument(
    { data: { navigation_items: [{ key: "about", label: "Sobre" }] } },
    "pt",
  );

  assert.deepEqual(
    settings.navigation.map((item) => item.key),
    ["about", "blog", "work", "contact"],
  );
});

test("keeps the published Instagram URL for the home social link", () => {
  const settings = settingsFromDocument(
    {
      data: {
        instagram_url: {
          url: "https://instagram.com/frontfabi",
        },
      },
    },
    "pt",
  );

  assert.equal(settings.contact.instagramUrl, "https://instagram.com/frontfabi");
});

test("SitePage loads settings before rendering the DEV blog", async () => {
  const page = await readFile(
    new URL("../src/app/[[...path]]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    page,
    /export default async function SitePage[\s\S]*const settings = await siteSettings\(locale\)/,
  );
});
