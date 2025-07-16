import RandExp = require('randexp');
import { escape } from './regexp';

// Type Definitions
type TextInput = string | string[];
type CharacterIndex = Record<string, Record<string, Record<string, string>>>;
type SpecialCharacters = Record<string, string>;
type SearchResult<T> = T | undefined;

interface ReferenceData {
  readonly chars: Record<string, string>;
  readonly extra: Record<string, string>;
  readonly symbolsRegExp: string;
}

interface ShoetestOptions {
  strict?: boolean;
  diacritics?: boolean;
  charCase?: boolean;
  symbols?: boolean;
  whitespaces?: boolean;
  boundaries?: boolean;
  begin?: string;
  end?: string;
}

// Constants
const DEFAULT_OPTIONS: Required<ShoetestOptions> = {
  strict: true,
  diacritics: false,
  charCase: false,
  symbols: false,
  whitespaces: false,
  boundaries: true,
  begin: '',
  end: '',
} as const;

const UNICODE_NULL_CHAR = '\u0000';

// Load reference data
const REFERENCE = require('../reference.json') as ReferenceData;

// Advanced Unicode-aware string matching library
class Shoetest {
  private readonly basic: CharacterIndex = {};
  private basicExtra: CharacterIndex = {};
  private readonly special: SpecialCharacters = {};
  private readonly symbols: string;

  constructor() {
    this.symbols = REFERENCE.symbolsRegExp;
    this.initializeCharacterIndices();
  }

  /**
   * Initialize character mappings for basic and extra characters
   *
   * This method sets up the basic and extra character indices used for
   * fuzzy matching, including special character mappings.
   */
  private initializeCharacterIndices(): void {
    this.buildCharacterMappings(REFERENCE.chars, this.basic);
    this.basicExtra = this.cloneDeep(this.basic);
    this.buildCharacterMappings(REFERENCE.extra, this.basicExtra, true);
  }

  /**
   * Build character mappings for the given character set
   *
   * Creates regex patterns for character variations and stores them in the index.
   * For basic mappings, creates simple alternation patterns. For extra mappings,
   * combines existing patterns with new variants using non-capturing groups.
   *
   * @param chars - Character mapping object where keys are base characters and values are their variants
   * @param index - The character index to populate with regex patterns
   * @param isExtra - Whether this is building extra character mappings (combines with existing patterns)
   */
  private buildCharacterMappings(
    chars: Record<string, string>,
    index: CharacterIndex,
    isExtra = false,
  ): void {
    for (const [character, variants] of Object.entries(chars)) {
      const [first, second, third] = character;

      // Ensure nested structure exists
      index[first] ??= {};
      index[first][second] ??= {};

      if (isExtra) {
        const existing = index[first][second][third];
        const pattern = `[${escape(variants)}]`;
        index[first][second][third] = existing
          ? `(?:${existing}|${pattern})`
          : `(?:${character}|${pattern})`;
      } else {
        index[first][second][third] = `(?:${character}|[${variants}])`;
        // Map variants to base character
        for (const variant of variants) {
          this.special[variant] = character;
        }
      }
    }
  }

  /**
   * Deep clone an object using the best available method
   *
   * Uses structuredClone if available (modern browsers/Node.js),
   * otherwise falls back to JSON serialization for deep cloning.
   *
   * @param obj - The object to clone
   * @returns A deep copy of the input object
   */
  private cloneDeep<T>(obj: T): T {
    return typeof structuredClone !== 'undefined'
      ? structuredClone(obj)
      : JSON.parse(JSON.stringify(obj));
  }

  /**
   * Remove diacritics and accents from text
   *
   * Converts accented and special characters to their basic equivalents
   * using the character mapping table. Returns undefined for falsy inputs.
   *
   * @param str - The input string to simplify
   * @returns The simplified string without diacritics, or undefined if input is falsy
   */
  simplify(str: string): SearchResult<string> {
    if (!str) return undefined;

    return String(str)
      .split('')
      .map(char => this.special[char] || char)
      .join('');
  }

  /**
   * Create a fuzzy matching regular expression
   *
   * Generates a regex pattern that matches the input string with various
   * character variations based on the provided options. Handles diacritics,
   * case sensitivity, symbols, and other fuzzy matching features.
   *
   * @param str - The input string to create a regex pattern for
   * @param options - Configuration options for the regex generation
   * @returns A RegExp object for fuzzy matching, or undefined if input is falsy
   */
  getRegExp(str: string, options: ShoetestOptions = {}): SearchResult<RegExp> {
    if (!str) return undefined;

    const config = { ...DEFAULT_OPTIONS, ...options };
    const index = config.strict ? this.basic : this.basicExtra;
    const processedStr = config.diacritics ? str : (this.simplify(str) ?? str);

    return this.buildRegexPattern(processedStr, config, index);
  }

  /**
   * Build the actual regex pattern from processed string and options
   *
   * Constructs the final regular expression by preprocessing the input string
   * and building the pattern with appropriate flags based on configuration.
   *
   * @param str - The input string to build a pattern for
   * @param options - Complete configuration options for pattern building
   * @param index - Character index to use for pattern generation
   * @returns A RegExp object with the generated pattern and appropriate flags
   */
  private buildRegexPattern(
    str: string,
    options: Required<ShoetestOptions>,
    index: CharacterIndex,
  ): RegExp {
    const { processedStr, sb, sp } = this.preprocessString(str, options);
    const pattern = this.buildPattern(processedStr, options, index, sb, sp);
    const flags = options.charCase ? 'g' : 'gi';

    return new RegExp(`(${options.begin}${pattern}${options.end})`, flags);
  }

  /**
   * Preprocess string based on symbol and boundary options
   *
   * Handles removal or transformation of symbols and boundaries based on
   * configuration options. Prepares separators for pattern building.
   *
   * @param str - The input string to preprocess
   * @param options - Complete configuration options for preprocessing
   * @returns Object containing processed string and boundary/symbol separators
   */
  private preprocessString(str: string, options: Required<ShoetestOptions>) {
    let processedStr = str;
    let sb = '';
    let sp = '';

    if (!options.symbols && !options.boundaries) {
      sb = `[\\s${this.symbols}]`;
      processedStr = processedStr.replace(new RegExp(`${sb}+`, 'g'), '');
      sb = `${sb}*`;
    } else if (!options.symbols) {
      sp = `[${this.symbols}]`;
      processedStr = processedStr.replace(new RegExp(`${sp}+`, 'g'), UNICODE_NULL_CHAR);
      sp = `${sp}*`;
    } else if (!options.boundaries) {
      sb = '\\s';
      processedStr = processedStr.replace(new RegExp(`${sb}+`, 'g'), '');
      sb = `${sb}*`;
    }

    return { processedStr, sb, sp };
  }

  /**
   * Build the core pattern from processed string
   *
   * Constructs the main regex pattern by iterating through characters
   * and handling multi-character sequences, boundaries, and separators.
   *
   * @param str - The preprocessed input string
   * @param options - Complete configuration options for pattern building
   * @param index - Character index to use for pattern generation
   * @param sb - Boundary separator pattern
   * @param sp - Symbol separator pattern
   * @returns The constructed regex pattern string
   */
  private buildPattern(
    str: string,
    options: Required<ShoetestOptions>,
    index: CharacterIndex,
    sb: string,
    sp: string,
  ): string {
    let pattern = '';
    let current = '';
    let prevX = '';
    let prevY = '';
    let prevZ = '';

    for (let i = 0; i < str.length; i++) {
      const chars = [str[i - 2], str[i - 1], str[i]];
      const [cY, cZ, c] = chars;

      [prevX, prevY, prevZ] = [prevY, prevZ, current];

      const re1 = this.getCharacterRegex(c, options, index);
      const re2 = this.getMultiCharRegex(cZ, c, undefined, index);
      const re3 = this.getMultiCharRegex(cY, cZ, c, index);

      if (!re2 && !re3) {
        pattern += current + (current ? sb : '');
        current = re1 === UNICODE_NULL_CHAR ? sp : re1;
        [prevX, prevY, prevZ] = ['', '', ''];
      } else {
        current = `(?:${prevZ}${sb}${re1}`;
        if (re2) current += `|${prevY}${sb}${re2}`;
        if (re3) current += `|${prevX}${sb}${re3}`;
        current += ')';
      }
    }

    return pattern + current;
  }

  /**
   * Get regex pattern for a single character
   *
   * Creates a regex pattern for an individual character, handling
   * whitespace, symbols, and character variations based on options.
   *
   * @param char - The character to create a pattern for
   * @param options - Complete configuration options for pattern building
   * @param index - Character index to use for pattern generation
   * @returns The regex pattern string for the character
   */
  private getCharacterRegex(
    char: string,
    options: Required<ShoetestOptions>,
    index: CharacterIndex,
  ): string {
    if (options.boundaries && /\s/.test(char)) {
      if (!options.whitespaces && !options.symbols) return `[\\s${this.symbols}]+`;
      if (!options.whitespaces) return '\\s+';
      if (!options.symbols) return `[${this.symbols}]*${char}[${this.symbols}]*`;
      return char;
    }

    return char && index[char]?.['undefined']?.['undefined']
      ? index[char]['undefined']['undefined']
      : escape(char);
  }

  /**
   * Get regex pattern for multi-character sequences
   *
   * Attempts to find regex patterns for character sequences of 2 or 3 characters
   * in the character index. Used for handling ligatures and multi-character mappings.
   *
   * @param char1 - First character of the sequence
   * @param char2 - Second character of the sequence
   * @param char3 - Optional third character of the sequence
   * @param index - Character index to search for multi-character patterns
   * @returns The regex pattern string for the sequence, or null if not found
   */
  private getMultiCharRegex(
    char1: string,
    char2: string,
    char3?: string,
    index?: CharacterIndex,
  ): string | null {
    if (!char1 || !char2) return null;

    if (char3 && index?.[char1]?.[char2]?.[char3]) {
      return index[char1][char2][char3];
    }

    if (!char3 && index?.[char1]?.[char2]?.['undefined']) {
      return index[char1][char2]['undefined'];
    }

    return null;
  }

  /**
   * Check if pattern exists in target text(s)
   *
   * Tests whether the fuzzy pattern matches any of the provided texts.
   * Returns true if any match is found, false if no matches, undefined for invalid inputs.
   *
   * @param str - The pattern string to search for
   * @param texts - Single text string or array of strings to search in
   * @param options - Configuration options for fuzzy matching
   * @returns True if pattern matches any text, false if no matches, undefined if invalid input
   */
  test(
    str: string,
    texts: TextInput,
    options?: ShoetestOptions,
  ): SearchResult<boolean> {
    if (!str || !texts) return undefined;

    const regex = this.getRegExp(str, options);
    if (!regex) return false;

    return (Array.isArray(texts) ? texts : [texts]).some(
      text => typeof text === 'string' && regex.test(text),
    );
  }

  /**
   * Extract all matching substrings from text(s)
   *
   * Searches for all occurrences of the fuzzy pattern in the provided text(s)
   * and returns an array of matching substrings. Filters out non-string inputs.
   *
   * @param str - The pattern string to search for
   * @param texts - Single text string or array of strings to search in
   * @param options - Configuration options for fuzzy matching
   * @returns Array of matching substrings, empty array if no matches, undefined for invalid input
   */
  match(
    str: string,
    texts: TextInput,
    options?: ShoetestOptions,
  ): SearchResult<string[]> {
    if (!str || !texts) return undefined;

    const regex = this.getRegExp(str, options);
    if (!regex) return [];

    return (Array.isArray(texts) ? texts : [texts])
      .filter((text): text is string => typeof text === 'string')
      .flatMap(text => text.match(regex) ?? []);
  }

  /**
   * Replace pattern matches with new content
   *
   * Searches for all occurrences of the fuzzy pattern in the provided text(s)
   * and replaces them with the specified replacement string. Preserves original
   * input structure (string vs array).
   *
   * @param str - The pattern string to search for
   * @param newstr - The replacement string for matches
   * @param texts - Single text string or array of strings to search in
   * @param options - Configuration options for fuzzy matching
   * @returns Modified string/array with replacements, or undefined for invalid input
   */
  replace(
    str: string,
    newstr: string,
    texts: TextInput,
    options?: ShoetestOptions,
  ): SearchResult<string | string[]> {
    if (!str || !texts) return undefined;

    const regex = this.getRegExp(str, options);
    if (!regex) return texts;

    const results = (Array.isArray(texts) ? texts : [texts]).map(text =>
      typeof text === 'string' ? text.replace(regex, newstr || '') : text,
    );

    return results.length === 1 ? results[0] : results;
  }

  /**
   * Add random diacritics and character variations to text
   *
   * Generates a random variation of the input string by creating a fuzzy
   * regex pattern and using it to produce a randomized version with
   * character substitutions and diacritics.
   *
   * @param str - The input string to complexify
   * @returns A randomized version of the string with character variations, or undefined if input is falsy
   */
  complexify(str: string): SearchResult<string> {
    if (!str) return undefined;

    const regex = this.getRegExp(str, {
      charCase: true,
      symbols: true,
      whitespaces: true,
    });
    if (!regex) return str;

    const generator = new RandExp(regex);
    generator.defaultRange.add(0, 65535);
    return generator.gen();
  }
}

const shoetestInstance = new Shoetest();
export default shoetestInstance;
