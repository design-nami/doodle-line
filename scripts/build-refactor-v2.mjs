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

// A confirmation build must never register the production service worker.
// Otherwise opening index-v2.html on the live origin could replace the cached
// production index with the prototype while the device is offline.
const outputPath = 'index-v2.html';
let html = fs.readFileSync(outputPath, 'utf8');
const registration = /<script id="doodle-line-offline-registration">[\s\S]*?<\/script>\s*/g;
const matches = html.match(registration) || [];
if (matches.length !== 1) {
  throw new Error(`Expected one production service-worker registration block, found ${matches.length}`);
}
html = html.replace(registration, '');
if (html.includes('navigator.serviceWorker.register')) {
  throw new Error('Prototype still contains service-worker registration code');
}
fs.writeFileSync(outputPath, html, 'utf8');

const reportPath = 'REFACTOR_REPORT.md';
const report = fs.readFileSync(reportPath, 'utf8');
const note = '- Production service-worker registration removed from the confirmation build.\n';
if (!report.includes(note.trim())) {
  fs.writeFileSync(reportPath, `${report.trimEnd()}\n${note}`, 'utf8');
}
