/** Matches Supabase `storage.createBucket` so service-role clients type-check. */
type CreateBucketOptions = {
  public: boolean;
  fileSizeLimit?: string | number | null;
  allowedMimeTypes?: string[] | null;
};

type InvoiceStorageClient = {
  storage: {
    getBucket: (id: string) => Promise<{ data: unknown; error: { message: string } | null }>;
    createBucket: (
      id: string,
      options?: CreateBucketOptions
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
};

const INVOICE_BUCKET = "invoices";

export async function ensureInvoiceBucket(client: InvoiceStorageClient): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await client.storage.getBucket(INVOICE_BUCKET);
  if (!existing.error) {
    return { ok: true };
  }

  const create = await client.storage.createBucket(INVOICE_BUCKET, {
    public: false,
    allowedMimeTypes: ["application/pdf"],
  });

  if (create.error) {
    return { ok: false, error: create.error.message };
  }
  return { ok: true };
}

export { INVOICE_BUCKET };
