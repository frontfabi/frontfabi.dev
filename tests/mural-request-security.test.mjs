import assert from "node:assert/strict";
import test from "node:test";
import { isSameOriginMutation } from "../src/lib/mural-request-security.ts";

test("accepts a mutation made from the current site origin", () => {
  assert.equal(
    isSameOriginMutation(
      new Request("https://frontfabi.dev/api/mural", {
        method: "POST",
        headers: { origin: "https://frontfabi.dev" },
      }),
    ),
    true,
  );
});

test("rejects a mutation without the current site origin", () => {
  assert.equal(
    isSameOriginMutation(
      new Request("https://frontfabi.dev/api/mural", { method: "POST" }),
    ),
    false,
  );
  assert.equal(
    isSameOriginMutation(
      new Request("https://frontfabi.dev/api/mural", {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      }),
    ),
    false,
  );
});
