import nodemailer from "nodemailer";

/** Mirrors order line items for email formatting (avoids circular import with orders action). */
type MailOrderLineItem = {
  name: string;
  size: string;
  quantity: number;
  price: number;
  fit?: string;
  color?: string;
};

type MailOrderPayload = {
  line_items: MailOrderLineItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

/**
 * Outgoing mail via Gmail (or any SMTP).
 *
 * Set in `.env.local`:
 *   GMAIL_USER=you@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Google Account → App passwords)
 *
 * Optional:
 *   MAIL_FROM="Alpine Store <you@gmail.com>"
 *   MAIL_ORDER_NOTIFY=you@example.com   (comma-separated) — new-order alert to you; defaults to GMAIL_USER/SMTP_USER
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *
 * For auth emails (signup, password reset), also configure Custom SMTP in
 * Supabase Dashboard → Authentication → SMTP Settings with the same Gmail creds.
 *
 * Order emails (customer confirmation + store alert) are sent by THIS app only.
 * Supabase SMTP does not send them — copy the same username/password into Vercel
 * as GMAIL_USER + GMAIL_APP_PASSWORD (or SMTP_USER + SMTP_PASS).
 */

function getSmtpAuth(): { user: string; pass: string } | null {
  const user =
    process.env.GMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "";
  const pass =
    process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ||
    process.env.SMTP_PASS?.trim() ||
    process.env.SMTP_PASSWORD?.trim() ||
    "";
  if (!user || !pass) return null;
  return { user, pass };
}

export function isMailConfigured(): boolean {
  return getSmtpAuth() !== null;
}

function createTransport() {
  const auth = getSmtpAuth();
  if (!auth) return null;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE === undefined
      ? port === 465
      : process.env.SMTP_SECURE === "true";

  // Throttle bursts (helps avoid Gmail "too many messages" during dev/testing).
  // Max N messages per `rateDelta` ms. Defaults: 2 per 2s. Set MAIL_RATE_LIMIT=0 to disable.
  const rawLimit = process.env.MAIL_RATE_LIMIT?.trim();
  const rateLimit =
    rawLimit === "0" || rawLimit === "false"
      ? undefined
      : Number(rawLimit || 2);
  const rateDelta = Number(process.env.MAIL_RATE_DELTA_MS || 2000);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    ...(rateLimit != null && !Number.isNaN(rateLimit) && rateLimit > 0
      ? { rateLimit, rateDelta }
      : {}),
  });
}

/** Gmail / SMTP often returns quota or rate strings in the message. */
export function isRateLimitOrQuotaError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("rate limit") ||
    m.includes("rate exceeded") ||
    m.includes("email rate limit") ||
    m.includes("too many") ||
    m.includes("quota") ||
    m.includes("sending quota") ||
    (m.includes("daily") && m.includes("limit")) ||
    m.includes("4.5.3") ||
    m.includes("454") ||
    m.includes("452") ||
    m.includes("421-4.7.0") ||
    m.includes("try again later")
  );
}

function isTransientSmtpError(message: string): boolean {
  const m = message.toLowerCase();
  if (isRateLimitOrQuotaError(message)) return false;
  return (
    m.includes("421") ||
    m.includes("timeout") ||
    m.includes("econnreset") ||
    m.includes("etimedout") ||
    m.includes("temporary failure") ||
    m.includes("try again")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Skip order confirmation emails (e.g. while Gmail quota resets). */
export function isOrderConfirmationEmailEnabled(): boolean {
  if (process.env.MAIL_ORDER_CONFIRMATION === "false") return false;
  if (process.env.MAIL_DISABLE_ORDER_EMAIL === "true") return false;
  return true;
}

/** Store owner / ops inbox for “new order placed” alerts. */
function getOrderNotifyRecipients(): string[] {
  const raw = process.env.MAIL_ORDER_NOTIFY?.trim();
  if (raw) {
    return [...new Set(raw.split(/[,;]/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
  }
  const u = process.env.GMAIL_USER?.trim() || process.env.SMTP_USER?.trim();
  return u ? [u.toLowerCase()] : [];
}

/** Set MAIL_STORE_ORDER_NOTIFY=false to skip store alert while still emailing the customer. */
export function isStoreOrderNotifyEnabled(): boolean {
  if (process.env.MAIL_STORE_ORDER_NOTIFY === "false") return false;
  if (process.env.MAIL_DISABLE_ORDER_EMAIL === "true") return false;
  return true;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<
  | { ok: true }
  | { ok: false; error: string; skipped?: boolean; rateLimited?: boolean }
> {
  const transport = createTransport();
  const auth = getSmtpAuth();
  if (!transport || !auth) {
    return { ok: false, error: "Mail not configured", skipped: true };
  }

  const from =
    process.env.MAIL_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    `Alpine <${auth.user}>`;

  const brandHtml = buildBrandedHtml({
    subject: options.subject,
    bodyHtml: options.html ?? options.text.replace(/\n/g, "<br />"),
  });
  const brandText = buildBrandedText(options.text);

  const maxAttempts = Number(process.env.MAIL_RETRY_ATTEMPTS || 3);
  let lastMessage = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await transport.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: brandText,
        html: brandHtml,
      });
      return { ok: true };
    } catch (e) {
      lastMessage = e instanceof Error ? e.message : String(e);
      const rateLimited = isRateLimitOrQuotaError(lastMessage);
      if (rateLimited) {
        console.error(
          "[mail] RATE_LIMIT / QUOTA — sending paused for this message.",
          "Gmail free accounts: ~500 recipients/day. Supabase SMTP also has limits.",
          "Set MAIL_ORDER_CONFIRMATION=false to stop order emails, or use Resend/SendGrid.",
          lastMessage
        );
        return { ok: false, error: lastMessage, rateLimited: true };
      }
      if (attempt < maxAttempts && isTransientSmtpError(lastMessage)) {
        const delayMs = Math.min(30_000, 2000 * 2 ** (attempt - 1));
        console.warn(
          `[mail] transient error (attempt ${attempt}/${maxAttempts}), retry in ${delayMs}ms:`,
          lastMessage
        );
        await sleep(delayMs);
        continue;
      }
      console.error("[mail] send failed:", lastMessage);
      return { ok: false, error: lastMessage };
    }
  }

  return { ok: false, error: lastMessage };
}

function buildBrandedHtml(params: { subject: string; bodyHtml: string }): string {
  const subject = escapeHtml(params.subject);
  const bodyHtml = params.bodyHtml;
  const logoUrl = getMailLogoUrl();
  const year = new Date().getFullYear();

  return `<div style="background:#f5f5f5;padding:24px 12px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;background:#ffffff">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Alpine" style="display:block;max-height:42px;width:auto" />` : `<div style="font-size:22px;font-weight:700;letter-spacing:0.4px">Alpine</div>`}
      </div>
      <div style="padding:24px">
        <h1 style="font-size:18px;line-height:1.3;margin:0 0 14px 0">${subject}</h1>
        <div style="font-size:14px;line-height:1.7;color:#111827">
          ${bodyHtml}
        </div>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #f3f4f6;background:#fafafa;font-size:12px;color:#6b7280">
        © ${year} Alpine. All rights reserved.
      </div>
    </div>
  </div>`;
}

function buildBrandedText(text: string): string {
  const footer = "\n\n—\nAlpine";
  return `${text}${footer}`;
}

function getMailLogoUrl(): string {
  const explicit = process.env.MAIL_LOGO_URL?.trim();
  if (explicit) return explicit;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (site) return `${site}/logo.png`;

  return "";
}

function formatLineItems(items: MailOrderLineItem[]): string {
  return items
    .map(
      (i) =>
        `  · ${i.name} — ${i.color ? `${i.color} · ` : ""}${i.size}${i.fit ? ` (${i.fit})` : ""} × ${i.quantity}  Rs.${(i.price * i.quantity).toFixed(2)}`
    )
    .join("\n");
}

function normalizeMailPayload(input: MailOrderPayload): MailOrderPayload {
  const line_items = input.line_items.map((i) => ({
    name: String(i.name ?? "").trim() || "Item",
    size: String(i.size ?? "").trim() || "—",
    quantity: Math.max(0, Math.floor(Number(i.quantity) || 0)),
    price: Math.max(0, Number(i.price) || 0),
    ...(i.fit ? { fit: String(i.fit).trim() } : {}),
    ...(i.color ? { color: String(i.color).trim() } : {}),
  }));
  return {
    line_items,
    subtotal: Number(input.subtotal) || 0,
    shipping_cost: Number(input.shipping_cost) || 0,
    total: Number(input.total) || 0,
    shipping_address: {
      address: String(input.shipping_address?.address ?? "").trim(),
      city: String(input.shipping_address?.city ?? "").trim(),
      postalCode: String(input.shipping_address?.postalCode ?? "").trim(),
      country: String(input.shipping_address?.country ?? "").trim(),
    },
  };
}

/**
 * Sends customer confirmation + store new-order alert in parallel.
 * Await this from createOrder so serverless runtimes finish before freezing (e.g. Vercel).
 * Does not throw — logs on failure.
 */
export async function sendOrderPlacementEmails(params: {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  input: MailOrderPayload;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.warn(
      "[mail] Order emails skipped: SMTP not set. Add GMAIL_USER + GMAIL_APP_PASSWORD (or SMTP_USER + SMTP_PASS / SMTP_PASSWORD) to .env.local and Vercel. Supabase Auth SMTP alone does not send order emails."
    );
    return;
  }

  const normalized = {
    ...params,
    input: normalizeMailPayload(params.input),
  };

  await Promise.all([
    sendOrderConfirmationEmail(normalized),
    sendStoreNewOrderNotification(normalized),
  ]);
}

/** Fire-and-forget friendly: does not throw. */
export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  input: MailOrderPayload;
}): Promise<void> {
  if (!isOrderConfirmationEmailEnabled()) {
    return;
  }

  const { orderNumber, customerEmail, customerName, input } = params;
  const lines = formatLineItems(input.line_items);
  const addr = input.shipping_address;

  const text = [
    `Hi ${customerName},`,
    ``,
    `Thanks for your order ${orderNumber}.`,
    ``,
    `Items:`,
    lines,
    ``,
    `Subtotal: Rs.${input.subtotal.toFixed(2)}`,
    `Shipping: Rs.${input.shipping_cost.toFixed(2)}`,
    `Total: Rs.${input.total.toFixed(2)}`,
    ``,
    `Ship to:`,
    `${addr.address}`,
    `${addr.postalCode} ${addr.city}`,
    `${addr.country}`,
    ``,
    `You can view this order in your account when logged in.`,
  ].join("\n");

  const result = await sendMail({
    to: customerEmail,
    subject: `Order confirmed — ${orderNumber}`,
    text,
    html: `<div style="font-family:system-ui,sans-serif;max-width:32rem">
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Thanks for your order <strong>${escapeHtml(orderNumber)}</strong>.</p>
      <h3 style="font-size:14px;margin:1rem 0 0.5rem">Items</h3>
      <ul style="margin:0;padding-left:1.25rem">
        ${input.line_items
          .map(
            (i) =>
              `<li>${escapeHtml(i.name)} — ${i.color ? `${escapeHtml(i.color)} · ` : ""}${escapeHtml(i.size)}${i.fit ? ` (${escapeHtml(i.fit)})` : ""} × ${i.quantity} — Rs.${(i.price * i.quantity).toFixed(2)}</li>`
          )
          .join("")}
      </ul>
      <p style="margin-top:1rem">Subtotal: Rs.${input.subtotal.toFixed(2)}<br/>
      Shipping: Rs.${input.shipping_cost.toFixed(2)}<br/>
      <strong>Total: Rs.${input.total.toFixed(2)}</strong></p>
      <h3 style="font-size:14px;margin:1rem 0 0.5rem">Ship to</h3>
      <p style="margin:0">${escapeHtml(addr.address)}<br/>
      ${escapeHtml(addr.postalCode)} ${escapeHtml(addr.city)}<br/>
      ${escapeHtml(addr.country)}</p>
    </div>`,
  });

  if (!result.ok && !("skipped" in result && result.skipped)) {
    if ("rateLimited" in result && result.rateLimited) {
      console.error(
        "[mail] order confirmation skipped (quota). Order still saved:",
        orderNumber
      );
    } else {
      console.error("[mail] order confirmation:", result.error);
    }
  }
}

/** Notify shop inbox when a customer places an order (fire-and-forget). */
export async function sendStoreNewOrderNotification(params: {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  input: MailOrderPayload;
}): Promise<void> {
  if (!isStoreOrderNotifyEnabled() || !isMailConfigured()) {
    return;
  }

  const recipients = getOrderNotifyRecipients();
  if (recipients.length === 0) {
    return;
  }

  const { orderNumber, orderId, customerEmail, customerName, input } = params;
  const lines = formatLineItems(input.line_items);
  const addr = input.shipping_address;

  const text = [
    `New order placed: ${orderNumber}`,
    ``,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    ``,
    `Items:`,
    lines,
    ``,
    `Subtotal: Rs.${input.subtotal.toFixed(2)}`,
    `Shipping: Rs.${input.shipping_cost.toFixed(2)}`,
    `Total: Rs.${input.total.toFixed(2)}`,
    ``,
    `Ship to:`,
    `${addr.address}`,
    `${addr.postalCode} ${addr.city}`,
    `${addr.country}`,
    ``,
    `Order ID: ${orderId}`,
  ].join("\n");

  const bodyHtml = `<p><strong>New order</strong> <strong>${escapeHtml(orderNumber)}</strong></p>
      <p>Customer: ${escapeHtml(customerName)}<br/>Email: ${escapeHtml(customerEmail)}</p>
      <h3 style="font-size:14px;margin:1rem 0 0.5rem">Items</h3>
      <ul style="margin:0;padding-left:1.25rem">
        ${input.line_items
          .map(
            (i) =>
              `<li>${escapeHtml(i.name)} — ${i.color ? `${escapeHtml(i.color)} · ` : ""}${escapeHtml(i.size)}${i.fit ? ` (${escapeHtml(i.fit)})` : ""} × ${i.quantity} — Rs.${(i.price * i.quantity).toFixed(2)}</li>`
          )
          .join("")}
      </ul>
      <p style="margin-top:1rem">Subtotal: Rs.${input.subtotal.toFixed(2)}<br/>
      Shipping: Rs.${input.shipping_cost.toFixed(2)}<br/>
      <strong>Total: Rs.${input.total.toFixed(2)}</strong></p>
      <h3 style="font-size:14px;margin:1rem 0 0.5rem">Ship to</h3>
      <p style="margin:0">${escapeHtml(addr.address)}<br/>
      ${escapeHtml(addr.postalCode)} ${escapeHtml(addr.city)}<br/>
      ${escapeHtml(addr.country)}</p>
      <p style="margin-top:1rem;font-size:12px;color:#6b7280">Order ID: ${escapeHtml(orderId)}</p>`;

  for (const to of recipients) {
    const result = await sendMail({
      to,
      subject: `New order — ${orderNumber}`,
      text,
      html: bodyHtml,
    });
    if (!result.ok && !("skipped" in result && result.skipped)) {
      if ("rateLimited" in result && result.rateLimited) {
        console.error("[mail] store order notify skipped (quota):", orderNumber);
      } else {
        console.error("[mail] store order notify:", to, result.error);
      }
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
