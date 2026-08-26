import fs from 'node:fs';
import zlib from 'node:zlib';

const payloadUrl = new URL('./build-refactor-v2.mjs.gz.b64', import.meta.url);
const runtimeUrl = new URL('./.build-refactor-v2.runtime.mjs', import.meta.url);
const payload = fs.readFileSync(payloadUrl, 'utf8').trim();
const source = zlib.gunzipSync(Buffer.from(payload, 'base64'));

fs.writeFileSync(runtimeUrl, source);
try {
  await import(`${runtimeUrl.href}?build=${Date.now()}`);
} finally {
  fs.rmSync(runtimeUrl, { force: true });
}
