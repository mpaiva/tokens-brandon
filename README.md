# tokens-brandon

Design tokens for Mantine-based design system, exported from Tokens Studio and built with custom build scripts.

## Project Structure

```
tokens/
├── primitives/         # Base token values
│   ├── colors.json    # Color primitives referencing Mantine colors
│   └── mantine.json   # All Mantine base values
├── semantic/          # Semantic token mappings
│   ├── light.json     # Light theme semantic colors
│   └── dark.json      # Dark theme semantic colors
├── typography.json    # Font families, weights, sizes
├── borders.json       # Border width tokens
├── padding.json       # Padding size tokens
├── spacing.json       # Spacing scale tokens
├── radius.json        # Border radius tokens
└── shadows.json       # Box shadow tokens

dist/
├── mantine-variables.css  # Mantine CSS variables
├── clearco-tokens.css     # ClearCo tokens with light/dark themes
└── clearco-tokens.json    # ClearCo tokens in JSON format

build/
├── build-complete.js      # Builds Mantine CSS variables
├── build-clearco.js       # Builds ClearCo tokens
└── prepare-figma-import.js # Prepares tokens for Figma import
```

## Building Tokens

```bash
# Install dependencies
npm install

# Build all tokens
npm run build:all

# Build only Mantine variables
npm run build

# Build only ClearCo tokens
npm run build:clearco

# Watch for changes
npm run watch

# Clean build output
npm run clean
```

## Importing Tokens into Figma with Tokens Studio

The tokens can be imported back into Figma using the Tokens Studio plugin:

1. Open Tokens Studio plugin in Figma
2. Go to Settings → Import
3. Choose "Import JSON" 
4. Select `dist/tokens.studio.json`
5. All tokens will be imported with dot-notation keys (e.g., `primitives.colors.blue.5`)

### Generating the Import File

The import file is automatically generated when you run any build command:

```bash
# Any of these commands will generate tokens.studio.json
npm run build:all
npm run build:clearco
node build/prepare-figma-import.js
```

This creates `dist/tokens.studio.json` with all tokens in a single flat structure, making it easy to import everything at once into Tokens Studio.

### Syncing Changes Back

After making changes in Figma:
1. Export from Tokens Studio
2. Replace the corresponding files in the `tokens/` directory
3. Run `npm run build:all` to regenerate CSS/JSON outputs

## Token Organization

### Mantine Tokens
All Mantine UI framework variables are preserved in `primitives/mantine.json` and built to `dist/mantine-variables.css`.

### ClearCo Tokens
Custom design tokens are organized by type:
- **Shared tokens**: Typography, spacing, borders (same in all themes)
- **Theme-specific tokens**: Colors that change between light and dark modes

The CSS output uses:
- `:root` for base tokens and light mode colors
- `[data-mantine-color-scheme="dark"]` for dark mode color overrides

## Development Workflow

1. Edit tokens in Figma using Tokens Studio
2. Export and update local token files
3. Run build scripts to generate CSS/JSON
4. Use generated files in your application

## Using the Tokens

### In CSS
```css
/* Mantine variables */
@import 'path/to/dist/mantine-variables.css';

/* ClearCo tokens */
@import 'path/to/dist/clearco-tokens.css';

/* Usage */
.my-component {
  color: var(--clearco-text-default);
  background: var(--clearco-background-body);
  padding: var(--clearco-spacing-md);
}
```

### In JavaScript
```js
import tokens from 'path/to/dist/clearco-tokens.json';

// Access shared tokens
const fontSize = tokens.shared.fontFamilies.body.$value;

// Access theme-specific tokens
const lightBg = tokens.themes.light.background.body.$value;
const darkBg = tokens.themes.dark.background.body.$value;
```