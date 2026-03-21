# Supabase Auth emails (signup / reset password)

Auth emails are sent **by Supabase**, not by `lib/mail.ts`. Order confirmation emails use Gmail SMTP in the app; **signup and password reset** use Supabase’s mail settings.

## 1. Site URL & redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Example |
|--------|---------|
| **Site URL** | **`https://alpineleafclothing.online`** (production) or `http://localhost:3000` (dev) |
| **Redirect URLs** | Add each URL below (one per line or comma-separated, depending on UI) |

Include at least:

**Local development**

- `http://localhost:3000/**`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

**Production ([alpineleafclothing.online](https://alpineleafclothing.online/))**

- `https://alpineleafclothing.online/**`
- `https://alpineleafclothing.online/auth/callback`
- `https://alpineleafclothing.online/reset-password`

Password reset emails open `/auth/callback` then redirect to **`/reset-password`** to set a new password.

This app exchanges email links at **`/auth/callback`** (see `app/auth/callback/route.ts`). If these URLs are missing, users see “redirect_uri mismatch” or links do nothing.

## 2. Public site URL in the app

Set in `.env.local` (and in Vercel **Environment Variables** for production):

```env
NEXT_PUBLIC_SITE_URL=https://alpineleafclothing.online
```

For local dev:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

If this is unset, the server may fail to build correct links in `signUp` / `resetPasswordForEmail` when the `Origin` header is missing.

## 3. Send auth mail through Gmail (Custom SMTP)

So Supabase uses the same Gmail account as the rest of your setup:

1. **Authentication → SMTP Settings** (or **Providers → SMTP** / **Auth → SMTP**).
2. Enable **Custom SMTP** / **Enable custom SMTP**.

### Supabase “SMTP provider settings” form — use Gmail like this

Do **not** use the placeholder `your.smtp.host.com`. For **Google Gmail**:

| Field | Value |
|--------|--------|
| **Host** | `smtp.gmail.com` |
| **Port** | `465` (with SSL/TLS) **or** `587` (often with STARTTLS — match what Supabase shows: SSL on 465 vs TLS on 587) |
| **Minimum interval per user** | `60` (default is fine; stops duplicate emails to the same address) |
| **Username** | Your **full Gmail address** (e.g. `info.krishantha.b@gmail.com`). Not a nickname only — must be the account you created the App Password for. |
| **Password** | A **Google App Password** (16 characters). Create under Google Account → Security → 2-Step Verification → **App passwords**. Use the **same** value as `GMAIL_APP_PASSWORD` in `.env.local`. **Not** your normal Gmail login password. |

If the form has **Sender email** / **Sender name**, set the sender to the **same Gmail address** (or a Google Workspace alias that is allowed to send as that user).

**Port note:** `465` + SSL is the usual Gmail combo in dashboards. If connection fails, try `587` with TLS/STARTTLS per Supabase’s toggle labels.

After saving, test **Sign up** and **Forgot password** again.

## 4. Rate limits

Supabase’s built-in auth email quota is limited on free tiers. If you see “rate limit” errors:

- Wait and retry, or  
- Use **Custom SMTP** (above) so Gmail sends the mail and your project limits apply differently.

## 5. Order confirmation vs auth mail

| Flow | Sender |
|------|--------|
| Order placed | `lib/mail.ts` → Gmail (`GMAIL_USER` / `GMAIL_APP_PASSWORD`) |
| Confirm signup / reset password | Supabase Auth → Custom SMTP (Gmail) when configured |

Both can use the same Gmail account and app password.
