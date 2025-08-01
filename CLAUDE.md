# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a design tokens repository using the W3C Design Tokens Community Group format. It contains design tokens for a Mantine-based design system that outputs CSS variables compatible with Mantine UI framework.

## Architecture

### Token Structure
- **tokens/**: Root directory containing all design token files
  - **$metadata.json**: Defines the token set order for processing
  - **$themes.json**: Theme configurations linking token sets to Figma
  - **primitives/**: Base token values
    - **mantine.json**: All Mantine CSS variable values (colors, spacing, typography, etc.)
    - **colors.json**: Color palette definitions referencing mantine values
  - **semantic/**: Semantic token mappings
    - **colors.json**: Semantic color mappings for UI states
  - **typography.json**: Font families, weights, sizes, and line heights
  - **spacing.json**: Spacing scale tokens
  - **padding.json**: Padding scale tokens  
  - **radius.json**: Border radius tokens
  - **borders.json**: Border width tokens
  - **shadows.json**: Box shadow definitions

### Token Format
All tokens follow the W3C Design Tokens format with:
- `$type`: Token type (color, dimension, fontFamily, fontWeight, number, shadow)
- `$value`: Token value or reference to another token using `{token.path}` syntax
- `$description`: Optional description

### Build System
The repository uses custom build scripts to generate CSS variables:
- **build-complete.js**: Generates Mantine CSS variables (`dist/mantine-variables.css`)
- **build-clearco.js**: Generates ClearCo custom tokens (`dist/clearco-tokens.css` and `dist/clearco-tokens.json`)
- Mantine variables use format `--mantine-{category}-{name}`
- ClearCo variables use format `--clearco-{category}-{name}`

## Common Commands

```bash
# Install dependencies
npm install

# Build Mantine CSS variables only
npm run build

# Build ClearCo tokens only
npm run build:clearco

# Build both Mantine and ClearCo tokens
npm run build:all

# Clean build output
npm run clean

# Watch for changes and rebuild all
npm run watch
```

## Development Guidelines

When modifying tokens:
1. **Mantine primitives** - Edit `primitives/mantine.json` for base values
2. **Color references** - Use `{mantine.colors.{color}.{shade}}` format
3. **Spacing/sizing** - Follow Mantine's scale (xs, sm, md, lg, xl)
4. **Shadows** - Use composite shadow format with arrays for multiple shadows
5. Run `npm run build` to generate the CSS output

## Output

The build process generates two sets of outputs:

### Mantine Variables (`dist/mantine-variables.css`)
Contains all Mantine framework variables:
- Color variables: `--mantine-color-{name}-{shade}`
- Spacing: `--mantine-spacing-{size}`
- Typography: `--mantine-font-size-{size}`, `--mantine-line-height-{size}`
- Headings: `--mantine-h{1-6}-font-size`, etc.
- Radius: `--mantine-radius-{size}`
- Shadows: `--mantine-shadow-{size}`

### ClearCo Tokens (`dist/clearco-tokens.css` and `dist/clearco-tokens.json`)
Contains custom design decisions and semantic tokens with light/dark mode support:
- Semantic colors: `--clearco-text-{context}`, `--clearco-background-{context}`, `--clearco-border-{context}`
- Custom opacity variants: `--clearco-colors-{color}-{light|dark}-{opacity}`
- Typography: `--clearco-fontFamilies-{usage}`, `--clearco-fontWeights-{weight}`
- Layout: `--clearco-width-{size}` (borders), `--clearco-{size}` (padding)

#### Theme Support
The CSS file includes both light and dark mode variables:
- Light mode: Applied to `:root` selector (default)
- Dark mode: Applied to `[data-mantine-color-scheme="dark"]` selector

The JSON file contains separate `light` and `dark` objects with theme-specific token values.

The CSS files can be imported into any project to apply the design system.