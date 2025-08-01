const fs = require('fs');
const path = require('path');

// Helper function to resolve token references
function resolveTokenValue(value, tokens, visited = new Set()) {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return value;
  }

  const reference = value.slice(1, -1);
  if (visited.has(reference)) {
    console.warn(`Circular reference detected: ${reference}`);
    return value;
  }

  visited.add(reference);
  
  // Try to resolve the reference with different possible paths
  const possiblePaths = [
    reference, // Try as-is first
    `mantine.colors.${reference}`, // Try mantine colors
    `primitives.colors.${reference}`, // Try primitives colors
    `colors.${reference}`, // Try colors directly
    `semantic.${reference}`, // Try semantic tokens
    `mantine.${reference}`, // Try mantine root
    `primitives.${reference}` // Try primitives root
  ];

  for (const path of possiblePaths) {
    const parts = path.split('.');
    let current = tokens;
    let found = true;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !current.hasOwnProperty(part)) {
        found = false;
        break;
      }
      current = current[part];
    }

    if (found && current && current.$value !== undefined) {
      return resolveTokenValue(current.$value, tokens, visited);
    }
  }

  console.warn(`Unable to resolve reference: ${reference}`);
  return value;
}

// Load all token files
const tokenFiles = {
  mantine: JSON.parse(fs.readFileSync('./tokens/primitives/mantine.json', 'utf8')),
  primitives: {
    colors: JSON.parse(fs.readFileSync('./tokens/primitives/colors.json', 'utf8'))
  },
  semantic: {
    light: JSON.parse(fs.readFileSync('./tokens/semantic/light.json', 'utf8')),
    dark: JSON.parse(fs.readFileSync('./tokens/semantic/dark.json', 'utf8')),
    colors: JSON.parse(fs.readFileSync('./tokens/semantic/colors.json', 'utf8'))
  },
  typography: JSON.parse(fs.readFileSync('./tokens/typography.json', 'utf8')),
  borders: JSON.parse(fs.readFileSync('./tokens/borders.json', 'utf8')),
  padding: JSON.parse(fs.readFileSync('./tokens/padding.json', 'utf8'))
};

// Check if a token is a color token
function isColorToken(key, value) {
  // Check by token type
  if (value && value.$type === 'color') {
    return true;
  }
  
  // Check by key patterns for semantic tokens
  if (key.startsWith('text.') || 
      key.startsWith('background.') || 
      key.startsWith('border.') ||
      key.includes('colors.') ||
      key.includes('color.')) {
    return true;
  }
  
  return false;
}

// Function to extract ClearCo-specific tokens
function extractClearCoTokens(tokens, theme, allTokens) {
  const colorTokens = {};
  const nonColorTokens = {};
  
  // Helper to process tokens recursively
  function processTokens(obj, prefix = '', targetObject = null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !value.$type && !value.$value) {
        processTokens(value, prefix ? `${prefix}.${key}` : key, targetObject);
      } else if (value && value.$value !== undefined) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (shouldIncludeToken(fullKey, value)) {
          const resolvedToken = {
            $type: value.$type,
            $value: resolveTokenValue(value.$value, allTokens),
            ...(value.$description && { $description: value.$description })
          };
          
          // Determine if this is a color token
          if (targetObject) {
            targetObject[fullKey] = resolvedToken;
          } else if (isColorToken(fullKey, value)) {
            colorTokens[fullKey] = resolvedToken;
          } else {
            nonColorTokens[fullKey] = resolvedToken;
          }
        }
      }
    }
  }

  // Process theme-specific semantic tokens (these are all colors)
  processTokens(theme, '', colorTokens);
  
  // Process color primitives
  processTokens(tokens.primitives.colors, 'colors', colorTokens);
  
  // Process non-color tokens
  processTokens(tokens.typography, '', nonColorTokens);
  processTokens(tokens.borders, '', nonColorTokens);
  processTokens(tokens.padding, '', nonColorTokens);
  
  return { colorTokens, nonColorTokens };
}

// Determine if a token should be included in ClearCo output
function shouldIncludeToken(key, value) {
  // Include custom opacity variants
  if (key.includes('.light-') || key.includes('.dark-')) {
    return true;
  }
  
  // Include all semantic tokens
  if (key.startsWith('text.') || key.startsWith('background.') || key.startsWith('border.')) {
    return true;
  }
  
  // Include typography tokens
  if (key.startsWith('fontFamilies.') || key.startsWith('fontWeights.')) {
    return true;
  }
  
  // Include border widths
  if (key.startsWith('width.')) {
    return true;
  }
  
  // Include padding
  if (key.match(/^(3xs|xxs|xs|sm|md|lg|xl)$/)) {
    return true;
  }
  
  // Exclude references to Mantine tokens (these are just aliases)
  if (value.$value && typeof value.$value === 'string' && value.$value.includes('{mantine.')) {
    return false;
  }
  
  return false;
}

// Generate CSS for tokens grouped by type
function generateTokenCSS(tokens, indent = '  ', isColorSection = false) {
  let css = '';
  
  // Group tokens by their type/category
  const groups = {};
  const tokenEntries = Object.entries(tokens);
  
  for (const [key, value] of tokenEntries) {
    if (value.$value) {
      // Determine the group based on the key
      let group;
      if (key.startsWith('text.')) {
        group = 'text';
      } else if (key.startsWith('background.')) {
        group = 'background';
      } else if (key.startsWith('border.')) {
        group = 'border';
      } else if (key.startsWith('colors.')) {
        group = 'colors';
      } else if (key.startsWith('fontFamilies.')) {
        group = 'typography';
      } else if (key.startsWith('fontWeights.')) {
        group = 'typography';
      } else if (key.startsWith('width.')) {
        group = 'borders';
      } else if (key.match(/^(3xs|xxs|xs|sm|md|lg|xl)$/)) {
        group = 'spacing';
      } else {
        group = 'other';
      }
      
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push([key, value]);
    }
  }
  
  // Define the order of groups
  const groupOrder = isColorSection 
    ? ['text', 'background', 'border', 'colors']
    : ['typography', 'spacing', 'borders', 'other'];
  
  // Add section labels
  const sectionLabels = {
    'typography': 'Typography',
    'spacing': 'Spacing',
    'borders': 'Borders',
    'text': 'Text colors',
    'background': 'Background colors',
    'border': 'Border colors',
    'colors': 'Color primitives',
    'other': 'Other'
  };
  
  // Generate CSS for each group
  for (const group of groupOrder) {
    if (groups[group] && groups[group].length > 0) {
      // Add section comment
      if (sectionLabels[group]) {
        css += `\n${indent}/* ${sectionLabels[group]} */\n`;
      }
      
      // Sort tokens within each group
      groups[group].sort(([a], [b]) => a.localeCompare(b));
      
      // Generate CSS for tokens in this group
      for (const [key, value] of groups[group]) {
        const cssVarName = `--clearco-${key.replace(/\./g, '-')}`;
        css += `${indent}${cssVarName}: ${value.$value};`;
        
        if (value.$description) {
          css += ` /* ${value.$description} */`;
        }
        css += '\n';
      }
    }
  }
  
  return css;
}

// Merge tokens for all themes
const allTokens = {
  mantine: tokenFiles.mantine,
  primitives: tokenFiles.primitives,
  semantic: tokenFiles.semantic,
  colors: tokenFiles.primitives.colors,
  typography: tokenFiles.typography,
  borders: tokenFiles.borders,
  padding: tokenFiles.padding,
  // Add semantic colors at root level for easier resolution
  ...tokenFiles.semantic.colors
};

// Extract tokens for each theme
const lightTokens = extractClearCoTokens(tokenFiles, tokenFiles.semantic.light, {
  ...allTokens,
  semantic: tokenFiles.semantic.light
});

const darkTokens = extractClearCoTokens(tokenFiles, tokenFiles.semantic.dark, {
  ...allTokens,
  semantic: tokenFiles.semantic.dark
});

// Generate JSON output with better structure
const jsonOutput = {
  shared: {},
  themes: {
    light: {},
    dark: {}
  }
};

// Process shared non-color tokens
for (const [key, value] of Object.entries(lightTokens.nonColorTokens)) {
  const parts = key.split('.');
  let current = jsonOutput.shared;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

// Process light color tokens
for (const [key, value] of Object.entries(lightTokens.colorTokens)) {
  const parts = key.split('.');
  let current = jsonOutput.themes.light;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

// Process dark color tokens
for (const [key, value] of Object.entries(darkTokens.colorTokens)) {
  const parts = key.split('.');
  let current = jsonOutput.themes.dark;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

// Generate CSS output
let css = `/**
 * ClearCo Design Tokens
 * Custom tokens for the ClearCo design system
 * Supports light and dark modes
 */

/* Base tokens and light mode colors (default) */
:root {
`;

// Add non-color tokens first
css += generateTokenCSS(lightTokens.nonColorTokens, '  ', false);

// Add light mode colors
if (Object.keys(lightTokens.colorTokens).length > 0) {
  css += generateTokenCSS(lightTokens.colorTokens, '  ', true);
}

css += '}\n\n/* Dark mode (colors only) */\n';
css += '[data-mantine-color-scheme="dark"] {\n';
css += generateTokenCSS(darkTokens.colorTokens, '  ', true);
css += '}\n';

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Write outputs
fs.writeFileSync('./dist/clearco-tokens.json', JSON.stringify(jsonOutput, null, 2));
fs.writeFileSync('./dist/clearco-tokens.css', css);

console.log('✔ Generated dist/clearco-tokens.json');
console.log('✔ Generated dist/clearco-tokens.css');