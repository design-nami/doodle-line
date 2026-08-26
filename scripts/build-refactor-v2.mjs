import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const payloadFiles = fs.readdirSync(scriptDir)
  .filter((name) => /^build-refactor-v2\.payload\.\d+$/.test(name))
  .sort();

if (payloadFiles.length !== 3) {
  throw new Error(`Expected three V2 payload parts, found ${payloadFiles.length}`);
}

const payload = payloadFiles
  .map((name) => fs.readFileSync(path.join(scriptDir, name), 'utf8').trim())
  .join('');
const source = zlib.gunzipSync(Buffer.from(payload, 'base64'));
const runtimePath = path.join(scriptDir, '.build-refactor-v2.runtime.mjs');

fs.writeFileSync(runtimePath, source);
try {
  await import(`${pathToFileURL(runtimePath).href}?build=${Date.now()}`);
} finally {
  fs.rmSync(runtimePath, { force: true });
}

// The review build must never register or reuse the production service worker.
const outputPath = 'index-v2.html';
const html = fs.readFileSync(outputPath, 'utf8');
if (html.includes('navigator.serviceWorker.register') || html.includes('doodle-line-offline-registration')) {
  throw new Error('Prototype still contains production service-worker registration code');
}

const reportPath = 'REFACTOR_REPORT.md';
const report = fs.readFileSync(reportPath, 'utf8');
const note = '- Production service-worker registration is absent from the confirmation build.\n';
if (!report.includes(note.trim())) {
  fs.writeFileSync(reportPath, `${report.trimEnd()}\n${note}`, 'utf8');
}
