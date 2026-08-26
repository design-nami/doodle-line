import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');
const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for (let i = 0; i < scripts.length; i += 1) {
  new vm.Script(scripts[i][1], { filename: `source-script-${i + 1}.js` });
}

fs.writeFileSync('index-v2.html', source, 'utf8');
fs.writeFileSync(
  'REFACTOR_REPORT.md',
  '# Doodle Line V2 prototype\n\nSource capture completed. Structural refactoring is in progress on the isolated prototype branch.\n',
  'utf8',
);

console.log(`Verified ${scripts.length} source script blocks and created the isolated prototype copy.`);
