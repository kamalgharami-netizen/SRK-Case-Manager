const test = require("node:test");
const assert = require("node:assert/strict");
const { createGoogleOAuthLoopbackListener } = require("./googleOAuthLoopback.cjs");

const STATE = "state_value_with_more_than_32_characters_123456";

test("accepts a callback only when the OAuth state matches", async () => {
  const listener = createGoogleOAuthLoopbackListener({ expectedState: STATE });
  const { redirectUri } = await listener.ready;
  const wait = listener.waitForCallback();

  const mismatch = await fetch(`${redirectUri}?code=wrong&state=not-the-state`);
  assert.equal(mismatch.status, 400);

  const accepted = await fetch(`${redirectUri}?code=auth-code-123&state=${encodeURIComponent(STATE)}`);
  assert.equal(accepted.status, 200);
  assert.deepEqual(await wait, { code: "auth-code-123", pickedFileIds: [] });
  listener.close();
});

test("returns the OAuth error supplied by Google after state validation", async () => {
  const listener = createGoogleOAuthLoopbackListener({ expectedState: STATE });
  const { redirectUri } = await listener.ready;
  const wait = listener.waitForCallback();

  const response = await fetch(
    `${redirectUri}?error=access_denied&state=${encodeURIComponent(STATE)}`
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await wait, { error: "access_denied" });
  listener.close();
});

test("rejects a missing or short OAuth state before opening a listener", () => {
  assert.throws(
    () => createGoogleOAuthLoopbackListener({ expectedState: "short" }),
    /valid OAuth state/
  );
});

test("returns selected Drive item IDs from the Picker callback", async () => {
  const listener = createGoogleOAuthLoopbackListener({ expectedState: STATE });
  const { redirectUri } = await listener.ready;
  const wait = listener.waitForCallback();
  const response = await fetch(`${redirectUri}?code=picker-code&picked_file_ids=folder_123,folder-456&state=${encodeURIComponent(STATE)}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await wait, { code: "picker-code", pickedFileIds: ["folder_123", "folder-456"] });
  listener.close();
});

test("rejects malformed Picker item IDs", async () => {
  const listener = createGoogleOAuthLoopbackListener({ expectedState: STATE });
  const { redirectUri } = await listener.ready;
  const wait = listener.waitForCallback();
  const response = await fetch(`${redirectUri}?code=picker-code&picked_file_ids=folder%2Fbad&state=${encodeURIComponent(STATE)}`);
  assert.equal(response.status, 400);
  listener.close();
  await assert.rejects(wait, /cancelled/);
});