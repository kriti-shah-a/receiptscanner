import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !bucket || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) throw new Error("Cloudflare R2 is not configured");
  return { bucket, client: new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } }) };
}
export async function uploadReceipt(body: Uint8Array, contentType: string) {
  const { client, bucket } = config();
  const key = `receipts/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.jpg`;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  return key;
}
export async function getReceiptImage(key: string) { const { client, bucket } = config(); return client.send(new GetObjectCommand({ Bucket: bucket, Key: key })); }
export async function deleteReceiptImage(key: string) { const { client, bucket } = config(); await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })); }
