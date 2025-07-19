[![NPM](https://nodei.co/npm/shoetest.png?downloads=true)](https://nodei.co/npm/shoetest/)

# 🔍 Shoetest

**Advanced Unicode-aware string matching library for TypeScript and JavaScript**

Powerful fuzzy string matching that's insensitive to diacritics, special characters, symbols and case. Perfect for search functionality, data deduplication, and user input tolerance.

## ✨ Features

- 🌍 **Unicode-aware** - Handles diacritics, accents, and special characters
- 🔤 **Case insensitive** - Matches regardless of character case
- 🎯 **Fuzzy matching** - Flexible pattern matching with configurable rules
- 📝 **TypeScript support** - Full type definitions included
- 🚀 **Modern ES modules** - Works with both CommonJS and ES modules

## 📦 Installation

```bash
npm install shoetest
```

## 📖 Usage Examples

### Getting Started

```javascript
// CommonJS
const shoetest = require('shoetest');

// ES Modules
import shoetest from 'shoetest';

// Basic fuzzy matching
shoetest.test('cafe', 'café');        // → true
shoetest.test('hello', 'HELLO');      // → true
shoetest.test('naif', 'naïf');        // → true
```

### String Matching
```javascript
const text1 = 'heļlṏ, wɵrḻɖ!';
const text2 = 'Algæ Britannicæ';
const text3 = 'The Crème de la Crème de la Crème!';

// Test if pattern exists
shoetest.test('hello world', text1);                    // → true
shoetest.test('hello world', [text1, text2, text3]);   // → true

// Extract matching substrings
shoetest.match('Helló (wơrLd)', text1);     // → ['heļlṏ, wɵrḻɖ']
shoetest.match('algae britannicae', text2); // → ['Algæ Britannicæ']
shoetest.match('creme', text3);             // → ['Crème', 'Crème', 'Crème']
```

### Find and Replace
```javascript
// Replace with capture groups
shoetest.replace('creme', '<b>$1</b>', text3);
// → 'The <b>Crème</b> de la <b>Crème</b> de la <b>Crème</b>!'

// Batch replacement
shoetest.replace('creme', 'Crème fraîche', [text1, text2, text3]);
// → ['heļlṏ, wɵrḻɖ!', 'Algæ Britannicæ', 'The Crème fraîche de la Crème fraîche de la Crème fraîche!']
```

### Text Transformation
```javascript
// Simplify text (remove diacritics)
shoetest.simplify('Ƀuffalỗ buḟḟaḻở Ḅuƒfalo ḅuffȃlỗ bufｆalȏ bǖffaḻồ Ƀⓤffalo buƒfalɵ');
// → 'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo'

// Complexify text (add random diacritics)
shoetest.complexify('This is Mars!');
// → 'Thíṣ ịṥ Mârs!' (varies each time)
```

### Advanced Configuration
```javascript
// Precise matching with word boundaries
const preciseOptions = {
  charCase: true,     // Case-sensitive matching
  strict: false,      // Allow similar characters (s → $)
  diacritics: true,   // Match accents exactly
  symbols: false,     // Ignore punctuation differences
  begin: '\\b',       // Word boundary at start
  end: '\\b'          // Word boundary at end
};

shoetest.test('creme de la creme', text3, preciseOptions);  // → false (case mismatch)
shoetest.test('Creme de la Creme', text3, preciseOptions);  // → true

// Boundaries vs begin/end comparison
shoetest.test('Alg', text2);                                        // → true (partial match)
shoetest.test('Alg', text2, { begin: '\\b', end: '\\b' });         // → false (requires word boundary)
shoetest.test('hello world', 'helloworld', { boundaries: false }); // → true (ignores whitespace)
```

## 🔧 API Reference

### `shoetest.test(pattern, text, options?)`
Tests if a pattern exists in the target text(s).

**Parameters:**
- `pattern` (string) - Search pattern to look for
- `text` (string | string[]) - Target text(s) to search within
- `options` (object, optional) - Matching configuration

**Returns:** `boolean | undefined`

### `shoetest.match(pattern, text, options?)`
Extracts all matching substrings from text(s).

**Parameters:**
- `pattern` (string) - Search pattern to find
- `text` (string | string[]) - Target text(s) to search within
- `options` (object, optional) - Matching configuration

**Returns:** `string[] | undefined`

### `shoetest.replace(pattern, replacement, text, options?)`
Replaces pattern matches with new content.

**Parameters:**
- `pattern` (string) - Search pattern to replace
- `replacement` (string) - Replacement text (supports $1, $2, etc.)
- `text` (string | string[]) - Target text(s) to modify
- `options` (object, optional) - Matching configuration

**Returns:** `string | string[] | undefined`

### `shoetest.simplify(text)`
Removes diacritics and accents from text.

**Parameters:**
- `text` (string) - Text to simplify

**Returns:** `string | undefined`

### `shoetest.complexify(text)`
Adds random diacritics and character variations.

**Parameters:**
- `text` (string) - Text to add variations to

**Returns:** `string | undefined`

### `shoetest.getRegExp(pattern, options?)`
Creates a fuzzy matching regular expression.

**Parameters:**
- `pattern` (string) - Pattern to create regex for
- `options` (object, optional) - Matching configuration

**Returns:** `RegExp | undefined`

## ⚙️ Configuration Options

### `strict` (boolean)
**Default:** `true`

Use strict character matching. When `false`, allows similar-looking characters like `s` with `$` or `e` with `€`.

### `diacritics` (boolean)
**Default:** `false`

Match diacritics exactly. When `true`, accents must match precisely.

### `charCase` (boolean)
**Default:** `false`

Match character case exactly. When `true`, enables case-sensitive matching.

### `symbols` (boolean)
**Default:** `false`

Match symbols exactly. When `true`, punctuation must match.

### `whitespaces` (boolean)
**Default:** `false`

Match whitespace exactly. When `true`, spaces must be identical.

### `boundaries` (boolean)
**Default:** `true`

Controls whitespace handling in patterns. When `true` (default), whitespace in the pattern must match whitespace in the target text. When `false`, whitespace in the pattern is ignored, allowing matches across word boundaries.

**Important:** This option does NOT use regex word boundaries (`\b`). For true word boundaries, use the `begin` and `end` options with `\\b`.

### `begin` (string)
**Default:** `''`

Custom regular expression pattern to prepend. Escape when necessary (e.g., `\\b`).

### `end` (string)
**Default:** `''`

Custom regular expression pattern to append. Escape when necessary (e.g., `\\b`).

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🛠️ Development

```bash
npm run build         # Build the library
npm run dev           # Build in watch mode
npm run clean         # Clean dist and coverage directories
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint and fix issues
npm run typecheck     # Run TypeScript type checking
npm run validate      # Run typecheck, lint, and tests
```

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome! If you add functionality, please add unit tests to cover it.

If you wish to update the reference list, only add special characters translated to 3 or less basic latin characters.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/shoetest)
- [GitHub Repository](https://github.com/adurrive/shoetest)
- [Issue Tracker](https://github.com/adurrive/shoetest/issues)