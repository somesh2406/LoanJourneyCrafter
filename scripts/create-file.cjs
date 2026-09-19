const fs = require('fs');
const path = require('path');

const targetPath = process.argv[2];
if (!targetPath) {
  console.error('Missing target path');
  process.exit(1);
}

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  const fullPath = path.resolve(process.cwd(), targetPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, data, 'utf8');
  console.log(`Wrote ${data.length} bytes to ${targetPath}`);
});