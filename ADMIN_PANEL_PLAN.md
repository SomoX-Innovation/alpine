# Alpine Admin Panel — Plan

Plan for a dedicated admin area to manage products, orders, and store content for the Alpine DTF t-shirt store.

---

## 1. Goals

- **Products:** Create, edit, delete products; set category, price, badge, images, sizes, color.
- **Orders:** View and manage orders; update status; support track-order flow.
- **Content (optional):** Manage hero image, FAQ, or other static content.
- **Access:** Admin-only; separate from the public site and not linked in header/footer.

---

## 2. Tech Stack (aligned with current app)

| Area | Recommendation | Notes |
|------|----------------|-------|
| **Framework** | Next.js App Router (existing) | Add route group `app/(admin)/admin/...` so layout is separate. |
| **Auth** | NextAuth.js or Auth.js (Next.js 15) | Simple credentials or magic link; no customer auth in admin. |
| **Database** | Supabase (PostgreSQL) or Vercel Postgres | For products, orders, admin users; fits serverless. |
| **Storage** | Supabase Storage or Vercel Blob | Product images and hero image uploads. |
| **UI** | Same design tokens (CSS vars), minimal components | Reuse `--background`, `--foreground`, etc.; tables, forms, modals. |

---

## 3. Route Structure

All admin routes live under `/admin` and are protected (redirect to login if not authenticated).

```
app/
  (admin)/
    admin/
      layout.tsx          # Admin shell: sidebar + auth check
      page.tsx            # Dashboard
      login/
        page.tsx          # Admin login (no header/footer)
      products/
        page.tsx          # Product list
        new/
          page.tsx        # Add product
        [id]/
          edit/
            page.tsx      # Edit product
      orders/
        page.tsx          # Order list + filters
        [id]/
          page.tsx        # Order detail + status update
      content/            # Optional phase
        page.tsx          # Hero, FAQ, etc.
      settings/           # Optional phase
        page.tsx          # Shipping rules, site name, etc.
```

- Use a **route group** `(admin)` so you can give admin a different layout (e.g. no main site Header/Footer) without changing the URL.
- Middleware or layout-level auth: if not logged in as admin, redirect to `/admin/login`.

---

## 4. Data Model (for DB-backed admin)

Extend beyond current static `lib/products.ts` and in-memory checkout.

### 4.1 Products (replace or mirror current Product type)

- `id`, `name`, `slug`, `description`
- `price`, `compare_at_price` (optional, for Sale)
- `category`: Women | Men | Unisex
- `badge`: New | Sale | null
- `color` (string), `sizes` (array or JSON)
- `image` (main), `images` (gallery) — store URLs from Supabase Storage or Blob
- `published`: boolean (hide from store until ready)
- `created_at`, `updated_at`

### 4.2 Orders (new)

- `id`, `order_number` (e.g. ALP-1001)
- `status`: pending | paid | processing | shipped | delivered | cancelled
- `customer_email`, `customer_name`, `shipping_address` (JSON or columns)
- `line_items` (JSON): `[{ productId, name, size, quantity, price }]`
- `subtotal`, `shipping_cost`, `total`
- `tracking_code`, `tracking_carrier` (optional)
- `created_at`, `updated_at`

### 4.3 Admin users

- `id`, `email`, `password_hash` (or use Supabase Auth / NextAuth adapter)
- `name`, `role` (e.g. admin) if you need roles later.

### 4.4 Content (optional)

- `key` (e.g. `hero_image`, `faq_json`), `value` (URL or JSON), `updated_at`.

---

## 5. Features by Phase

### Phase 1 — Foundation

- [ ] **Auth:** Login page at `/admin/login`; protect `/admin` (middleware or layout).
- [ ] **Dashboard:** Single page at `/admin` with:
  - Count of products.
  - Count of orders (today / this week / total) if orders exist.
  - Short list of recent orders (if DB exists).
- [ ] **DB + env:** Set up Supabase (or chosen DB); env vars for DB URL and (if used) NextAuth secret.

### Phase 2 — Products

- [ ] **Product list:** Table with name, category, price, badge, status (published/draft); search/filter; link to edit.
- [ ] **Create product:** Form (name, slug, price, compare_at_price, category, badge, color, sizes, description, images).
- [ ] **Edit product:** Same form pre-filled; optional “Unpublish” / “Delete”.
- [ ] **Images:** Upload to Supabase Storage (or Blob); store URLs in product record; show thumbnails in list and form.
- [ ] **Storefront:** Either switch store to read from API/DB, or keep static data and use admin to export/seed.

### Phase 3 — Orders

- [ ] **Persist orders:** On checkout submit, write order to DB (and optionally send “confirmation” email).
- [ ] **Order list:** Table with order number, date, customer email, total, status; filter by status/date.
- [ ] **Order detail:** Full address, line items, status; form to update status and (optional) tracking code.
- [ ] **Track order:** Existing `/track-order` page reads from DB by order number + email and shows status + tracking.

### Phase 4 — Content & settings (optional)

- [ ] **Hero image:** Admin upload; save URL in DB or config; storefront hero reads from that source.
- [ ] **FAQ:** Edit FAQ entries in admin; store as JSON or rows; FAQ page reads from API or static build.
- [ ] **Settings:** Shipping thresholds, contact email, etc., stored in DB or env.

---

## 6. Security

- **Admin only:** All `/admin` routes (except `/admin/login`) require authenticated admin.
- **No admin in public UI:** Do not add “Admin” in header/footer; access via direct URL or bookmark.
- **Env:** Store `ADMIN_EMAIL` / allowed list or use DB-backed admin users; never commit secrets.
- **HTTPS:** Enforce in production; use secure cookies for session.

---

## 7. UI Sketch (admin layout)

- **Sidebar (desktop):** Logo “Alpine Admin”, nav: Dashboard, Products, Orders, (Content, Settings).
- **Top bar:** “Logged in as admin@…”, Log out.
- **Main area:** Page content (tables, forms); reuse existing dark theme vars for consistency.
- **Mobile:** Collapsible sidebar or bottom nav for main sections.

---

## 8. Implementation Order (summary)

1. **Setup:** Route group `(admin)`, layout with sidebar, login page, auth (NextAuth or Supabase Auth).
2. **DB:** Supabase project; tables: `products`, `orders`, `admin_users` (or Auth provider); env in `.env.local`.
3. **Dashboard:** Read product/order counts and recent orders from DB.
4. **Products:** CRUD + image upload; then wire storefront to DB or keep static and use admin for data entry/export.
5. **Orders:** Persist checkout to DB; order list + detail + status/tracking; connect track-order to DB.
6. **Optional:** Content (hero, FAQ) and settings.

---

## 9. Files to Add (high level)

- `app/(admin)/admin/layout.tsx` — auth check, sidebar, main content area.
- `app/(admin)/admin/login/page.tsx` — login form.
- `app/(admin)/admin/page.tsx` — dashboard.
- `app/(admin)/admin/products/*` — list, new, edit.
- `app/(admin)/admin/orders/*` — list, detail.
- `lib/db.ts` or `lib/supabase.ts` — DB client.
- `lib/auth.ts` — NextAuth config or Supabase auth helpers.
- `middleware.ts` — protect `/admin` (optional; can do in layout).
- API routes or Server Actions for: products CRUD, orders create/update, image upload.

This plan keeps the current store as-is until you’re ready to switch to DB-backed products/orders, and lets you implement admin in clear phases.
