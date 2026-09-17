import test from "node:test";
import assert from "node:assert/strict";
import { constrainWindow } from "../src/components/Desktop/geometry.ts";
import { parsePath, localizedPath } from "../src/lib/site.ts";

test("window remains reachable after dragging past every viewport edge", () => {
  const viewport = { width: 1280, height: 720 };
  for (const x of [-2000, 100, 3000]) {
    for (const y of [-2000, 100, 3000]) {
      const box = constrainWindow({ x, y, width: 500, height: 300 }, viewport);
      assert.ok(box.x >= 8 && box.y >= 34);
      assert.ok(box.x + box.width <= viewport.width - 8);
      assert.ok(box.y + box.height <= viewport.height - 82);
    }
  }
});
test("oversized and undersized windows respect usable viewport and minimum size", () => {
  assert.deepEqual(
    constrainWindow(
      { x: 0, y: 0, width: 9000, height: 9000 },
      { width: 1024, height: 768 },
    ),
    { x: 8, y: 34, width: 1008, height: 652 },
  );
  const box = constrainWindow(
    { x: 10, y: 50, width: 2, height: 3 },
    { width: 1024, height: 768 },
  );
  assert.equal(box.width, 300);
  assert.equal(box.height, 180);
});
test("localized URLs preserve legacy Portuguese routes and article slugs", () => {
  assert.equal(localizedPath("/", "pt"), "/");
  assert.equal(localizedPath("/", "en"), "/en");
  assert.equal(localizedPath("/articles/post", "es"), "/es/articles/post");
  assert.deepEqual(parsePath(["en", "trabalho", "profissional", "itau"]), {
    locale: "en",
    segments: ["trabalho", "profissional", "itau"],
  });
  assert.deepEqual(parsePath(["sobre"]), { locale: "pt", segments: ["sobre"] });
});
