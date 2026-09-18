import test from "node:test";
import assert from "node:assert/strict";
import { publicMessage } from "../src/lib/mural-message.ts";

test("public mural messages omit the GitHub account identifier", () => {
  assert.deepEqual(
    publicMessage({
      id: "message-1",
      body: "Oi, Fabi!",
      githubId: "123456",
      login: "frontend-person",
      avatarUrl: "https://github.com/frontend-person.png",
      createdAt: "2026-09-18T12:00:00.000Z",
    }),
    {
      id: "message-1",
      body: "Oi, Fabi!",
      login: "frontend-person",
      avatarUrl: "https://github.com/frontend-person.png",
      createdAt: "2026-09-18T12:00:00.000Z",
    },
  );
});
