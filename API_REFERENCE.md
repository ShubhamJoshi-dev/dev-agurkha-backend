# Agurkha Backend — API Reference

**Base URL:** `https://<your-domain>/api/v1`  
**Swagger UI:** `/docs` (development only)  
**Auth header:** `Authorization: Bearer <accessToken>`

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Authentication](#2-authentication)
3. [Users](#3-users)
4. [Admins](#4-admins)
5. [Health](#5-health)
6. [Services](#6-services)
7. [Modalities](#7-modalities)
8. [News](#8-news)
9. [Testimonials](#9-testimonials)
10. [Team](#10-team)
11. [Affiliates](#11-affiliates)
12. [Galleries](#12-galleries)
13. [Downloads](#13-downloads)
14. [Contact](#14-contact)
15. [Contact Messages (Admin)](#15-contact-messages-admin)
16. [Content Blocks](#16-content-blocks)
17. [Pages](#17-pages)
18. [Settings](#18-settings)
19. [Menus](#19-menus)
20. [Banner Categories](#20-banner-categories)
21. [Banners](#21-banners)
22. [Media](#22-media)
23. [Analytics](#23-analytics)
24. [Quick Reference](#24-quick-reference)

---

## 1. Global Conventions

### Error response

Every error is returned in this shape:

```json
{
  "statusCode": 400,
  "timestamp": "2026-06-07T08:00:00.000Z",
  "path": "/api/v1/services",
  "method": "POST",
  "message": "slug should not be empty"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | number | HTTP status code |
| `timestamp` | string (ISO 8601) | When the error occurred |
| `path` | string | Request URL |
| `method` | string | HTTP verb |
| `message` | string \| string[] | Error detail; validation errors come as an array of strings |

**Common status codes**

| Code | Meaning |
|------|---------|
| `400` | Validation error (body fields, unknown fields) |
| `401` | Missing or invalid / expired Bearer token |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found |
| `409` | Conflict (duplicate slug, duplicate email, etc.) |
| `500` | Unhandled server error |

---

### Paginated list response

Most `GET` list endpoints return:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "perPage": 25
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | object[] | Array of items for the current page |
| `total` | number | Total number of matching records |
| `page` | number | Current page (1-indexed) |
| `perPage` | number | Items per page |

---

### Common query parameters (pagination)

All list endpoints accept these query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer ≥ 1 | `1` | Page number |
| `perPage` | integer 1–100 | `25` | Items per page |
| `search` | string | — | Full-text search (fields vary per resource — see each section) |
| `sort` | string | — | Sort field; prefix with `-` for descending (e.g. `-createdAt`, `sortOrder`) |

---

### Bulk delete request body

Used by every `POST /<resource>/bulk-delete` endpoint:

```json
{ "ids": ["uuid-1", "uuid-2"] }
```

| Field | Type | Required |
|-------|------|----------|
| `ids` | string[] (UUID v4) | yes |

---

### Roles

| Value | Description |
|-------|-------------|
| `USER` | Regular registered user |
| `ADMIN` | Content admin |
| `SUPER_ADMIN` | Full access (manage admins, users, all content) |

---

## 2. Authentication

Base path: `/api/v1/auth`

---

### POST `/api/v1/auth/register`

Register a new user account (role: `USER`).

**Auth:** Public  
**Status:** `201` Created · `400` Validation · `409` Email already exists

**Request body**

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "StrongPass123"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | yes | Valid email |
| `name` | string | yes | Max 100 chars |
| `password` | string | yes | 8–128 chars |

**Response `201`**

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### POST `/api/v1/auth/login`

Log in with email and password.

**Auth:** Public  
**Status:** `200` OK · `400` Validation · `401` Invalid credentials / deactivated account

**Request body**

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

| Field | Type | Required |
|-------|------|----------|
| `email` | string (email) | yes |
| `password` | string (min 8) | yes |

**Response `200`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "USER"
  }
}
```

> **Note:** The `user` object on login returns only 4 fields. Call `GET /auth/me` for the full profile.

---

### POST `/api/v1/auth/signin`

Alias for login. Accepts a `username` field (email or username) instead of `email`.

**Auth:** Public  
**Status:** Same as `/auth/login`

**Request body**

```json
{
  "username": "user@example.com",
  "password": "StrongPass123"
}
```

| Field | Type | Required |
|-------|------|----------|
| `username` | string | yes |
| `password` | string (min 8) | yes |

**Response `200`** — same shape as `/auth/login`.

---

### POST `/api/v1/auth/setup`

One-time bootstrap that creates the first `SUPER_ADMIN`. Requires the `SETUP_SECRET` environment variable.

**Auth:** Public  
**Status:** `201` Created · `401` Wrong secret · `409` Super admin already exists · `400` Validation

**Request body**

```json
{
  "email": "superadmin@example.com",
  "name": "Super Admin",
  "password": "StrongPass123",
  "setupSecret": "my-secret"
}
```

| Field | Type | Required |
|-------|------|----------|
| `email` | string (email) | yes |
| `name` | string (max 100) | yes |
| `password` | string (8–128) | yes |
| `setupSecret` | string | yes |

**Response `201`** — full `User` object with `role: "SUPER_ADMIN"`.

---

### GET `/api/v1/auth/me`

Return the currently authenticated user's full profile.

**Auth:** Bearer token (any role)  
**Status:** `200` OK · `401`

**Response `200`**

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### POST `/api/v1/auth/logout`

Invalidate the current token (added to server-side blocklist).

**Auth:** Bearer token  
**Status:** `200` OK · `401`

**Response `200`**

```json
{ "message": "Logged out successfully" }
```

---

### POST `/api/v1/auth/signout`

Alias for `/auth/logout`.

**Auth:** Bearer token  
**Status:** `200` OK · `401`

**Response `200`**

```json
{ "message": "Signed out successfully" }
```

---

## 3. Users

Base path: `/api/v1/users`  
**All endpoints require Bearer token.**

| Endpoint | Required role |
|----------|--------------|
| `POST`, `GET` (list), `GET :id` | `SUPER_ADMIN` or `ADMIN` |
| `PATCH :id`, `DELETE :id` | `SUPER_ADMIN` only |

---

### POST `/api/v1/users`

Create a user (role: `USER`).

**Status:** `201` · `400` · `401` · `403` · `409` email taken

**Request body**

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "StrongPass123"
}
```

**Response `201`** — full `User` object.

---

### GET `/api/v1/users`

List all `USER`-role accounts (paginated).

**Status:** `200` · `401` · `403`

**Query params:** standard pagination params.

**Response `200`** — `Paginated<User>`.

---

### GET `/api/v1/users/:id`

Get a single user.

**URL param:** `id` — UUID  
**Status:** `200` · `401` · `403` · `404`

**Response `200`** — full `User` object.

---

### PATCH `/api/v1/users/:id`

Update a user's email or name.

**URL param:** `id` — UUID  
**Status:** `200` · `400` · `401` · `403` · `404`

**Request body** (all fields optional)

```json
{
  "email": "updated@example.com",
  "name": "Updated Name"
}
```

**Response `200`** — updated `User`.

---

### DELETE `/api/v1/users/:id`

Permanently delete a user.

**URL param:** `id` — UUID  
**Status:** `204` · `401` · `403` · `404`

**Response:** empty body.

---

## 4. Admins

Base path: `/api/v1/admins`  
**All endpoints require Bearer token with `SUPER_ADMIN` role.**

---

### POST `/api/v1/admins`

Create an admin account (role: `ADMIN`).

**Status:** `201` · `400` · `401` · `403` · `409` email taken

**Request body**

```json
{
  "email": "admin@example.com",
  "name": "Admin Name",
  "password": "StrongPass123"
}
```

**Response `201`**

```json
{
  "id": "a1b2c3d4-...",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/admins`

List all admins.

**Status:** `200` · `401` · `403`

**Response `200`** — `Admin[]` (flat array, no pagination wrapper).

---

### GET `/api/v1/admins/:id`

Get a single admin.

**URL param:** `id` — UUID  
**Status:** `200` · `401` · `403` · `404`

**Response `200`** — `Admin` object.

---

### PATCH `/api/v1/admins/:id`

Update an admin's email or name.

**URL param:** `id` — UUID  
**Status:** `200` · `400` · `401` · `403` · `404`

**Request body** (all fields optional)

```json
{
  "email": "updated@example.com",
  "name": "Updated Name"
}
```

**Response `200`** — updated `Admin`.

---

### DELETE `/api/v1/admins/:id`

Permanently delete an admin.

**Status:** `204` · `401` · `403` · `404`

---

### PATCH `/api/v1/admins/:id/deactivate`

Deactivate an admin account.

**Status:** `200` · `401` · `403` · `404`

**Response `200`** — `Admin` with `isActive: false`.

---

### PATCH `/api/v1/admins/:id/activate`

Reactivate a deactivated admin account.

**Status:** `200` · `401` · `403` · `404`

**Response `200`** — `Admin` with `isActive: true`.

---

## 5. Health

### GET `/api/v1/health`

**Auth:** Public  
**Status:** `200` OK (all checks pass) · `503` Service Unavailable (any check fails)

**Response `200`**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

**Response `503`** — same shape with `status: "error"` and failing checks in `error`.

| Check | Threshold |
|-------|-----------|
| `database` | TypeORM ping to PostgreSQL |
| `memory_heap` | ≤ 300 MB |
| `memory_rss` | ≤ 512 MB |

---

## 6. Services

Base path: `/api/v1/services`

**Service object**

```json
{
  "id": "uuid",
  "slug": "physiotherapy",
  "title": "Physiotherapy",
  "shortDescription": "Short description text",
  "fullDescription": "Detailed full description...",
  "features": ["Feature A", "Feature B"],
  "imageUrl": "https://example.com/image.jpg",
  "sortOrder": 1,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `slug` | string | Unique identifier |
| `title` | string | |
| `shortDescription` | string | |
| `fullDescription` | string | |
| `features` | string[] | JSON array |
| `imageUrl` | string \| null | |
| `sortOrder` | number | |
| `createdAt` / `updatedAt` | string (ISO date) | |

---

### GET `/api/v1/services`

**Auth:** Public

**Query params:** pagination + `search` (title), `sort` (allowed: `title`, `sortOrder`, `createdAt`, `updatedAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<Service>`

---

### GET `/api/v1/services/slug/:slug`

**Auth:** Public  
**URL param:** `slug`  
**Status:** `200` · `404`

**Response `200`** — `Service`

---

### GET `/api/v1/services/:id`

**Auth:** Public  
**URL param:** `id` — UUID  
**Status:** `200` · `404`

**Response `200`** — `Service`

---

### POST `/api/v1/services`

**Auth:** `ADMIN`, `SUPER_ADMIN`  
**Status:** `201` · `400` · `401` · `403` · `409` slug taken

**Request body**

```json
{
  "slug": "physiotherapy",
  "title": "Physiotherapy",
  "shortDescription": "Short description",
  "fullDescription": "Full description...",
  "features": ["Feature A", "Feature B"],
  "imageUrl": "https://example.com/image.jpg",
  "sortOrder": 1
}
```

| Field | Type | Required |
|-------|------|----------|
| `slug` | string | yes |
| `title` | string | yes |
| `shortDescription` | string | yes |
| `fullDescription` | string | yes |
| `features` | string[] | yes |
| `imageUrl` | string (URL) | optional |
| `sortOrder` | integer ≥ 0 | optional (default `0`) |

**Response `201`** — `Service`

---

### PATCH `/api/v1/services/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN`  
**URL param:** `id` — UUID  
**Status:** `200` · `400` · `401` · `403` · `404`

**Request body** — any subset of `POST` fields (all optional).

**Response `200`** — updated `Service`

---

### DELETE `/api/v1/services/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN`  
**Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/services/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN`  
**Status:** `204` · `400` · `401` · `403`

**Request body** — `BulkDeleteDto`

---

## 7. Modalities

Base path: `/api/v1/modalities`

**Modality object**

```json
{
  "id": "uuid",
  "slug": "yoga-therapy",
  "number": "01",
  "title": "Yoga Therapy",
  "description": "Description of the modality...",
  "outcomes": ["Better flexibility", "Reduced stress"],
  "sortOrder": 0,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/modalities`

**Auth:** Public  
**Query:** pagination + `search` (title), `sort` (allowed: `title`, `number`, `sortOrder`, `createdAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<Modality>`

---

### GET `/api/v1/modalities/slug/:slug`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Modality`

---

### GET `/api/v1/modalities/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Modality`

---

### POST `/api/v1/modalities`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403` · `409`

**Request body**

```json
{
  "slug": "yoga-therapy",
  "number": "01",
  "title": "Yoga Therapy",
  "description": "Full description...",
  "outcomes": ["Better flexibility"],
  "sortOrder": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| `slug` | string | yes |
| `number` | string | yes |
| `title` | string | yes |
| `description` | string | yes |
| `outcomes` | string[] | yes |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `Modality`

---

### PATCH `/api/v1/modalities/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset of POST fields · **Response `200`** — `Modality`

---

### DELETE `/api/v1/modalities/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/modalities/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 8. News

Base path: `/api/v1/news`

**NewsPost object**

```json
{
  "id": "uuid",
  "slug": "first-post",
  "title": "First Post",
  "excerpt": "Short excerpt shown in listing",
  "content": "Full HTML or Markdown content",
  "date": "2026-06-07",
  "imageUrl": null,
  "category": "General",
  "status": "published",
  "locale": "en",
  "seoTitle": null,
  "seoDescription": null,
  "seoOgImage": null,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `status` | `"draft"` \| `"published"` | |
| `date` | string (`YYYY-MM-DD`) | |
| `locale` | string | defaults to `"en"` |
| `imageUrl`, `seoTitle`, `seoDescription`, `seoOgImage` | string \| null | |

> **Tip:** Public list does **not** auto-filter to `published`. Add `?status=published` to show only published posts.

---

### GET `/api/v1/news`

**Auth:** Public

**Query params:** pagination + search (title, excerpt, category) + `sort` (allowed: `title`, `date`, `category`, `status`, `createdAt`; default: `date DESC`) + `status` filter

| Extra param | Type | Description |
|-------------|------|-------------|
| `status` | `"draft"` \| `"published"` | Filter by publish status |

**Response `200`** — `Paginated<NewsPost>`

---

### GET `/api/v1/news/slug/:slug`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `NewsPost`

---

### GET `/api/v1/news/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `NewsPost`

---

### POST `/api/v1/news`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403` · `409` slug taken

**Request body**

```json
{
  "slug": "my-post",
  "title": "My Post Title",
  "excerpt": "Short excerpt",
  "content": "Full content body...",
  "date": "2026-06-07",
  "category": "Wellness",
  "status": "draft",
  "imageUrl": "https://example.com/img.jpg",
  "locale": "en",
  "seoTitle": "SEO title",
  "seoDescription": "SEO description",
  "seoOgImage": "https://example.com/og.jpg"
}
```

| Field | Type | Required |
|-------|------|----------|
| `slug` | string | yes |
| `title` | string | yes |
| `excerpt` | string | yes |
| `content` | string | yes |
| `date` | string (`YYYY-MM-DD`) | yes |
| `category` | string | yes |
| `status` | `"draft"` \| `"published"` | yes |
| `imageUrl` | string (URL) | optional |
| `locale` | string | optional (default `"en"`) |
| `seoTitle` | string | optional |
| `seoDescription` | string | optional |
| `seoOgImage` | string (URL) | optional |

**Response `201`** — `NewsPost`

---

### PATCH `/api/v1/news/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset of POST fields · **Response `200`** — `NewsPost`

---

### DELETE `/api/v1/news/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/news/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 9. Testimonials

Base path: `/api/v1/testimonials`

**Testimonial object**

```json
{
  "id": "uuid",
  "quote": "Amazing service! Highly recommended.",
  "name": "Jane Smith",
  "role": "Patient",
  "company": "Acme Corp",
  "avatarUrl": null,
  "sortOrder": 0,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/testimonials`

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `name`, `company`, `sortOrder`, `createdAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<Testimonial>`

---

### POST `/api/v1/testimonials`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "quote": "Amazing service!",
  "name": "Jane Smith",
  "role": "Patient",
  "company": "Acme Corp",
  "avatarUrl": "https://example.com/avatar.jpg",
  "sortOrder": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| `quote` | string | yes |
| `name` | string | yes |
| `role` | string | yes |
| `company` | string | yes |
| `avatarUrl` | string (URL) | optional |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `Testimonial`

---

### PATCH `/api/v1/testimonials/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `Testimonial`

---

### DELETE `/api/v1/testimonials/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/testimonials/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 10. Team

Base path: `/api/v1/team`

**TeamMember object**

```json
{
  "id": "uuid",
  "name": "Dr. Smith",
  "role": "Physiotherapist",
  "bio": "Expert in sports injury rehabilitation.",
  "imageUrl": null,
  "linkedinUrl": null,
  "whatsappUrl": null,
  "sortOrder": 0,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/team`

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `name`, `role`, `sortOrder`, `createdAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<TeamMember>`

---

### GET `/api/v1/team/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `TeamMember`

---

### POST `/api/v1/team`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "name": "Dr. Smith",
  "role": "Physiotherapist",
  "bio": "Expert in sports injury rehabilitation.",
  "imageUrl": "https://example.com/dr-smith.jpg",
  "linkedinUrl": "https://linkedin.com/in/drsmith",
  "whatsappUrl": "+9771234567890",
  "sortOrder": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `role` | string | yes |
| `bio` | string | yes |
| `imageUrl` | string (URL) | optional |
| `linkedinUrl` | string (URL) | optional |
| `whatsappUrl` | string | optional |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `TeamMember`

---

### PATCH `/api/v1/team/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `TeamMember`

---

### DELETE `/api/v1/team/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/team/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 11. Affiliates

Base path: `/api/v1/affiliates`

**Affiliate object**

```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "logoUrl": "https://example.com/acme-logo.png",
  "websiteUrl": "https://acme.com",
  "sortOrder": 0,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/affiliates`

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `name`, `sortOrder`, `createdAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<Affiliate>`

---

### POST `/api/v1/affiliates`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "name": "Acme Corp",
  "logoUrl": "https://example.com/acme-logo.png",
  "websiteUrl": "https://acme.com",
  "sortOrder": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `logoUrl` | string (URL) | optional |
| `websiteUrl` | string (URL) | optional |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `Affiliate`

---

### PATCH `/api/v1/affiliates/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `Affiliate`

---

### DELETE `/api/v1/affiliates/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/affiliates/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 12. Galleries

Base path: `/api/v1/galleries`

**Gallery object**

```json
{
  "id": "uuid",
  "title": "Summer 2026",
  "slug": "summer-2026",
  "coverImageUrl": "https://example.com/cover.jpg",
  "description": "Photos from our summer events.",
  "images": [
    { "url": "https://example.com/img1.jpg", "caption": "Opening ceremony" },
    { "url": "https://example.com/img2.jpg", "caption": null }
  ],
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

**GalleryImage object**

| Field | Type |
|-------|------|
| `url` | string (URL) |
| `caption` | string \| null |

---

### GET `/api/v1/galleries`

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `title`, `createdAt`, `updatedAt`; default: `createdAt DESC`)

**Response `200`** — `Paginated<Gallery>`

---

### GET `/api/v1/galleries/slug/:slug`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Gallery`

---

### GET `/api/v1/galleries/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Gallery`

---

### POST `/api/v1/galleries`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403` · `409` slug taken

**Request body**

```json
{
  "title": "Summer 2026",
  "slug": "summer-2026",
  "coverImageUrl": "https://example.com/cover.jpg",
  "description": "Photos from our summer events.",
  "images": [
    { "url": "https://example.com/img1.jpg", "caption": "Opening ceremony" }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| `title` | string | yes |
| `slug` | string | yes |
| `images` | GalleryImage[] | yes |
| `coverImageUrl` | string (URL) | optional |
| `description` | string | optional |

**Response `201`** — `Gallery`

---

### PATCH `/api/v1/galleries/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `Gallery`

---

### DELETE `/api/v1/galleries/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/galleries/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 13. Downloads

Base path: `/api/v1/downloads`

**DownloadGroup object**

```json
{
  "id": "uuid",
  "title": "Patient Forms",
  "description": "Downloadable forms for patients.",
  "files": [
    { "label": "Registration Form", "url": "https://example.com/reg.pdf", "size": "120KB" },
    { "label": "Consent Form", "url": "https://example.com/consent.pdf", "size": null }
  ],
  "sortOrder": 0,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

**DownloadFile object**

| Field | Type |
|-------|------|
| `label` | string |
| `url` | string |
| `size` | string \| null |

---

### GET `/api/v1/downloads`

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `title`, `sortOrder`, `createdAt`; default: `sortOrder DESC`)

**Response `200`** — `Paginated<DownloadGroup>`

---

### GET `/api/v1/downloads/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `DownloadGroup`

---

### POST `/api/v1/downloads`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "title": "Patient Forms",
  "description": "Downloadable forms for patients.",
  "files": [
    { "label": "Registration Form", "url": "https://example.com/reg.pdf", "size": "120KB" }
  ],
  "sortOrder": 0
}
```

| Field | Type | Required |
|-------|------|----------|
| `title` | string | yes |
| `description` | string | yes |
| `files` | DownloadFile[] | yes |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `DownloadGroup`

---

### PATCH `/api/v1/downloads/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `DownloadGroup`

---

### DELETE `/api/v1/downloads/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/downloads/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 14. Contact

### POST `/api/v1/contact`

Submit a public contact form.

**Auth:** Public  
**Status:** `201` · `400` validation

**Request body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+9771234567",
  "subject": "Appointment Inquiry",
  "message": "I would like to book an appointment..."
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `email` | string (email) | yes |
| `phone` | string | optional |
| `subject` | string | yes |
| `message` | string | yes |

**Response `201`**

```json
{ "ok": true }
```

---

## 15. Contact Messages (Admin)

Base path: `/api/v1/contact-messages`  
**All endpoints require Bearer token (`ADMIN` or `SUPER_ADMIN`).**

**ContactMessage object**

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+9771234567",
  "subject": "Appointment Inquiry",
  "message": "I would like to book an appointment...",
  "status": "new",
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

| `status` value | Meaning |
|----------------|---------|
| `new` | Not yet read |
| `read` | Opened by an admin |
| `archived` | Archived / resolved |

---

### GET `/api/v1/contact-messages`

**Status:** `200` · `401` · `403`

**Query params:** pagination + `search` (name, email, subject) + `sort` (allowed: `createdAt`, `status`, `name`, `email`; default: `createdAt DESC`) + `status` filter

| Extra param | Type | Description |
|-------------|------|-------------|
| `status` | `"new"` \| `"read"` \| `"archived"` | Filter by status |

**Response `200`** — `Paginated<ContactMessage>`

---

### PATCH `/api/v1/contact-messages/:id`

Update a message's status.

**URL param:** `id` — UUID  
**Status:** `200` · `400` · `401` · `403` · `404`

**Request body**

```json
{ "status": "read" }
```

| Field | Type | Required |
|-------|------|----------|
| `status` | `"new"` \| `"read"` \| `"archived"` | yes |

**Response `200`** — updated `ContactMessage`

---

### POST `/api/v1/contact-messages/bulk-status`

Update the status of multiple messages at once.

**Status:** `204` · `400` · `401` · `403`

**Request body**

```json
{
  "ids": ["uuid-1", "uuid-2"],
  "status": "archived"
}
```

| Field | Type | Required |
|-------|------|----------|
| `ids` | string[] (UUID v4) | yes |
| `status` | `"new"` \| `"read"` \| `"archived"` | yes |

**Response:** empty body.

---

### DELETE `/api/v1/contact-messages/:id`

**URL param:** `id` — UUID  
**Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/contact-messages/bulk-delete`

**Status:** `204` · `400` · `401` · `403` · **Request body:** `BulkDeleteDto`

---

## 16. Content Blocks

Base path: `/api/v1/content-blocks`

Content blocks are reusable, key-addressed text sections (e.g., hero copy, about blurbs).

**ContentBlock object**

```json
{
  "id": "uuid",
  "key": "hero-heading",
  "title": "Hero Heading",
  "body": "Welcome to Agurkha — your path to wellness.",
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/content-blocks`

**Auth:** Public  
**Query:** pagination + `search` (key, title) + `sort` (allowed: `key`, `title`, `createdAt`; default: `createdAt DESC`)

**Response `200`** — `Paginated<ContentBlock>`

---

### GET `/api/v1/content-blocks/key/:key`

Fetch a single content block by its unique key (most useful for frontend).

**Auth:** Public · **URL param:** `key` · **Status:** `200` · `404`

**Response `200`** — `ContentBlock`

---

### GET `/api/v1/content-blocks/:id`

**Auth:** Public · **URL param:** `id` — UUID · **Status:** `200` · `404` · **Response:** `ContentBlock`

---

### POST `/api/v1/content-blocks`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403` · `409` key taken

**Request body**

```json
{
  "key": "hero-heading",
  "title": "Hero Heading",
  "body": "Welcome to Agurkha."
}
```

| Field | Type | Required |
|-------|------|----------|
| `key` | string | yes |
| `title` | string | yes |
| `body` | string | yes |

**Response `201`** — `ContentBlock`

---

### PATCH `/api/v1/content-blocks/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `ContentBlock`

---

### DELETE `/api/v1/content-blocks/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/content-blocks/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 17. Pages

Base path: `/api/v1/pages`

**Page object**

```json
{
  "id": "uuid",
  "slug": "about-us",
  "title": "About Us",
  "template": "default",
  "body": "<p>Our story...</p>",
  "featuredImageUrl": null,
  "status": "published",
  "locale": "en",
  "seoTitle": "About Us | Agurkha",
  "seoDescription": "Learn about our mission.",
  "seoKeywords": "wellness, physiotherapy",
  "seoOgImage": null,
  "publishAt": null,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

> **Tip:** Public list does **not** auto-filter to `published`. Add `?status=published`.

---

### GET `/api/v1/pages`

**Auth:** Public  
**Query:** pagination + `search` (title, slug) + `sort` (allowed: `title`, `slug`, `status`, `publishAt`, `createdAt`; default: `createdAt DESC`) + `status` filter

| Extra param | Type | Description |
|-------------|------|-------------|
| `status` | `"draft"` \| `"published"` | Filter by status |

**Response `200`** — `Paginated<Page>`

---

### GET `/api/v1/pages/slug/:slug`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Page`

---

### GET `/api/v1/pages/:id`

**Auth:** Public · **Status:** `200` · `404` · **Response:** `Page`

---

### POST `/api/v1/pages`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403` · `409` slug taken

**Request body**

```json
{
  "slug": "about-us",
  "title": "About Us",
  "body": "<p>Our story...</p>",
  "status": "published",
  "template": "default",
  "featuredImageUrl": null,
  "locale": "en",
  "seoTitle": "About Us | Agurkha",
  "seoDescription": "Learn about our mission.",
  "seoKeywords": "wellness, physiotherapy",
  "seoOgImage": null,
  "publishAt": "2026-06-10T00:00:00.000Z"
}
```

| Field | Type | Required |
|-------|------|----------|
| `slug` | string | yes |
| `title` | string | yes |
| `body` | string | yes |
| `status` | `"draft"` \| `"published"` | yes |
| `template` | string | optional (default `"default"`) |
| `featuredImageUrl` | string (URL) | optional |
| `locale` | string | optional (default `"en"`) |
| `seoTitle` | string | optional |
| `seoDescription` | string | optional |
| `seoKeywords` | string | optional |
| `seoOgImage` | string (URL) | optional |
| `publishAt` | string (ISO date) | optional |

**Response `201`** — `Page`

---

### PATCH `/api/v1/pages/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Request body:** any subset · **Response `200`** — `Page`

---

### DELETE `/api/v1/pages/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/pages/bulk-delete`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 18. Settings

Base path: `/api/v1/settings`

Settings are schemaless JSON blobs stored per key. Each `PATCH` **shallow-merges** the sent object into the existing value.

**Response shape for all settings endpoints:**

```json
{
  "siteName": "Agurkha",
  "phone": "+9771234567",
  "email": "hello@agurkha.com"
}
```

_(Any JSON key-value pairs — no fixed schema.)_

---

### GET `/api/v1/settings/general`

**Auth:** Public · **Status:** `200`

**Response:** `Record<string, unknown>` (empty `{}` if not yet set).

---

### PATCH `/api/v1/settings/general`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `200` · `401` · `403`

**Request body** — any JSON object:

```json
{
  "siteName": "Agurkha Wellness",
  "phone": "+9771234567",
  "email": "hello@agurkha.com",
  "address": "Kathmandu, Nepal"
}
```

**Response `200`** — full merged settings object for `general`.

---

### GET `/api/v1/settings/homepage`

**Auth:** Public · **Status:** `200`

**Response:** `Record<string, unknown>`

---

### PATCH `/api/v1/settings/homepage`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `200` · `401` · `403`

**Request body** — any JSON object:

```json
{
  "heroTitle": "Your Path to Wellness",
  "heroSubtitle": "Expert physiotherapy and wellness care",
  "showTestimonials": true,
  "showServices": true
}
```

**Response `200`** — merged homepage settings.

---

### PATCH `/api/v1/settings/site`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `200` · `401` · `403`

**Request body** — any JSON object (e.g. SEO, social meta defaults).

**Response `200`** — merged site settings.

---

### PATCH `/api/v1/settings/scripts`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `200` · `401` · `403`

**Request body** — any JSON object (e.g. tracking script config):

```json
{
  "googleAnalyticsId": "G-XXXXXX",
  "facebookPixelId": "123456"
}
```

**Response `200`** — merged scripts settings.

---

### PATCH `/api/v1/settings/social`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `200` · `401` · `403`

**Request body** — any JSON object:

```json
{
  "facebook": "https://facebook.com/agurkha",
  "instagram": "https://instagram.com/agurkha",
  "twitter": "https://twitter.com/agurkha"
}
```

**Response `200`** — merged social settings.

---

## 19. Menus

Base path: `/api/v1/menus`

**MenuItem object**

```json
{
  "id": "uuid",
  "location": "header",
  "parentId": null,
  "sortOrder": 0,
  "label": "Services",
  "linkType": "url",
  "linkValue": "/services",
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

| `location` | Values |
|------------|--------|
| | `"header"`, `"footer"` |

| `linkType` | Values |
|------------|--------|
| | `"url"`, `"page"`, `"service"`, `"news"`, `"modality"` |

---

### GET `/api/v1/menus?location=header`

Public flat menu for a specific location (sorted by `sortOrder ASC`). Returns a plain array, **not** paginated.

**Auth:** Public · **Query param:** `location` (`"header"` or `"footer"`)

**Response `200`** — `MenuItem[]`

---

### GET `/api/v1/menus`

Admin paginated list of all menu items (no `location` filter).

**Auth:** Public  
**Query:** pagination + `sort` (allowed: `label`, `location`, `sortOrder`, `createdAt`; default: `sortOrder ASC`)

**Response `200`** — `Paginated<MenuItem>`

---

### POST `/api/v1/menus`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "location": "header",
  "label": "Services",
  "linkType": "url",
  "linkValue": "/services",
  "parentId": null,
  "sortOrder": 1
}
```

| Field | Type | Required |
|-------|------|----------|
| `location` | `"header"` \| `"footer"` | yes |
| `label` | string | yes |
| `linkType` | string | yes |
| `linkValue` | string | yes |
| `parentId` | string (UUID) | optional |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `MenuItem`

---

### PATCH `/api/v1/menus/reorder`

Reorder multiple menu items in one request.

**Auth:** `ADMIN`, `SUPER_ADMIN` · **Status:** `204` · `400` · `401` · `403`

**Request body**

```json
{
  "items": [
    { "id": "uuid-1", "sortOrder": 0 },
    { "id": "uuid-2", "sortOrder": 1 }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| `items` | array | yes |
| `items[].id` | string (UUID) | yes |
| `items[].sortOrder` | integer ≥ 0 | yes |

**Response:** empty body.

---

### PATCH `/api/v1/menus/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **URL param:** `id` · **Request body:** any subset of POST fields · **Response `200`** — `MenuItem`

---

### DELETE `/api/v1/menus/:id`

**Auth:** `ADMIN`, `SUPER_ADMIN` · **URL param:** `id` · **Status:** `204` · `401` · `403` · `404`

---

## 20. Banner Categories

Base path: `/api/v1/banner-categories`  
**All endpoints require Bearer token (`ADMIN` or `SUPER_ADMIN`).**

**BannerCategory object**

```json
{
  "id": "uuid",
  "name": "Hero Banners",
  "slug": "hero-banners",
  "seoTitle": null,
  "seoDescription": null,
  "seoOgImage": null,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/banner-categories`

**Status:** `200` · `401` · `403`  
**Query:** pagination + `search` (name, slug) + `sort` (allowed: `name`, `slug`, `createdAt`; default: `createdAt DESC`)

**Response `200`** — `Paginated<BannerCategory>`

---

### POST `/api/v1/banner-categories`

**Status:** `201` · `400` · `401` · `403` · `409` slug taken

**Request body**

```json
{
  "name": "Hero Banners",
  "slug": "hero-banners",
  "seoTitle": "Hero Banners",
  "seoDescription": "Our hero banner collection.",
  "seoOgImage": "https://example.com/og.jpg"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `slug` | string | yes |
| `seoTitle` | string | optional |
| `seoDescription` | string | optional |
| `seoOgImage` | string (URL) | optional |

**Response `201`** — `BannerCategory`

---

### PATCH `/api/v1/banner-categories/:id`

**Request body:** any subset · **Response `200`** — `BannerCategory`

---

### DELETE `/api/v1/banner-categories/:id`

**Status:** `204` · `401` · `403` · `404`

> Deleting a category cascades to its banners.

---

## 21. Banners

Base path: `/api/v1/banners`  
**All endpoints require Bearer token (`ADMIN` or `SUPER_ADMIN`).**

**Banner object**

```json
{
  "id": "uuid",
  "title": "Summer Sale",
  "body": "Get 20% off all services this summer!",
  "imageUrl": "https://example.com/banner.jpg",
  "ctaLabel": "Book Now",
  "ctaUrl": "/contact",
  "categoryId": "cat-uuid",
  "category": {
    "id": "cat-uuid",
    "name": "Hero Banners",
    "slug": "hero-banners"
  },
  "locale": "en",
  "publishFrom": null,
  "publishTo": null,
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2026-06-07T08:00:00.000Z",
  "updatedAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/banners`

**Status:** `200` · `401` · `403`  
**Query:** pagination + `search` (title) + `sort` (allowed: `title`, `sortOrder`, `isActive`, `publishFrom`, `createdAt`; default: `sortOrder ASC`)

**Response `200`** — `Paginated<Banner>` (each item includes nested `category`)

---

### POST `/api/v1/banners`

**Status:** `201` · `400` · `401` · `403`

**Request body**

```json
{
  "title": "Summer Sale",
  "body": "Get 20% off all services this summer!",
  "categoryId": "cat-uuid",
  "imageUrl": "https://example.com/banner.jpg",
  "ctaLabel": "Book Now",
  "ctaUrl": "/contact",
  "locale": "en",
  "publishFrom": "2026-06-01T00:00:00.000Z",
  "publishTo": "2026-08-31T23:59:59.000Z",
  "isActive": true,
  "sortOrder": 1
}
```

| Field | Type | Required |
|-------|------|----------|
| `title` | string | yes |
| `body` | string | yes |
| `categoryId` | string (UUID) | yes |
| `imageUrl` | string (URL) | optional |
| `ctaLabel` | string | optional |
| `ctaUrl` | string | optional |
| `locale` | string | optional (default `"en"`) |
| `publishFrom` | string (ISO date) | optional |
| `publishTo` | string (ISO date) | optional |
| `isActive` | boolean | optional (default `true`) |
| `sortOrder` | integer ≥ 0 | optional |

**Response `201`** — `Banner`

---

### PATCH `/api/v1/banners/:id`

**Request body:** any subset · **Response `200`** — `Banner` (includes nested `category`)

---

### DELETE `/api/v1/banners/:id`

**Status:** `204` · `401` · `403` · `404`

---

### POST `/api/v1/banners/bulk-delete`

**Status:** `204` · **Request body:** `BulkDeleteDto`

---

## 22. Media

Base path: `/api/v1/media`  
**All endpoints require Bearer token (`ADMIN` or `SUPER_ADMIN`).**

Uploaded files are served statically at `/uploads/<filename>` (outside `/api/v1`).

**MediaItem object**

```json
{
  "id": "uuid",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "originalName": "profile-photo.jpg",
  "mimeType": "image/jpeg",
  "size": 204800,
  "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "createdAt": "2026-06-07T08:00:00.000Z"
}
```

---

### GET `/api/v1/media`

**Status:** `200` · `401` · `403`  
**Query:** pagination + `search` (originalName) + `sort` (allowed: `originalName`, `mimeType`, `size`, `createdAt`; default: `createdAt DESC`)

**Response `200`** — `Paginated<MediaItem>`

---

### POST `/api/v1/media/upload`

Upload a single file.

**Status:** `201` · `400` no file · `401` · `403`  
**Content-Type:** `multipart/form-data`

**Request (form field)**

| Field | Type | Required |
|-------|------|----------|
| `file` | binary | yes |

**Response `201`** — `MediaItem`

---

### DELETE `/api/v1/media/:id`

Delete a media item and its file from disk.

**URL param:** `id` — UUID  
**Status:** `204` · `401` · `403` · `404`

---

### DELETE `/api/v1/media/bulk-delete`

**Status:** `204` · `400` · `401` · `403`  
**Request body:** `BulkDeleteDto`

---

## 23. Analytics

Base path: `/api/v1/analytics`  
**All endpoints require Bearer token (`ADMIN` or `SUPER_ADMIN`).**

---

### GET `/api/v1/analytics/summary`

Dashboard summary statistics.

**Status:** `200` · `401` · `403`

**Response `200`**

```json
{
  "pageViews": {
    "total": 0,
    "byDay": []
  },
  "messagesByMonth": [
    { "month": "2026-06", "received": 5 },
    { "month": "2026-05", "received": 12 }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pageViews.total` | number | Total page views (currently 0 — reserved for future integration) |
| `pageViews.byDay` | `{ date: string; views: number }[]` | Daily breakdown |
| `messagesByMonth` | `{ month: string; received: number }[]` | Contact messages per month — last 12 months, sorted newest first. `month` format: `YYYY-MM` |

---

## 24. Quick Reference

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/api/v1/auth/register` | Public |
| `POST` | `/api/v1/auth/login` | Public |
| `POST` | `/api/v1/auth/signin` | Public |
| `POST` | `/api/v1/auth/setup` | Public |
| `GET` | `/api/v1/auth/me` | Bearer |
| `POST` | `/api/v1/auth/logout` | Bearer |
| `POST` | `/api/v1/auth/signout` | Bearer |
| `POST` | `/api/v1/users` | Bearer (SA, ADMIN) |
| `GET` | `/api/v1/users` | Bearer (SA, ADMIN) |
| `GET` | `/api/v1/users/:id` | Bearer (SA, ADMIN) |
| `PATCH` | `/api/v1/users/:id` | Bearer (SA) |
| `DELETE` | `/api/v1/users/:id` | Bearer (SA) |
| `POST` | `/api/v1/admins` | Bearer (SA) |
| `GET` | `/api/v1/admins` | Bearer (SA) |
| `GET` | `/api/v1/admins/:id` | Bearer (SA) |
| `PATCH` | `/api/v1/admins/:id` | Bearer (SA) |
| `DELETE` | `/api/v1/admins/:id` | Bearer (SA) |
| `PATCH` | `/api/v1/admins/:id/activate` | Bearer (SA) |
| `PATCH` | `/api/v1/admins/:id/deactivate` | Bearer (SA) |
| `GET` | `/api/v1/health` | Public |
| `GET` | `/api/v1/services` | Public |
| `GET` | `/api/v1/services/slug/:slug` | Public |
| `GET` | `/api/v1/services/:id` | Public |
| `POST` | `/api/v1/services` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/services/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/services/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/services/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/modalities` | Public |
| `GET` | `/api/v1/modalities/slug/:slug` | Public |
| `GET` | `/api/v1/modalities/:id` | Public |
| `POST` | `/api/v1/modalities` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/modalities/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/modalities/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/modalities/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/news` | Public |
| `GET` | `/api/v1/news/slug/:slug` | Public |
| `GET` | `/api/v1/news/:id` | Public |
| `POST` | `/api/v1/news` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/news/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/news/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/news/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/testimonials` | Public |
| `POST` | `/api/v1/testimonials` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/testimonials/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/testimonials/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/testimonials/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/team` | Public |
| `GET` | `/api/v1/team/:id` | Public |
| `POST` | `/api/v1/team` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/team/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/team/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/team/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/affiliates` | Public |
| `POST` | `/api/v1/affiliates` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/affiliates/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/affiliates/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/affiliates/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/galleries` | Public |
| `GET` | `/api/v1/galleries/slug/:slug` | Public |
| `GET` | `/api/v1/galleries/:id` | Public |
| `POST` | `/api/v1/galleries` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/galleries/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/galleries/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/galleries/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/downloads` | Public |
| `GET` | `/api/v1/downloads/:id` | Public |
| `POST` | `/api/v1/downloads` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/downloads/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/downloads/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/downloads/bulk-delete` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/contact` | Public |
| `GET` | `/api/v1/contact-messages` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/contact-messages/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/contact-messages/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/contact-messages/bulk-status` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/contact-messages/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/content-blocks` | Public |
| `GET` | `/api/v1/content-blocks/key/:key` | Public |
| `GET` | `/api/v1/content-blocks/:id` | Public |
| `POST` | `/api/v1/content-blocks` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/content-blocks/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/content-blocks/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/content-blocks/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/pages` | Public |
| `GET` | `/api/v1/pages/slug/:slug` | Public |
| `GET` | `/api/v1/pages/:id` | Public |
| `POST` | `/api/v1/pages` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/pages/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/pages/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/pages/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/settings/general` | Public |
| `GET` | `/api/v1/settings/homepage` | Public |
| `PATCH` | `/api/v1/settings/general` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/settings/homepage` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/settings/site` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/settings/scripts` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/settings/social` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/menus` | Public |
| `GET` | `/api/v1/menus?location=header\|footer` | Public |
| `POST` | `/api/v1/menus` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/menus/reorder` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/menus/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/menus/:id` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/banner-categories` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/banner-categories` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/banner-categories/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/banner-categories/:id` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/banners` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/banners` | Bearer (ADMIN, SA) |
| `PATCH` | `/api/v1/banners/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/banners/:id` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/banners/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/media` | Bearer (ADMIN, SA) |
| `POST` | `/api/v1/media/upload` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/media/:id` | Bearer (ADMIN, SA) |
| `DELETE` | `/api/v1/media/bulk-delete` | Bearer (ADMIN, SA) |
| `GET` | `/api/v1/analytics/summary` | Bearer (ADMIN, SA) |

**SA** = `SUPER_ADMIN`  **ADMIN** = `ADMIN`  **Bearer** = any authenticated role

---

_Generated from source — last updated 2026-06-07_
