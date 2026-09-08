const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'node_modules', '@angular', 'cli', 'src', 'utilities', 'node-version.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  content = content.replace(/\^24\.15\.0/g, '^24.0.0');
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Patched Angular CLI node version check successfully.');
}

