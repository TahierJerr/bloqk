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
  const endpoint = `https://${host}`;

  client ??= new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket, endpoint, jurisdiction: jurisdiction || "(geen)" };
}

/**
 * Maakt in R2 een "map" aan voor een domein (incl. TLD), bijv.
 * "mijn-salon.nl/". R2/S3 kent geen echte mappen, dus we zetten een
 * lege marker neer zodat de prefix bestaat en zichtbaar is.
 *
 * Niet-fataal: faalt dit (bijv. token zonder schrijfrechten), dan
 * loggen we de actieve config (zonder secrets) zodat duidelijk is
 * welke endpoint/bucket/jurisdictie er gebruikt werd.
 */
export async function createDomainFolder(domain: string) {
  const r2 = getR2();
  if (!r2) {
    console.warn(`R2 niet geconfigureerd; map voor "${domain}" niet aangemaakt`);
    return;
  }

  try {
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: `${domain}/.keep`,
        // Lege marker; expliciete lengte voorkomt de SDK-waarschuwing
        // over een stream van onbekende lengte
        Body: new Uint8Array(0),
        ContentLength: 0,
        ContentType: "text/plain",
      }),
    );
  } catch (error) {
    const code = (error as { Code?: string }).Code ?? "onbekend";
    console.error(
      `R2-map voor "${domain}" mislukt (${code}). Actieve config: ` +
        `endpoint=${r2.endpoint} bucket=${r2.bucket} jurisdictie=${r2.jurisdiction}. ` +
        `AccessDenied => token mist 'Object Read & Write' of is niet aan deze bucket/jurisdictie gekoppeld.`,
    );
    throw error;
  }
}
