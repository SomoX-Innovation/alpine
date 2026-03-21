# Email with Gmail

This app sends **order confirmation** emails through **Gmail’s SMTP** when you set credentials in `.env.local`.

## 1. App password (Google)

1. Open [Google Account](https://myaccount.google.com/) → **Security**.
2. Turn on **2-Step Verification** if it isn’t already.
3. Go to **App passwords** (search “App passwords” in account settings if needed).
4. Create a password for **Mail** (or “Other”) and copy the **16 characters**.

Use your full Gmail address and that password in `.env.local`:

```env
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

Do **not** commit `.env.local`. See `.env.example` for all variables.

## 2. Supabase auth emails (signup / password reset)

Supabase sends those messages itself. To send them **from Gmail** as well:

1. Supabase Dashboard → **Authentication** → **SMTP Settings**.
2. Enable **Custom SMTP**.
3. Typical Gmail settings:
   - **Host:** `smtp.gmail.com`
   - **Port:** `465`
   - **Use SSL:** enabled (or TLS on port `587` if you prefer STARTTLS)
   - **Username:** same as `GMAIL_USER`
   - **Password:** same app password as `GMAIL_APP_PASSWORD`
4. Set **Sender email** to the same Gmail address (or a verified alias if you use Google Workspace).

## 3. “Email rate limit exceeded” (Gmail / Supabase)

This usually means **too many messages in a short time** or **daily quota**.

### Gmail (this app + SMTP)

- Free Gmail is roughly **~500 recipients per day** per account (not per message; bulk counts fast).
- **Testing** (many checkout tests) burns quota quickly.
- **Mitigations:**
  1. Wait until the next day (UTC midnight often resets Gmail’s window).
  2. Temporarily **turn off order confirmation emails** so checkout still works:
     ```env
     MAIL_ORDER_CONFIRMATION=false
     ```
  3. **Slow down bursts** (default is already throttled ~2 messages / 2s). To change:
     ```env
     MAIL_RATE_LIMIT=1
     MAIL_RATE_DELTA_MS=3000
     ```
     Set `MAIL_RATE_LIMIT=0` to disable throttling.
  4. For production volume, use a **transactional provider** (Resend, SendGrid, Mailgun, Postmark) with SMTP or their API—much higher limits than personal Gmail.

### Supabase Auth (signup / reset password)

If the error appears when **signing up** or **resetting password**, the limit is on **Supabase’s SMTP / auth mail**, not only this repo.

- Supabase applies **per-project** auth email limits on free tiers; heavy testing hits them quickly.
- In the dashboard, check **Authentication → Rate Limits** and consider **Custom SMTP** with a provider that allows higher volume, or wait for the window to reset.

### Orders still save

Order creation **does not** depend on email. If mail fails with rate limit, the order is still stored; only the confirmation email is skipped.

## 4. Troubleshooting (other)

- **“Invalid login”** → App password wrong, or “Less secure app access” (use app passwords instead).
- **Nothing sends from the app** → Check server logs for `[mail]`; confirm env vars are set where the **Node server** runs (e.g. Vercel project settings).
- **Auth still from Supabase** → Custom SMTP in Supabase must be configured separately (step 2).
