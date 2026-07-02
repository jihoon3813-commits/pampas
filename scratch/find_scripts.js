import fs from 'fs';

const html = fs.readFileSync('dist/admin.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
console.log("Searching for script tags in dist/admin.html:");
while ((match = regex.exec(html)) !== null) {
  console.log("MATCH FOUND:", match[0]);
}

console.log("\nSearching for any JS or admin references in dist/admin.html:");
const lines = html.split('\n');
lines.forEach((line, i) => {
  if (line.includes('admin') || line.includes('js') || line.includes('script')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});
