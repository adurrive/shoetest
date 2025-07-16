// Regular Expression Utilities

// Characters that have special meaning in regular expressions
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Safely escape special regex characters
 *
 * Converts special regex characters to their literal equivalents by adding
 * backslashes, making the string safe to use in regex patterns.
 *
 * @param str - Text containing potential regex special characters
 * @returns Escaped text safe for regex use
 *
 * @example
 * ```typescript
 * escape('Hello (world)');     // → 'Hello \\(world\\)'
 * escape('Price: $5.99');      // → 'Price: \\$5\\.99'
 * escape('.*+?^${}()|[]\\');   // → '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
 * ```
 */
export function escape(str: string): string {
  return str.replace(REGEX_SPECIAL_CHARS, '\\$&');
}
