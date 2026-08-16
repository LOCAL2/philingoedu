const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const exceptions = ['ImageUpload', 'LoadingSpinner', 'Modal', 'MultiImageUpload', 'RichTextEditor', 'SearchBar'];

walkDir('artifacts/admin/src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content.replace(/from\s+['"]@\/components\/ui\/([A-Za-z0-9_]+)['"]/g, (match, componentName) => {
      if (!exceptions.includes(componentName)) {
        return `from '@/components/ui/${componentName.toLowerCase()}'`;
      }
      return match;
    });
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Fixed:', filePath);
    }
  }
});
