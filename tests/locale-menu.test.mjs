import test from "node:test";
import assert from "node:assert/strict";
import { availableLocaleMenuItems } from "../src/lib/locale-menu.ts";

test("locale context menu exposes only published translations", () => {
  assert.deepEqual(
    availableLocaleMenuItems({ pt: "/", en: "/en" }),
    [
      { locale: "pt", label: "Português", href: "/" },
      { locale: "en", label: "English", href: "/en" },
    ],
  );
});

test("locale context menu adds Español only after its translation is published", () => {
  assert.deepEqual(
    availableLocaleMenuItems({ pt: "/", en: "/en", es: "/es" }),
    [
      { locale: "pt", label: "Português", href: "/" },
      { locale: "en", label: "English", href: "/en" },
      { locale: "es", label: "Español", href: "/es" },
    ],
  );
});
