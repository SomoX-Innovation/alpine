import PDFDocument from "pdfkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import type { OrderDetail, OrderLineItem } from "@/app/actions/orders";

type PdfDoc = InstanceType<typeof PDFDocument>;

/** Logo placement in the header (must match `fit` in `drawInvoiceLogo`). */
const INVOICE_LOGO_FIT = { width: 220, height: 44 } as const;

/** Single white stroke around the logo fit box. */
const LOGO_BORDER_INSET = 5;

function drawLogoWhiteBorder(doc: PdfDoc, x: number, y: number, w: number, h: number): void {
  const inset = LOGO_BORDER_INSET;
  doc.save();
  doc.lineWidth(1).strokeColor("#FFFFFF");
  doc.rect(x - inset, y - inset, w + 2 * inset, h + 2 * inset).stroke();
  doc.restore();
}

/** Shown on every invoice for customer bank transfers. */
const INVOICE_BANK_DETAILS = {
  accountNumber: "0095240348",
  bankName: "Bank of Ceylon",
  branch: "Wariyapola Branch (379)",
  accountHolder: "MR B M K B SOMARATHNE",
} as const;

function money(n: number): string {
  return `Rs. ${Number(n || 0).toFixed(2)}`;
}

function safeStr(v: unknown): string {
  return String(v ?? "").trim();
}

function lineTotal(i: OrderLineItem): number {
  const unit = Number(i.price) || 0;
  const qty = Math.max(0, Math.floor(Number(i.quantity) || 0));
  return unit * qty;
}

function safeDate(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

/** Load remote product image for PDF (JPEG for reliable pdfkit embed). */
async function fetchLineItemImageForPdf(urlStr: string): Promise<Buffer | null> {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(urlStr, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const buf0 = Buffer.from(await res.arrayBuffer());
    if (buf0.length === 0) return null;
    return await sharp(buf0).rotate().resize(200, 200, { fit: "inside" }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return null;
  }
}

function drawCell(
  doc: PdfDoc,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  align: "left" | "right" | "center" | "justify" = "left",
  bold = false,
  textColor = "#E5E7EB",
  borderColor = "#2A2F3A"
) {
  const textY = y + Math.max(4, Math.floor((h - 11) / 2));
  doc
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(10)
    .fillColor(textColor)
    .text(text, x + 8, textY, { width: w - 16, align });
  doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(borderColor).stroke();
}

function drawLineImageCell(
  doc: PdfDoc,
  x: number,
  y: number,
  w: number,
  h: number,
  image: Buffer | null,
  borderColor: string,
  mutedColor: string
) {
  doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(borderColor).stroke();
  if (!image) {
    doc.font("Helvetica").fontSize(8).fillColor(mutedColor).text("—", x, y + Math.floor((h - 10) / 2), {
      width: w,
      align: "center",
    });
    return;
  }
  const pad = 4;
  try {
    doc.image(image, x + pad, y + pad, { fit: [w - 2 * pad, h - 2 * pad] });
  } catch {
    doc.font("Helvetica").fontSize(8).fillColor(mutedColor).text("—", x, y + Math.floor((h - 10) / 2), {
      width: w,
      align: "center",
    });
  }
}

/**
 * Logo for invoices: same file as the site (`public/logo.png`).
 * Node `pdfkit` embeds JPEG synchronously; we flatten transparency onto the header color so the white wordmark is visible.
 */
async function loadInvoiceLogoForPdf(): Promise<{ jpeg?: Buffer; filePath: string } | null> {
  const filePath = path.join(process.cwd(), "public", "logo.png");
  let raw: Buffer;
  try {
    raw = await readFile(filePath);
  } catch {
    return null;
  }
  const headerBg = "#121826";
  try {
    const jpeg = await sharp(raw).flatten({ background: headerBg }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    return { jpeg, filePath };
  } catch {
    return { filePath };
  }
}

function drawInvoiceLogo(doc: PdfDoc, logo: { jpeg?: Buffer; filePath: string } | null, x: number, y: number): boolean {
  if (!logo) return false;
  const fit = [INVOICE_LOGO_FIT.width, INVOICE_LOGO_FIT.height] as [number, number];
  if (logo.jpeg) {
    try {
      doc.image(logo.jpeg, x, y, { fit });
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    doc.image(logo.filePath, x, y, { fit });
    return true;
  } catch {
    return false;
  }
}

export async function generateInvoicePdfBuffer(order: OrderDetail): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const invoiceLogo = await loadInvoiceLogoForPdf();

  const pageW = doc.page.width;
  const contentW = 520;
  const left = (pageW - contentW) / 2;
  const c = {
    bg: "#0B0F19",
    panel: "#121826",
    panel2: "#1A2334",
    border: "#2A3448",
    text: "#E5E7EB",
    muted: "#9CA3AF",
    accent: "#38BDF8",
    totalBg: "#38BDF8",
    totalText: "#0B0F19",
  };

  // Page dark background
  doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(c.bg).fill();

  // Header — extra space below logo frame before the blue bar (logo bottom ≈ logoY + fit + LOGO_BORDER_INSET)
  const headerTop = 40;
  const headerBlueH = 18;
  const logoToBlueMargin = 14;
  const logoX = left + 14;
  const logoY = 50;
  const logoFrameBottom = logoY + INVOICE_LOGO_FIT.height + LOGO_BORDER_INSET;
  const headerBlueTop = logoFrameBottom + logoToBlueMargin;
  const headerPanelH = headerBlueTop - headerTop + headerBlueH;
  doc.rect(left, headerTop, contentW, headerPanelH).fillColor(c.panel).fill();
  doc.rect(left, headerBlueTop, contentW, headerBlueH).fillColor(c.accent).fill();
  const logoPlaced = drawInvoiceLogo(doc, invoiceLogo, logoX, logoY);
  if (logoPlaced) {
    drawLogoWhiteBorder(doc, logoX, logoY, INVOICE_LOGO_FIT.width, INVOICE_LOGO_FIT.height);
  }
  // Smaller than logo fit height; right-aligned in header.
  doc.font("Helvetica-Bold").fontSize(20).fillColor(c.accent).text("INVOICE", left, 68, {
    width: contentW - 15,
    align: "right",
  });

  // Customer + invoice meta — full-width justified blocks (doc.y advances when text wraps)
  const belowHeader = headerTop + headerPanelH + 15;
  const addr = order.shipping_address ?? { address: "", city: "", postalCode: "", country: "" };
  const infoTextW = contentW - 24;
  const infoX = left + 12;
  const infoPadTop = 10;
  const infoPanelH = 152;
  doc.rect(left, belowHeader, contentW, infoPanelH).fillColor(c.panel).fill();
  let cursorY = belowHeader + infoPadTop;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(c.text).text("Invoice to:", infoX, cursorY, {
    width: infoTextW,
    align: "justify",
  });
  cursorY = doc.y + 4;
  doc.font("Helvetica").fontSize(11).fillColor(c.muted);
  doc.text(safeStr(order.customer_name) || "-", infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 4;
  doc.text(safeStr(order.customer_email) || "-", infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 4;
  doc.text(safeStr(addr.address) || "-", infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 4;
  doc.text(`${safeStr(addr.city)} ${safeStr(addr.postalCode)}`.trim() || "-", infoX, cursorY, {
    width: infoTextW,
    align: "justify",
  });
  cursorY = doc.y + 4;
  doc.text(safeStr(addr.country) || "-", infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 8;

  doc.font("Helvetica").fontSize(10).fillColor(c.text);
  doc.text(`Invoice #: ${safeStr(order.order_number)}`, infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 4;
  doc.font("Helvetica").fontSize(10).fillColor(c.muted);
  doc.text(`Date: ${safeDate(order.created_at)}`, infoX, cursorY, { width: infoTextW, align: "justify" });
  cursorY = doc.y + 4;
  doc.font("Helvetica").fontSize(9).fillColor(c.muted);
  doc.text(`Order ID: ${safeStr(order.id)}`, infoX, cursorY, { width: infoTextW, align: "justify" });

  // Items table (width matches content area; includes product photo from line_items[].image when set)
  const tableX = left;
  let tableY = belowHeader + infoPanelH + 20;
  const rowHHeader = 30;
  const rowHBody = 46;
  const cols = { sl: 30, img: 52, desc: 200, price: 86, qty: 54, total: 98 };
  const tableW = cols.sl + cols.img + cols.desc + cols.price + cols.qty + cols.total;
  const xSl = tableX;
  const xImg = tableX + cols.sl;
  const xDesc = xImg + cols.img;
  const xPrice = xDesc + cols.desc;
  const xQty = xPrice + cols.price;
  const xTotal = xQty + cols.qty;

  doc.rect(tableX, tableY, tableW, rowHHeader).fillColor(c.panel2).fill();
  const headY = tableY + 7;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(c.text);
  doc.text("SL.", xSl + 4, headY, { width: cols.sl - 8, align: "center" });
  doc.text("Photo", xImg, headY, { width: cols.img, align: "center" });
  doc.text("Item Description", xDesc + 6, headY, {
    width: cols.desc - 12,
    align: "justify",
  });
  doc.text("Price", xPrice + 6, headY, { width: cols.price - 12, align: "right" });
  doc.text("Qty.", xQty + 4, headY, { width: cols.qty - 8, align: "center" });
  doc.text("Total", xTotal + 4, headY, { width: cols.total - 8, align: "right" });
  tableY += rowHHeader;

  let lineNo = 1;
  for (const item of order.line_items ?? []) {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty <= 0) continue;
    const unit = Number(item.price) || 0;
    const total = lineTotal(item);
    const details = [
      safeStr(item.name) || "Item",
      item.color ? `Color: ${safeStr(item.color)}` : "",
      safeStr(item.size) ? `Size: ${safeStr(item.size)}` : "",
      item.fit ? `Fit: ${safeStr(item.fit)}` : "",
    ]
      .filter(Boolean)
      .join("  ·  ");

    const imageUrl = item.image?.trim();
    const lineImage = imageUrl ? await fetchLineItemImageForPdf(imageUrl) : null;

    if (tableY > 640) {
      doc.addPage();
      tableY = 70;
    }

    const shade = lineNo % 2 === 0 ? "#111827" : "#0F172A";
    doc.rect(tableX, tableY, tableW, rowHBody).fillColor(shade).fill();
    drawCell(doc, xSl, tableY, cols.sl, rowHBody, String(lineNo), "center", false, c.text, c.border);
    drawLineImageCell(doc, xImg, tableY, cols.img, rowHBody, lineImage, c.border, c.muted);
    drawCell(doc, xDesc, tableY, cols.desc, rowHBody, details, "justify", false, c.text, c.border);
    drawCell(doc, xPrice, tableY, cols.price, rowHBody, money(unit), "right", false, c.text, c.border);
    drawCell(doc, xQty, tableY, cols.qty, rowHBody, String(qty), "center", false, c.text, c.border);
    drawCell(doc, xTotal, tableY, cols.total, rowHBody, money(total), "right", true, c.text, c.border);
    lineNo += 1;
    tableY += rowHBody;
  }

  // Totals
  const totalsX = left + 305;
  const totalsY = Math.max(tableY + 18, 560);
  doc.font("Helvetica").fontSize(11).fillColor(c.muted);
  doc.text("Sub Total:", totalsX, totalsY);
  doc.text(money(Number(order.subtotal) || 0), totalsX + 100, totalsY, { width: 115, align: "right" });
  doc.text("Shipping:", totalsX, totalsY + 22);
  doc.text(money(Number(order.shipping_cost) || 0), totalsX + 100, totalsY + 22, { width: 115, align: "right" });
  doc.rect(totalsX, totalsY + 50, 215, 32).fillColor(c.totalBg).fill();
  doc.font("Helvetica-Bold").fontSize(14).fillColor(c.totalText);
  doc.text("Total:", totalsX + 12, totalsY + 59);
  doc.text(money(Number(order.total) || 0), totalsX + 100, totalsY + 59, { width: 105, align: "right" });

  // Bank details (payments) — under totals on the right
  const bankBoxW = 215;
  const bankBoxH = 102;
  const bankTop = totalsY + 88;
  doc.rect(totalsX, bankTop, bankBoxW, bankBoxH).fillColor(c.panel2).fill();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(c.text)
    .text("Bank details (payments)", totalsX + 10, bankTop + 10, { width: bankBoxW - 20, align: "justify" });
  doc.font("Helvetica").fontSize(9).fillColor(c.muted);
  doc.text(`Account holder: ${INVOICE_BANK_DETAILS.accountHolder}`, totalsX + 10, bankTop + 28, {
    width: bankBoxW - 20,
    align: "justify",
  });
  doc.text(`Bank: ${INVOICE_BANK_DETAILS.bankName}`, totalsX + 10, bankTop + 42, {
    width: bankBoxW - 20,
    align: "justify",
  });
  doc.text(`Branch: ${INVOICE_BANK_DETAILS.branch}`, totalsX + 10, bankTop + 56, {
    width: bankBoxW - 20,
    align: "justify",
  });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(c.text);
  doc.text(`Account no.: ${INVOICE_BANK_DETAILS.accountNumber}`, totalsX + 10, bankTop + 72, {
    width: bankBoxW - 20,
    align: "justify",
  });

  // Footer
  doc.font("Helvetica-Bold").fontSize(13).fillColor(c.text).text("Thank you for your business", left, totalsY, {
    width: contentW,
    align: "justify",
  });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(c.text).text("Terms & Conditions", left, totalsY + 40, {
    width: contentW,
    align: "justify",
  });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(c.muted)
    .text("Goods once sold are subject to store policy. Please keep this invoice for future reference.", left, totalsY + 58, {
      width: contentW,
      align: "justify",
    });
  doc.font("Helvetica").fontSize(9).fillColor(c.muted).text("Generated automatically by Alpine order system.", left, 790, {
    width: contentW,
    align: "justify",
  });
  doc.font("Helvetica").fontSize(9).fillColor(c.muted).text("Authorised Sign", left + 410, 790, {
    width: 110,
    align: "justify",
  });

  doc.end();
  return await done;
}

