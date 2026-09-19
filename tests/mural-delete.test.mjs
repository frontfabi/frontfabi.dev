import assert from "node:assert/strict";
import test from "node:test";
import { deleteMessageForActor } from "../src/lib/mural-delete.ts";

test("deletes a mural message only when its id belongs to the authenticated GitHub user", async () => {
  const deleted = [];
  const database = async (strings, ...values) => {
    if (values[0] === "message-1" && values[1] === "owner-1") {
      deleted.push(values);
      return [{ id: "message-1" }];
    }
    return [];
  };

  assert.equal(
    await deleteMessageForActor(database, {
      id: "message-1",
      githubId: "someone-else",
    }),
    false,
  );
  assert.deepEqual(deleted, []);

  assert.equal(
    await deleteMessageForActor(database, {
      id: "message-1",
      githubId: "owner-1",
    }),
    true,
  );
  assert.deepEqual(deleted, [["message-1", "owner-1"]]);
});
