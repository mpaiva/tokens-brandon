const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['tokens/primitives/mantine.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'mantine-variables.css',
        format: 'css/variables',
        options: {
          selector: ':root'
        }
      }],
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'time/seconds',
        'content/icon',
        'size/rem',
        'color/css'
      ]
    }
  }
};