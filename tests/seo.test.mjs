import test from "node:test";
import assert from "node:assert/strict";
import {
  clearMuralQuery,
  metadataDescription,
  muralPath,
  profileTitle,
  staticSitePaths,
} from "../src/lib/seo.ts";

test("profile metadata uses the published name, role, and a concise biography", () => {
  assert.equal(
    profileTitle("Fabi Rodrigues", "Senior Frontend Engineer / UX Designer"),
    "Fabi Rodrigues · Senior Frontend Engineer / UX Designer",
  );
  assert.equal(
    metadataDescription(
      "Desenvolvedora Front-End Sênior especializada em React, TypeScript, acessibilidade e performance para produtos digitais.",
    "Descrição padrão",
  ),
    "Desenvolvedora Front-End Sênior especializada em React, TypeScript, acessibilidade e performance para produtos digitais.",
  );
});

test("profile metadata falls back when Prismic has no biography text", () => {
  assert.equal(metadataDescription("", "Descrição padrão"), "Descrição padrão");
});

test("sitemap always includes the homepage and Sobre for each published locale", () => {
  assert.deepEqual(staticSitePaths(["pt", "en"]), ["/", "/sobre", "/en", "/en/sobre"]);
});

test("mural links retain the post path through login", () => {
  assert.equal(
    muralPath("/articles/dev-42-seo-tecnico"),
    "/articles/dev-42-seo-tecnico?mural=1",
  );
});

test("opening the mural clears only its query flag after the window opens", () => {
  assert.equal(
    clearMuralQuery("/trabalho/profissional/mercado-livre", "mural=1&source=post"),
    "/trabalho/profissional/mercado-livre?source=post",
  );
});
