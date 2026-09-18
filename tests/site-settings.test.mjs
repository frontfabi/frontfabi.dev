import test from "node:test";
import assert from "node:assert/strict";
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
