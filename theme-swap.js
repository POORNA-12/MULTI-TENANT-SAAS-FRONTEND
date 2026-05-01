const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src/pages'),
  path.join(__dirname, 'src/components'),
  path.join(__dirname, 'src/layouts')
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace specific tailwind blue classes with orange
      const original = content;
      content = content.replace(/text-blue-/g, 'text-orange-');
      content = content.replace(/bg-blue-/g, 'bg-orange-');
      content = content.replace(/border-blue-/g, 'border-orange-');
      content = content.replace(/ring-blue-/g, 'ring-orange-');
      content = content.replace(/shadow-blue-/g, 'shadow-orange-');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Theme swap from blue to orange complete.');
