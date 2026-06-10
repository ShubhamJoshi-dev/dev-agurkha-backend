# AGS Backend — API Smoke Test Report

**Run date:** 2026-06-08 (≈14:30 UTC)
**Base URL tested:** `https://dev-agurkha-backend.onrender.com/api/v1`
**Method:** Live HTTP probes (`curl`) against every endpoint in `API_REFERENCE.md` + `docs/api.md`, cross-checked against the live OpenAPI spec at `/docs-json` (116 routes).
**Credentials used for auth attempt:** `info@agurkha.com` / `Applied@1234` (from CLAUDE.md / `.env`).

---

## TL;DR — Verdict

| Category | Result |
|---|---|
| Server process | **UP** — reachable, responding |
| `/api/v1/health` | **200 OK** — reports `database: up`, `memory: up` |
| Swagger UI `/docs` + `/docs-json` | **200 OK** — full OpenAPI served |
| Auth guard / routing | **OK** — protected routes correctly return `401` when unauthenticated |
| **Every DB-touching endpoint** | **500 Internal Server Error** — including all public reads, `auth/login`, `auth/signin`, and `contact` submit |

**Root cause (high confidence): un-run migrations / missing database tables.**
The process is healthy and routing works (404s on unknown paths, 401s on guarded paths are clean). But *every* handler that touches the database returns a generic `500 Internal server error` — including `POST /auth/login`, which only needs to read the `users`/`admins` table. The health check's `database: up` only confirms a TCP/connection-pool ping succeeds, **not** that the schema/tables exist. This matches the existing note in `PROGRESS.md` ("Blocked On: LIVE BACKEND 500s on ALL data endpoints … almost certainly un-run migrations / missing tables").

> **Cutover stays blocked.** `USE_MOCK_API` must remain `true` until these endpoints return 200s. The frontend code itself is correct — routes resolve, reach the handlers, and the 500 JSON echoes back the exact request paths.

---

## Standard error shape observed

Every 5xx/4xx returned the documented error envelope, e.g.:

```json
{ "statusCode": 500, "timestamp": "2026-06-08T14:28:42.768Z", "path": "/api/v1/services?perPage=2", "method": "GET", "message": "Internal server error" }
```

---

## 1. Infrastructure / Meta endpoints

| Method | Endpoint | Status | Result |
|---|---|---|---|
| GET | `/` (root, no prefix) | `404` | Expected — `Cannot GET /` |
| GET | `/docs` | **`200`** | ✅ Swagger UI HTML served |
| GET | `/docs-json` | **`200`** | ✅ OpenAPI 3.0 spec (116 routes) served |
| GET | `/api/v1/health` | **`200`** | ✅ `{"status":"ok","info":{"database":{"status":"up"},"memory_heap":{"status":"up"},"memory_rss":{"status":"up"}}}` |
| GET | `/health` (no prefix) | `404` | Health lives under the `/api/v1` prefix only |

---

## 2. Public endpoints (no auth) — **ALL 500**

All of these are public reads (or the public contact submit) and require no token. Every one failed with `500`.

| Method | Endpoint | Status | Body (`message`) |
|---|---|---|---|
| GET | `/api/v1/services?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/services/slug/:slug` | **`500`** | `Internal server error` |
| GET | `/api/v1/modalities?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/news?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/news/slug/:slug` | **`500`** | `Internal server error` |
| GET | `/api/v1/testimonials?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/team?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/affiliates?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/galleries?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/downloads?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/content-blocks?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/pages?perPage=2` | **`500`** | `Internal server error` |
| GET | `/api/v1/settings/general` | **`500`** | `Internal server error` |
| GET | `/api/v1/settings/homepage` | **`500`** | `Internal server error` |
| GET | `/api/v1/menus?location=header` | **`500`** | `Internal server error` |
| POST | `/api/v1/contact` | **`500`** | `Internal server error` (body: `{name,email,subject,message}`) |

**Sample request/response — `POST /api/v1/contact`:**

```
POST /api/v1/contact
Content-Type: application/json
{ "name": "Smoke Test", "email": "smoke@example.com", "subject": "Smoke", "message": "automated smoke test, please ignore" }

→ HTTP 500
{ "statusCode": 500, "timestamp": "2026-06-08T14:28:47.456Z", "path": "/api/v1/contact", "method": "POST", "message": "Internal server error" }
```

---

## 3. Authentication — **500 (cannot obtain a token)**

| Method | Endpoint | Body | Status | Result |
|---|---|---|---|---|
| POST | `/api/v1/auth/signin` | `{"username":"info@agurkha.com","password":"Applied@1234"}` | **`500`** | `Internal server error` |
| POST | `/api/v1/auth/login` | `{"email":"info@agurkha.com","password":"Applied@1234"}` | **`500`** | `Internal server error` |

> Because login/signin themselves 500 (they read the user table), **no Bearer token could be obtained**, so the authenticated data paths of the protected endpoints below could not be exercised. The `500` on login is itself the strongest single signal that the DB tables are not present/migrated.

Auth endpoints **not** exercised (would mutate state or need a token / setup secret):
- `POST /api/v1/auth/register` — not run (would create a USER row; DB is down anyway)
- `POST /api/v1/auth/setup` — not run (needs `SETUP_SECRET`; one-time SUPER_ADMIN bootstrap)
- `GET /api/v1/auth/me` — see below (returned `401` unauthenticated, as designed)
- `POST /api/v1/auth/logout` / `signout` — not run (need a token)

---

## 4. Protected endpoints — routing/guard verified (`401`), data path UNTESTED

These all require a Bearer token. Probed **unauthenticated** to confirm the route exists and the auth guard runs. Every one returned a clean `401` (`Authentication required`) **before** hitting the DB — so the routes are wired correctly. Their actual data behaviour is **untested** because auth is down.

| Method | Endpoint | Unauth status | Authed status |
|---|---|---|---|
| GET | `/api/v1/auth/me` | **`401`** ✅ routed | untested (no token) |
| GET | `/api/v1/users` | **`401`** ✅ routed | untested |
| GET | `/api/v1/admins` | **`401`** ✅ routed | untested |
| GET | `/api/v1/banner-categories` | **`401`** ✅ routed | untested |
| GET | `/api/v1/banners` | **`401`** ✅ routed | untested |
| GET | `/api/v1/media` | **`401`** ✅ routed | untested |
| GET | `/api/v1/analytics/summary` | **`401`** ✅ routed | untested |
| GET | `/api/v1/contact-messages` | **`401`** ✅ routed | untested |

Sample:

```
GET /api/v1/contact-messages   (no Authorization header)
→ HTTP 401
{ "statusCode": 401, "timestamp": "2026-06-08T14:30:09.181Z", "path": "/api/v1/contact-messages", "method": "GET", "message": "Authentication required" }
```

> **Interpretation:** the `401`-before-`500` contrast is diagnostic. Guarded handlers fail at the auth layer (`401`) before reaching the DB, while public handlers and `login` reach the DB and fail there (`500`). This isolates the fault to the data layer, not to routing or app boot.

---

## 5. Write / mutating endpoints — NOT exercised (by design)

The remaining `POST` / `PATCH` / `DELETE` / `bulk-*` endpoints (services, modalities, news, pages, banners, galleries, downloads, team, testimonials, affiliates, content-blocks, menus, media, users, admins, settings, contact-messages) were **not** invoked, for two reasons:
1. They are destructive/mutating and a smoke test should not create or delete real records.
2. No Bearer token is obtainable while auth returns `500`, so they would be untestable anyway.

All of them are confirmed **present** in the live OpenAPI spec (see §6). They cannot be functionally verified until (a) the DB is migrated and (b) auth issues a token.

---

## 6. Endpoint inventory — reference doc vs. live backend

Cross-checked `API_REFERENCE.md` (§24 Quick Reference) and `docs/api.md` against the live `/docs-json` (116 routes). **Every endpoint in the reference docs is present on the live backend, and vice-versa — the route surface matches.** The failures are runtime (500), not missing routes.

### 6a. Method discrepancy to note

| Endpoint | `docs/api.md` says | Backend + `API_REFERENCE.md` say |
|---|---|---|
| `…/media/bulk-delete` | `POST` | **`DELETE`** |

`docs/api.md` (line 224) lists `POST /api/media/bulk-delete`, but the live backend exposes it as **`DELETE /api/v1/media/bulk-delete`**. The frontend (`lib/api/media.ts`) already calls it with `method: "DELETE"`, so the frontend is correct and `docs/api.md` is stale. All *other* resources use `POST …/bulk-delete`; media is the lone exception.

### 6b. `docs/api.md` paths are missing the `/api/v1` prefix

`docs/api.md` documents paths as `/api/services`, `/api/auth/signin`, etc. The live backend serves everything under **`/api/v1/...`** (e.g. `/api/v1/services`). `NEXT_PUBLIC_API_URL` is already set to `https://dev-agurkha-backend.onrender.com/api/v1`, so the frontend resolves correctly — but `docs/api.md` should be reconciled with the versioned prefix to avoid confusion.

---

## 7. Endpoints the FRONTEND needs that the BACKEND does NOT provide

These are gaps where the frontend's `lib/api/*` code (or admin UX) expects an endpoint that is **absent or method-mismatched** on the live backend. **Backend action required.**

### 🔴 7a. Missing GET for `site` / `scripts` / `social` settings

The backend exposes **only PATCH** for these three settings groups — there is **no GET** to read them back:

| Frontend call (`lib/api/settings.ts`) | Backend status |
|---|---|
| `GET /api/v1/settings/site` (line 91) | ❌ **only PATCH exists** — no GET |
| `GET /api/v1/settings/scripts` (line 116) | ❌ **only PATCH exists** — no GET |
| `GET /api/v1/settings/social` (line 141) | ❌ **only PATCH exists** — no GET |

Confirmed from the live OpenAPI spec:
```
/api/v1/settings/general  -> GET, PATCH   ✅
/api/v1/settings/homepage -> GET, PATCH   ✅
/api/v1/settings/site     -> PATCH only   ❌ (frontend needs GET)
/api/v1/settings/scripts  -> PATCH only   ❌ (frontend needs GET)
/api/v1/settings/social   -> PATCH only   ❌ (frontend needs GET)
```

**Impact:** the admin Settings pages for Site, Scripts, and Social cannot load their current values to pre-fill the edit forms. The admin can blind-write via PATCH but never read back what's stored.

**Required backend additions:**
- `GET /api/v1/settings/site` → `TSiteSettings`
- `GET /api/v1/settings/scripts` → `TScriptsSettings`
- `GET /api/v1/settings/social` → `TSocialSettings`

### 🟠 7b. No admin self-profile update endpoint

The admin panel has a Profile page (`lib/actions/profile.actions.ts`) for the logged-in admin to update their own name/email/password. There is **no backend endpoint** for this — the frontend currently stubs it against env credentials and explicitly warns "updates are not persisted" (PROGRESS.md Task 5.14).

Existing related routes: `GET /auth/me` (read self) exists; `PATCH /admins/:id` exists but is **SUPER_ADMIN-only** (an admin cannot use it to edit their own record, and it doesn't change passwords).

**Required backend addition (nice-to-have, blocks the Profile page):**
- `PATCH /api/v1/auth/me` (or `/api/v1/profile`) → update own `name` / `email` / `password`, available to any authenticated admin.

### 🟢 7c. No detail/`:id` or `slug` routes for `testimonials`, `affiliates`, `team(slug)`, `downloads(slug)`

The frontend does not currently require these (it edits testimonials/affiliates from the list payload, and fetches team by `:id`, downloads by `:id`), so **not blocking**. Listed only for completeness:
- `testimonials` and `affiliates` have **no `GET /:id`** on the backend (list + write only). Frontend OK.
- `team` and `downloads` have `GET /:id` but **no `GET /slug/:slug`** (unlike services/news/modalities/galleries/pages). Frontend OK.

---

## 8. Recommended next steps (backend owner)

1. **Run the database migrations** on the `dev-agurkha-backend` environment (create the tables). This is the single blocker — it should clear ~all the `500`s in §2–§4 at once.
2. **Seed at least the SUPER_ADMIN** (via `POST /api/v1/auth/setup` with `SETUP_SECRET`, or a seed script) so `auth/login`/`signin` returns a token and the protected endpoints in §4 can be functionally smoke-tested.
3. **Add the three missing settings GET endpoints** (§7a) — hard blocker for the admin Site/Scripts/Social settings pages.
4. **Decide on a self-profile endpoint** (§7b) — unblocks the admin Profile page.
5. After 1–2, **re-run this smoke test**; expect the §2 reads to return `200` with `{ data, total, page, perPage }` and `auth/login` to return `{ accessToken, user }`. Then proceed to frontend cutover (Tasks 4.1–4.4: flip `USE_MOCK_API=false`).

## 9. Recommended doc fixes (frontend repo)

- `docs/api.md`: change `media/bulk-delete` from `POST` to `DELETE` (§6a).
- `docs/api.md`: note all paths are served under the `/api/v1` prefix (§6b).
- `docs/api.md`: add the three settings GET rows once the backend ships them.

---

_Generated by live smoke test against `dev-agurkha-backend.onrender.com` on 2026-06-08. Re-run with the scripts in the repo task history once the backend DB is migrated._
