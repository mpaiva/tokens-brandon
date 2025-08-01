const fs = require('fs');
const path = require('path');

// Helper function to read JSON file
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Helper function to resolve token references in a value
function resolveReference(value, allTokens) {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return value;
  }
  
  // Extract the reference path and convert slash to dot notation
  const refPath = value.slice(1, -1).replace(/\//g, '.');
  
  // Try to find the token in the flattened structure
  // First, try the exact path
  if (allTokens[refPath] && allTokens[refPath].$value) {
    return resolveReference(allTokens[refPath].$value, allTokens);
  }
  
  // Try with different path formats
  const pathVariations = [
    refPath,
    'primitives.' + refPath,
    'primitives.mantine.' + refPath,
    'primitives.colors.' + refPath,
    refPath.replace('colors.', 'primitives.colors.'),
    refPath.replace('mantine.', 'primitives.mantine.'),
    // Handle references from within primitives/colors to other colors
    'primitives.colors.' + refPath.replace('blue.', 'blue.').replace('red.', 'red.').replace('gray.', 'gray.')
  ];
  
  for (const path of pathVariations) {
    if (allTokens[path] && allTokens[path].$value) {
      return resolveReference(allTokens[path].$value, allTokens);
    }
  }
  
  // If not found, log the issue
  console.warn(`Unable to resolve reference: ${refPath}`);
  return value;
}

// Helper function to flatten nested token structure
function flattenTokens(obj, prefix = '', allTokens = null) {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !value.$value && !value.$type) {
      // Recurse into nested objects
      Object.assign(result, flattenTokens(value, newKey, allTokens));
    } else if (value && value.$value !== undefined) {
      // It's a token, add it to result
      const token = {
        ...value,
        $value: allTokens ? resolveReference(value.$value, allTokens) : value.$value
      };
      result[newKey] = token;
    }
  }
  
  return result;
}

// Main function to prepare tokens for Figma import
function prepareTokensForFigma() {
  console.log('Preparing tokens for Tokens Studio import...');
  
  // Read all token files
  const tokenFiles = {
    // Primitives
    'primitives/colors': readJSON('./tokens/primitives/colors.json'),
    'primitives/mantine': readJSON('./tokens/primitives/mantine.json'),
    
    // Semantic
    'semantic/light': readJSON('./tokens/semantic/light.json'),
    'semantic/dark': readJSON('./tokens/semantic/dark.json'),
    
    // Other token types
    'typography': readJSON('./tokens/typography.json'),
    'borders': readJSON('./tokens/borders.json'),
    'padding': readJSON('./tokens/padding.json'),
    'spacing': readJSON('./tokens/spacing.json'),
    'radius': readJSON('./tokens/radius.json'),
    'shadows': readJSON('./tokens/shadows.json')
  };
  
  // First pass: flatten all tokens without resolving references
  const flattenedTokens = {};
  
  Object.entries({
    'primitives.mantine': tokenFiles['primitives/mantine'],
    'primitives.colors': tokenFiles['primitives/colors'],
    'semantic.light': tokenFiles['semantic/light'],
    'semantic.dark': tokenFiles['semantic/dark'],
    'typography': tokenFiles['typography'],
    'borders': tokenFiles['borders'],
    'padding': tokenFiles['padding'],
    'spacing': tokenFiles['spacing'],
    'radius': tokenFiles['radius'],
    'shadows': tokenFiles['shadows']
  }).forEach(([setName, tokens]) => {
    Object.assign(flattenedTokens, flattenTokens(tokens, setName));
  });
  
  // Second pass: resolve all references
  const resolvedTokens = {};
  
  for (const [key, token] of Object.entries(flattenedTokens)) {
    resolvedTokens[key] = {
      ...token,
      $value: resolveReference(token.$value, flattenedTokens)
    };
  }
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  
  // Write the single file for Tokens Studio import
  const outputPath = './dist/tokens.studio.json';
  fs.writeFileSync(outputPath, JSON.stringify(resolvedTokens, null, 2));
  
  console.log(`✔ Generated ${outputPath}`);
}

// Run the script
prepareTokensForFigma();