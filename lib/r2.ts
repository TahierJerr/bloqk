// Cloudflare R2 (S3-compatibel) voor de bestanden van klantwebsites.
// Vereist in .env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
// en R2_BUCKET. Optioneel R2_JURISDICTION (bijv. "eu") voor buckets die
// in een specifieke jurisdictie zijn aangemaakt.

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getR2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;

  // EU-jurisdictie krijgt een eigen endpoint: <account>.eu.r2...
  const jurisdiction = process.env.R2_JURISDICTION;
  const host = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${host}`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket };
}

/**
 * Maakt in R2 een "map" aan voor een domein (incl. TLD), bijv.
 * "mijn-salon.nl/". R2/S3 kent geen echte mappen, dus we zetten een
 * lege marker neer zodat de prefix bestaat en zichtbaar is.
 */
export async function createDomainFolder(domain: string) {
  const r2 = getR2();
  if (!r2) {
    console.warn(`R2 niet geconfigureerd; map voor "${domain}" niet aangemaakt`);
    return;
  }

  await r2.client.send(
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: `${domain}/.keep`,
      Body: "",
      ContentType: "text/plain",
    }),
  );
}
