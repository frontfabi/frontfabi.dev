# Mural GitHub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated GitHub comments mural to the portfolio desktop, launched from its dock.

**Architecture:** The Desktop client owns window state and renders a focused `Mural` client component inside the existing reusable `Window` chrome. Auth.js provides a GitHub-only session at `/api/auth/*`; server routes validate session and content before storing comments in Postgres through a small repository module. Prismic remains the source for the owner avatar GIF; visitor identity comes from the GitHub session.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Auth.js, `@neondatabase/serverless`, Postgres, CSS custom properties, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-mural-github-design.md`

## Global Constraints

- Use GitHub as the only authentication provider; never permit anonymous message creation.
- Keep the mural closed on initial home load; the dock control has a permanent `--pink` indicator without a fake count.
- Preserve existing desktop `Window` chrome, theme variables and Pixel Sport/Born2bSporty type choices.
- Display the supplied Prismic animated owner GIF and real GitHub session avatar; no illustrated stand-ins.
- Validate trimmed message length as 1–500 Unicode code points and rate-limit each GitHub user to five posts per minute.
- Required production environment variables are `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, and `DATABASE_URL`.

---

### Task 1: Establish database and authenticated server interfaces

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/mural.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/mural/route.ts`
- Create: `tests/mural-api.test.mjs`
- Modify: `package.json`
- Modify: `.env.example`

**Interfaces:**
- Produces `auth`, `handlers`, and `getMuralSession()` from `src/lib/auth.ts`.
- Produces `listMessages(): Promise<MuralMessage[]>` and `createMessage(input: CreateMuralMessage): Promise<MuralMessage>` from `src/lib/mural.ts`.
- Consumes `auth()` in `POST /api/mural`; returns `401` without a GitHub session, `422` for invalid content, `429` for rate-limit exhaustion, and JSON `{ message }` on success.

- [ ] **Step 1: Write failing API contract tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validateMessage } from "../src/lib/mural.ts";

test("validateMessage trims and accepts a non-empty 500-character message", () => {
  assert.equal(validateMessage(`  ${"a".repeat(500)}  `), "a".repeat(500));
});

test("validateMessage rejects blank and overlong messages", () => {
  assert.throws(() => validateMessage("   "), /Mensagem obrigatória/);
  assert.throws(() => validateMessage("a".repeat(501)), /500/);
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node --experimental-strip-types --test tests/mural-api.test.mjs`

Expected: FAIL because `src/lib/mural.ts` does not exist.

- [ ] **Step 3: Add the minimal Auth.js and repository implementation**

```ts
// src/lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    session({ session, token }) {
      session.user.githubId = token.sub!;
      session.user.login = token.login as string;
      return session;
    },
    jwt({ token, profile }) {
      if (profile && "login" in profile) token.login = profile.login;
      return token;
    },
  },
});
```

```ts
// src/lib/mural.ts
export type MuralMessage = {
  id: string; body: string; githubId: string; login: string;
  avatarUrl: string; createdAt: string;
};
export const validateMessage = (value: unknown) => {
  const body = typeof value === "string" ? value.trim() : "";
  if (!body) throw new Error("Mensagem obrigatória");
  if ([...body].length > 500) throw new Error("A mensagem pode ter no máximo 500 caracteres");
  return body;
};
```

Use parameterized SQL to create `mural_messages` on first access and read newest-first. Keep the five-per-minute user query and insert in one transaction. Add the route re-export:

```ts
// src/app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@/lib/auth".handlers;
```

- [ ] **Step 4: Document setup and install runtime dependencies**

Run: `npm install next-auth @neondatabase/serverless`

Append to `.env.example`:

```dotenv
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_SECRET=
DATABASE_URL=
```

- [ ] **Step 5: Run focused tests and lint**

Run: `node --experimental-strip-types --test tests/mural-api.test.mjs && npm run lint`

Expected: PASS with no lint errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/auth.ts src/lib/mural.ts src/app/api/auth/[...nextauth]/route.ts src/app/api/mural/route.ts tests/mural-api.test.mjs
git commit -m "feat: add GitHub-authenticated mural API"
```

### Task 2: Build the mural widget and login window states

**Files:**
- Create: `src/components/Mural/index.tsx`
- Create: `src/components/Mural/index.module.css`
- Create: `tests/mural-component.test.mjs`

**Interfaces:**
- Consumes `GET /api/mural`, `POST /api/mural`, `useSession()` and `signIn("github")` from Auth.js.
- Produces `Mural({ locale, onClose, onFocus })`, with logged-out, OAuth-login and authenticated publish states.
- `Desktop` will render it inside the existing `Window` and provide `onClose` and `onFocus`.

- [ ] **Step 1: Write the failing source-level component test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const component = fs.readFileSync("src/components/Mural/index.tsx", "utf8");
test("mural renders GitHub-only login and owner avatar", () => {
  assert.match(component, /signIn\("github"\)/);
  assert.match(component, /fabi_avatar\.gif/);
  assert.match(component, /disabled={!session}/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/mural-component.test.mjs`

Expected: FAIL because `src/components/Mural/index.tsx` does not exist.

- [ ] **Step 3: Implement the component and its states**

Create a client component with the exact interactions:

```tsx
const [loginOpen, setLoginOpen] = useState(false);
const session = useSession().data;
const signedIn = Boolean(session?.user?.githubId);
<textarea disabled={!signedIn} placeholder={signedIn ? "Escreva seu recado…" : "Entre com GitHub para deixar um recado"} />
<button onClick={signedIn ? publish : () => setLoginOpen(true)}>
  {signedIn ? "Publicar" : "Logar"}
</button>
```

The login state has `Entrar com GitHub` calling `signIn("github")`. Render the owner image with the exact supplied Prismic GIF URL and the visitor image only from `session.user.image`. Fetch messages on mount, prepend a successful POST response, and show recoverable API errors beside the composer.

- [ ] **Step 4: Implement the desktop-native visual treatment**

Use CSS grid: history pane over composer, 88px avatar rail on desktop, owner avatar at the top and visitor avatar at the bottom. Reuse `var(--cream)`, `var(--white)`, `var(--ink)`, `var(--amber)`, `var(--pink)`, Pixel Sport and existing pixel-border/shadow conventions. Make the history independently scrollable and include focus-visible outlines.

- [ ] **Step 5: Run focused tests and lint**

Run: `node --test tests/mural-component.test.mjs && npm run lint`

Expected: PASS with no lint errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Mural tests/mural-component.test.mjs
git commit -m "feat: add mural login and composer states"
```

### Task 3: Integrate the dock launcher, windows and app providers

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Desktop/index.tsx`
- Modify: `src/theme/global.css`
- Modify: `tests/desktop.test.mjs`

**Interfaces:**
- Consumes the `Mural` component and Auth.js `SessionProvider`.
- Produces a `mural` dock action that opens `mural.exe`, an independently focused `mural-login.exe` Window and the permanent pink indicator.

- [ ] **Step 1: Write a failing desktop integration test**

```js
test("desktop exposes a mural dock launcher with a persistent badge", () => {
  const desktop = fs.readFileSync("src/components/Desktop/index.tsx", "utf8");
  const css = fs.readFileSync("src/theme/global.css", "utf8");
  assert.match(desktop, /launch\("mural"\)/);
  assert.match(desktop, /dock-mural/);
  assert.match(css, /\.mural-badge/);
  assert.match(css, /--pink/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/desktop.test.mjs`

Expected: FAIL because the mural dock action and badge do not exist.

- [ ] **Step 3: Add the provider and dock action**

Wrap the layout body with `SessionProvider`. Extend `Utility` with `"mural"`, include it in `open` state and `orders`, add a dock button with a speech-bubble icon and `<span className="mural-badge" aria-label="Novidade" />`, and set `aria-label` to “Abrir mural”. Do not add the mural to initial `open` state.

- [ ] **Step 4: Render the mural through existing Window chrome**

Render `Mural` in `Window kind="mural"`, title `mural.exe`, and use the component callback to add/remove `"mural-login"` in Desktop open state. Render its login callback as a second `Window kind="mural-login"`, title `login.exe`. Close the login state after the session becomes authenticated.

- [ ] **Step 5: Add responsive CSS and keyboard behavior**

Add `.dock-mural { position: relative; }` and `.mural-badge` as a 14px `var(--pink)` circular indicator with `var(--ink)` outline, positioned on the icon’s top-right. On small screens keep the badge visually attached to the dock control and make mural/login windows fit the current mobile window rules.

- [ ] **Step 6: Run regression tests, lint and production build**

Run: `node --test tests/desktop.test.mjs && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/components/Desktop/index.tsx src/theme/global.css tests/desktop.test.mjs
git commit -m "feat: launch GitHub mural from desktop dock"
```

### Task 4: Verify deployment configuration and the completed user flow

**Files:**
- Modify: `README.md`
- Modify: `tests/mural-api.test.mjs`

**Interfaces:**
- Documents required GitHub OAuth callback URL and Vercel variables.
- Confirms an anonymous POST never creates a message.

- [ ] **Step 1: Add a route test for anonymous rejection**

```js
test("POST /api/mural rejects requests without a session", async () => {
  const response = await POST(new Request("http://localhost/api/mural", {
    method: "POST", body: JSON.stringify({ body: "oi" }),
  }));
  assert.equal(response.status, 401);
});
```

- [ ] **Step 2: Run the API test suite**

Run: `node --experimental-strip-types --test tests/mural-api.test.mjs`

Expected: PASS.

- [ ] **Step 3: Document exact OAuth setup**

Add a “Mural GitHub” README section with:

```text
GitHub OAuth App callback URL: https://frontfabi.dev/api/auth/callback/github
Local callback URL: http://localhost:3000/api/auth/callback/github
Vercel variables: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET, DATABASE_URL
```

- [ ] **Step 4: Execute final verification**

Run: `npm run lint && npm run build && git diff --check`

Expected: all commands exit 0 and diff check has no output.

- [ ] **Step 5: Commit**

```bash
git add README.md tests/mural-api.test.mjs
git commit -m "docs: document mural OAuth setup"
```

## Self-review

- Spec coverage: Tasks 1 and 4 cover GitHub-only auth, persistence, validation, rate limiting and user provisioning. Task 2 covers logged-out/logged-in interface, real avatars, owner GIF, input state and publishing. Task 3 covers the dock, permanent badge, desktop chrome, focus and responsive behavior.
- Placeholder scan: no TBD/TODO or deferred implementation markers remain.
- Type consistency: Task 1 defines `MuralMessage`, `validateMessage`, `listMessages` and `createMessage`; Task 2 consumes the HTTP JSON representations; Task 3 consumes the `Mural` client component.
