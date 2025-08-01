const fs = require('fs');
const path = require('path');

// Read token files
const tokenFiles = {
  'primitives/mantine': JSON.parse(fs.readFileSync('./tokens/primitives/mantine.json', 'utf8')),
  'primitives/colors': JSON.parse(fs.readFileSync('./tokens/primitives/colors.json', 'utf8')),
  'semantic/light': JSON.parse(fs.readFileSync('./tokens/semantic/light.json', 'utf8')),
  'semantic/dark': JSON.parse(fs.readFileSync('./tokens/semantic/dark.json', 'utf8')),
};

// Check references
function checkReferences(tokens, fileName) {
  console.log(`\nChecking references in ${fileName}:`);
  
  function checkValue(path, value) {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      console.log(`  ${path}: ${value}`);
    }
  }
  
  function traverse(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (value && typeof value === 'object') {
        if (value.$value !== undefined) {
          checkValue(newPath, value.$value);
        } else {
          traverse(value, newPath);
        }
      }
    }
  }
  
  traverse(tokens);
}

// Check each file
Object.entries(tokenFiles).forEach(([fileName, tokens]) => {
  checkReferences(tokens, fileName);
});

// Load and check the studio export
console.log('\n\nChecking dist/tokens.studio.json:');
const studioTokens = JSON.parse(fs.readFileSync('./dist/tokens.studio.json', 'utf8'));

// Count resolved vs unresolved
let resolved = 0;
let unresolved = 0;

Object.entries(studioTokens).forEach(([key, token]) => {
  if (token.$value && typeof token.$value === 'string' && token.$value.startsWith('{')) {
    console.log(`Unresolved: ${key} = ${token.$value}`);
    unresolved++;
  } else {
    resolved++;
  }
});

console.log(`\nSummary: ${resolved} resolved, ${unresolved} unresolved`);