# Admin dashboard access

The storefront and admin panel share **one Supabase Auth user pool**. Access to `/admin` is enforced by a database table, not by hiding the URL.

## `public.admin_users`

- One row per admin: **`user_id`** = `auth.users.id` (UUID).
- Table is created in **`supabase/schema.sql`** (run the full file in the Supabase SQL Editor, or run only the `admin_users` section if the rest already exists).
- To **add an admin**, insert their user id (from **Authentication → Users**):

  ```sql
  insert into public.admin_users (user_id)
  values ('THEIR-USER-UUID-HERE'::uuid)
  on conflict (user_id) do nothing;
  ```

- To **remove** admin access:

  ```sql
  delete from public.admin_users where user_id = 'THEIR-UUID'::uuid;
  ```

## Behavior

- **Middleware** checks `admin_users` for the signed-in user (RLS allows each user to read only their own row).
- **Admin login** (`/admin/login`) signs out anyone who is not in `admin_users`.

## No `ADMIN_EMAILS` env var

Admin access is **only** controlled by `public.admin_users` (this repo no longer uses an email allowlist in env).
