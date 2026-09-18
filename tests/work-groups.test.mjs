import test from "node:test";
import assert from "node:assert/strict";
import { visibleWorkGroups } from "../src/lib/work-groups.ts";

test("omits the community section until published community content exists", () => {
  const groups = visibleWorkGroups(
    [{ id: "experience-1" }],
    [],
    { professional: "Profissional", community: "Comunidade & palestras" },
  );

  assert.deepEqual(groups, [
    { id: "professional", title: "Profissional", items: [{ id: "experience-1" }] },
  ]);
});

test("includes community and talks when community content is published", () => {
  const groups = visibleWorkGroups(
    [],
    [{ id: "talk-1" }],
    { professional: "Profissional", community: "Comunidade & palestras" },
  );

  assert.deepEqual(groups, [
    { id: "community", title: "Comunidade & palestras", items: [{ id: "talk-1" }] },
  ]);
});
