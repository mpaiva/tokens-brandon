const StyleDictionary = require('style-dictionary');

// Custom transform to generate Mantine CSS variable names
StyleDictionary.registerTransform({
  name: 'name/mantine',
  type: 'name',
  transformer: function(token) {
    const path = token.path.slice();
    
    // Skip primitives/mantine prefix
    if (path[0] === 'primitives' && path[1] === 'mantine') {
      path.splice(0, 2);
      
      // Handle color tokens
      if (path[0] === 'colors') {
        const colorName = path[1];
        const shade = path[2];
        return `--mantine-color-${colorName}-${shade}`;
      }
      
      // Handle spacing tokens
      if (path[0] === 'spacing') {
        return `--mantine-spacing-${path[1]}`;
      }
      
      // Handle font size tokens
      if (path[0] === 'fontSize') {
        return `--mantine-font-size-${path[1]}`;
      }
      
      // Handle line height tokens
      if (path[0] === 'lineHeight') {
        return `--mantine-line-height-${path[1]}`;
      }
      
      // Handle radius tokens
      if (path[0] === 'radius') {
        return `--mantine-radius-${path[1]}`;
      }
      
      // Handle heading tokens
      if (path[0] === 'headings') {
        const heading = path[1];
        const prop = path[2];
        if (prop === 'fontSize') {
          return `--mantine-${heading}-font-size`;
        }
        if (prop === 'lineHeight') {
          return `--mantine-${heading}-line-height`;
        }
        if (prop === 'fontWeight') {
          return `--mantine-${heading}-font-weight`;
        }
      }
      
      // Handle typography tokens
      if (path[0] === 'typography') {
        if (path[1] === 'headingFontWeight') {
          return '--mantine-heading-font-weight';
        }
        if (path[1] === 'lineHeight') {
          return '--mantine-line-height';
        }
      }
      
      // Handle primary color tokens
      if (path[0] === 'primaryColors') {
        const variant = path[1];
        if (variant === 'filled') return '--mantine-primary-color-filled';
        if (variant === 'filledHover') return '--mantine-primary-color-filled-hover';
        if (variant === 'light') return '--mantine-primary-color-light';
        if (variant === 'lightHover') return '--mantine-primary-color-light-hover';
        if (variant === 'lightColor') return '--mantine-primary-color-light-color';
      }
    }
    
    // Skip non-Mantine tokens
    if (path[0] === 'primitives' && path[1] === 'colors') {
      return null;
    }
    
    if (path[0] === 'semantic' || path[0] === 'themes') {
      return null;
    }
    
    // Handle root level tokens
    if (path[0] === 'spacing') {
      return `--mantine-spacing-${path[1]}`;
    }
    
    if (path[0] === 'radius') {
      return `--mantine-radius-${path[1]}`;
    }
    
    if (path[0] === 'shadows') {
      return `--mantine-shadow-${path[1]}`;
    }
    
    // Default: don't output
    return null;
  }
});

// Custom filter to only output Mantine variables
StyleDictionary.registerFilter({
  name: 'isMantineVariable',
  matcher: function(token) {
    const path = token.path;
    
    // Include mantine primitives
    if (path[0] === 'primitives' && path[1] === 'mantine') {
      return true;
    }
    
    // Include root level design tokens that map to Mantine
    if (['spacing', 'radius', 'shadows'].includes(path[0])) {
      return true;
    }
    
    return false;
  }
});

// Custom format for shadows
StyleDictionary.registerTransform({
  name: 'shadow/css',
  type: 'value',
  matcher: function(token) {
    return token.type === 'shadow';
  },
  transformer: function(token) {
    const shadows = Array.isArray(token.value) ? token.value : [token.value];
    return shadows.map(shadow => {
      return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
    }).join(', ');
  }
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'mantine-variables.css',
        format: 'css/variables',
        filter: 'isMantineVariable',
        options: {
          selector: ':root',
          outputReferences: false
        }
      }],
      transforms: [
        'attribute/cti',
        'name/mantine',
        'time/seconds',
        'content/icon',
        'size/rem',
        'color/css',
        'shadow/css'
      ]
    }
  }
};