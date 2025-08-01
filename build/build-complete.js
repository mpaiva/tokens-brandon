const fs = require('fs');
const path = require('path');

// Read the mantine primitives
const mantineTokens = JSON.parse(fs.readFileSync('./tokens/primitives/mantine.json', 'utf8'));

let css = `/**
 * Mantine CSS Variables
 * Generated from design tokens
 */

:root {
`;

// Process color tokens
if (mantineTokens.colors) {
  Object.keys(mantineTokens.colors).forEach(colorName => {
    const colorScale = mantineTokens.colors[colorName];
    if (typeof colorScale === 'object' && colorScale.$value) {
      // Single color (white/black)
      css += `  --mantine-color-${colorName}: ${colorScale.$value};\n`;
    } else {
      // Color scale (0-9)
      Object.keys(colorScale).forEach(shade => {
        const color = colorScale[shade];
        if (color.$value) {
          css += `  --mantine-color-${colorName}-${shade}: ${color.$value};\n`;
        }
      });
    }
  });
}

// Process spacing tokens
if (mantineTokens.spacing) {
  Object.keys(mantineTokens.spacing).forEach(size => {
    const spacing = mantineTokens.spacing[size];
    if (spacing.$value) {
      css += `  --mantine-spacing-${size}: ${spacing.$value};\n`;
    }
  });
}

// Add additional spacing from separate file
try {
  const spacing = JSON.parse(fs.readFileSync('./tokens/spacing.json', 'utf8'));
  Object.keys(spacing).forEach(key => {
    if (spacing[key].$value && !spacing[key].$value.includes('{')) {
      css += `  --mantine-spacing-${key}: ${spacing[key].$value};\n`;
    }
  });
} catch (e) {}

// Process font size tokens
if (mantineTokens.fontSize) {
  Object.keys(mantineTokens.fontSize).forEach(size => {
    const fontSize = mantineTokens.fontSize[size];
    if (fontSize.$value) {
      css += `  --mantine-font-size-${size}: ${fontSize.$value};\n`;
    }
  });
}

// Process line height tokens
if (mantineTokens.lineHeight) {
  Object.keys(mantineTokens.lineHeight).forEach(size => {
    const lineHeight = mantineTokens.lineHeight[size];
    if (lineHeight.$value) {
      css += `  --mantine-line-height-${size}: ${lineHeight.$value};\n`;
    }
  });
}

// Process radius tokens
if (mantineTokens.radius) {
  Object.keys(mantineTokens.radius).forEach(size => {
    const radius = mantineTokens.radius[size];
    if (radius.$value) {
      css += `  --mantine-radius-${size}: ${radius.$value};\n`;
    }
  });
}

// Add additional radius from separate file
try {
  const radius = JSON.parse(fs.readFileSync('./tokens/radius.json', 'utf8'));
  Object.keys(radius).forEach(key => {
    if (radius[key].$value && !radius[key].$value.includes('{')) {
      css += `  --mantine-radius-${key}: ${radius[key].$value};\n`;
    }
  });
} catch (e) {}

// Process heading tokens
if (mantineTokens.headings) {
  Object.keys(mantineTokens.headings).forEach(heading => {
    const headingTokens = mantineTokens.headings[heading];
    if (headingTokens.fontSize && headingTokens.fontSize.$value) {
      css += `  --mantine-${heading}-font-size: ${headingTokens.fontSize.$value};\n`;
    }
    if (headingTokens.lineHeight && headingTokens.lineHeight.$value) {
      css += `  --mantine-${heading}-line-height: ${headingTokens.lineHeight.$value};\n`;
    }
    if (headingTokens.fontWeight && headingTokens.fontWeight.$value) {
      css += `  --mantine-${heading}-font-weight: ${headingTokens.fontWeight.$value};\n`;
    }
  });
}

// Process typography tokens
if (mantineTokens.typography) {
  if (mantineTokens.typography.headingFontWeight && mantineTokens.typography.headingFontWeight.$value) {
    css += `  --mantine-heading-font-weight: ${mantineTokens.typography.headingFontWeight.$value};\n`;
  }
  if (mantineTokens.typography.lineHeight && mantineTokens.typography.lineHeight.$value) {
    css += `  --mantine-line-height: ${mantineTokens.typography.lineHeight.$value};\n`;
  }
}

// Process shadow tokens from separate file
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
} catch (e) {}

css += `}\n`;

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

// Write the CSS file
fs.writeFileSync('./dist/mantine-variables.css', css);
console.log('✔ Generated dist/mantine-variables.css');