const StyleDictionary = require('style-dictionary');
const fs = require('fs');

// Custom format to output Mantine CSS variables
StyleDictionary.registerFormat({
  name: 'css/mantine',
  formatter: function(dictionary) {
    const tokens = dictionary.allTokens;
    let css = '/**\n * Mantine CSS Variables\n * Generated from design tokens\n */\n\n:root {\n';
    
    // Sort tokens for consistent output
    const sortedTokens = tokens.sort((a, b) => a.name.localeCompare(b.name));
    
    sortedTokens.forEach(token => {
      if (token.path[0] === 'colors') {
        const colorName = token.path[1];
        const shade = token.path[2];
        css += `  --mantine-color-${colorName}-${shade}: ${token.value};\n`;
      } else if (token.path[0] === 'spacing') {
        const size = token.path[1];
        css += `  --mantine-spacing-${size}: ${token.value};\n`;
      } else if (token.path[0] === 'fontSize') {
        const size = token.path[1];
        css += `  --mantine-font-size-${size}: ${token.value};\n`;
      } else if (token.path[0] === 'lineHeight') {
        const size = token.path[1];
        css += `  --mantine-line-height-${size}: ${token.value};\n`;
      } else if (token.path[0] === 'radius') {
        const size = token.path[1];
        css += `  --mantine-radius-${size}: ${token.value};\n`;
      } else if (token.path[0] === 'headings') {
        const heading = token.path[1];
        const prop = token.path[2];
        if (prop === 'fontSize') {
          css += `  --mantine-${heading}-font-size: ${token.value};\n`;
        } else if (prop === 'lineHeight') {
          css += `  --mantine-${heading}-line-height: ${token.value};\n`;
        } else if (prop === 'fontWeight') {
          css += `  --mantine-${heading}-font-weight: ${token.value};\n`;
        }
      } else if (token.path[0] === 'typography') {
        if (token.path[1] === 'headingFontWeight') {
          css += `  --mantine-heading-font-weight: ${token.value};\n`;
        } else if (token.path[1] === 'lineHeight') {
          css += `  --mantine-line-height: ${token.value};\n`;
        }
      }
    });
    
    // Add spacing variables from separate file
    try {
      const spacing = JSON.parse(fs.readFileSync('./tokens/spacing.json', 'utf8'));
      Object.keys(spacing).forEach(key => {
        if (spacing[key].$value && !spacing[key].$value.includes('{')) {
          css += `  --mantine-spacing-${key}: ${spacing[key].$value};\n`;
        }
      });
    } catch (e) {
      console.log('Could not read spacing tokens');
    }
    
    // Add radius variables from separate file
    try {
      const radius = JSON.parse(fs.readFileSync('./tokens/radius.json', 'utf8'));
      Object.keys(radius).forEach(key => {
        if (radius[key].$value && !radius[key].$value.includes('{')) {
          css += `  --mantine-radius-${key}: ${radius[key].$value};\n`;
        }
      });
    } catch (e) {
      console.log('Could not read radius tokens');
    }
    
    // Add shadow variables from separate file
    try {
      const shadows = JSON.parse(fs.readFileSync('./tokens/shadows.json', 'utf8'));
      Object.keys(shadows).forEach(key => {
        const shadow = shadows[key];
        if (shadow.$value) {
          const shadowValue = Array.isArray(shadow.$value) 
            ? shadow.$value.map(s => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`).join(', ')
            : `${shadow.$value.offsetX} ${shadow.$value.offsetY} ${shadow.$value.blur} ${shadow.$value.spread} ${shadow.$value.color}`;
          css += `  --mantine-shadow-${key}: ${shadowValue};\n`;
        }
      });
    } catch (e) {
      console.log('Could not read shadow tokens');
    }
    
    css += '}\n';
    return css;
  }
});

const sd = StyleDictionary.extend({
  source: ['tokens/primitives/mantine.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'mantine-variables.css',
        format: 'css/mantine'
      }]
    }
  }
});

sd.buildAllPlatforms();