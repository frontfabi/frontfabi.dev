import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownContent from "../src/components/MarkdownContent.ts";

const render = (children) =>
  renderToStaticMarkup(createElement(MarkdownContent, null, children));

test("article body renders Markdown as semantic content", () => {
  const html = render(
    "# Seção\n\n**Importante** e *ênfase*.\n\n- Primeiro\n- Segundo\n\n[Link](https://dev.to/frontfabi)\n\n> Citação",
  );
  assert.match(html, /<h2>Seção<\/h2>/);
  assert.doesNotMatch(html, /<h1>/);
  assert.match(html, /<strong>Importante<\/strong>/);
  assert.match(html, /<em>ênfase<\/em>/);
  assert.match(html, /<ul>\s*<li>Primeiro<\/li>\s*<li>Segundo<\/li>\s*<\/ul>/);
  assert.match(html, /href="https:\/\/dev.to\/frontfabi"/);
  assert.match(html, /<blockquote>/);
});

test("GFM tables, tasks and fenced code keep their structure", () => {
  const html = render(
    "| Nome |\n| --- |\n| Fabi |\n\n- [x] Pronto\n\n```js\nconst tag = '<p>';\n```\n\n~~Antigo~~",
  );
  assert.match(html, /<table>/);
  assert.match(html, /<td>Fabi<\/td>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /&lt;p&gt;/);
  assert.match(html, /<del>Antigo<\/del>/);
});

test("Markdown does not execute embedded HTML or dangerous links", () => {
  const html = render(
    '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[Click](javascript:alert)\n\nTexto preservado.',
  );
  assert.doesNotMatch(html, /<script|onerror=|href="javascript:/);
  assert.match(html, /Texto preservado/);
});
