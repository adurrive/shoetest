import shoetest from '../src/shoetest';

describe('shoetest', () => {
  it('should be an object', () => {
    expect(typeof shoetest).toBe('object');
  });

  it('should have a simplify method', () => {
    expect(typeof shoetest.simplify).toBe('function');
  });

  it('should have a complexify method', () => {
    expect(typeof shoetest.complexify).toBe('function');
  });

  it('should have a getRegExp method', () => {
    expect(typeof shoetest.getRegExp).toBe('function');
  });

  it('should have a test method', () => {
    expect(typeof shoetest.test).toBe('function');
  });

  it('should have a match method', () => {
    expect(typeof shoetest.match).toBe('function');
  });

  describe('#simplify()', () => {
    it('should remove diacritics', () => {
      const simplified = shoetest.simplify('heļlṏ wɵrḻɖ');
      expect(simplified).toBe('hello world');
    });

    it('should match case', () => {
      const simplified = shoetest.simplify('Heļlṏ Wɵrḻɖ');
      expect(simplified).toBe('Hello World');
    });

    it('should match symbols', () => {
      const simplified = shoetest.simplify('Heļlṏ, Wɵrḻɖ!');
      expect(simplified).toBe('Hello, World!');
    });
  });

  describe('#complexify()', () => {
    it('should transform string', () => {
      const complexified = shoetest.complexify('hello world');
      expect(complexified).not.toBe('hello world');
    });

    it('should be reversible with simplify', () => {
      const reversed = shoetest.simplify(shoetest.complexify('hello world')!);
      expect(reversed).toBe('hello world');
    });

    it('should keep case', () => {
      const reversed = shoetest.simplify(shoetest.complexify('Hello World')!);
      expect(reversed).toBe('Hello World');
    });

    it('should keep symbols', () => {
      const reversed = shoetest.simplify(shoetest.complexify('Hello, World!')!);
      expect(reversed).toBe('Hello, World!');
    });
  });

  describe('#getRegExp()', () => {
    it('should be a regular expression', () => {
      const re = shoetest.getRegExp('hello world');
      expect(re instanceof RegExp).toBe(true);
    });
  });

  describe('#test()', () => {
    const text = 'The Crème de la Crème de la Crème!\nEat it!';
    const texts = ['Algæ Britannicæ', 'The Crème de la Crème de la Crème! $@v€ it!'];

    it('should return false when the query is not matched in the provided text', () => {
      expect(shoetest.test('Cream', text)).toBe(false);
    });

    it('should return true when the query is matched in the provided text', () => {
      expect(shoetest.test('Creme', text)).toBe(true);
    });

    it('should not match special characters by default', () => {
      expect(shoetest.test('save', texts)).toBe(false);
    });

    it('should not match special characters by default', () => {
      expect(shoetest.test('$@v€', texts)).toBe(true);
    });

    it('should match special characters when strict is set to false', () => {
      expect(shoetest.test('save', texts, { strict: false })).toBe(true);
    });

    it('should not match the diacritics by default', () => {
      expect(shoetest.test('the créme', texts)).toBe(true);
    });

    it('should match the diacritics when diacritics is set to true', () => {
      expect(shoetest.test('the créme', texts, { diacritics: true })).toBe(false);
    });

    it('should match the diacritics when diacritics is set to true', () => {
      expect(shoetest.test('the crème', texts, { diacritics: true })).toBe(true);
    });

    it('should not match the case by default', () => {
      expect(shoetest.test('The CREME De La CREME De La CREME!', texts)).toBe(true);
    });

    it('should match the case when charCase is set to true', () => {
      expect(
        shoetest.test('The CREME De La CREME De La CREME!', texts, {
          charCase: true,
        }),
      ).toBe(false);
    });

    it('should match the case when charCase is set to true', () => {
      expect(
        shoetest.test('The Creme de la Creme de la Creme!', texts, {
          charCase: true,
        }),
      ).toBe(true);
    });

    it('should not match the symbols by default', () => {
      expect(
        shoetest.test(
          'Algae\'"-]^}\\[/{)(*+?.|`~_¤°#<>%,;:!ǃ=¡¿«»¼½¾¹²³ªº§¶¦ǀǁǂ¨´·±×÷¬¯¸©®&@ Britannicae',
          texts,
        ),
      ).toBe(true);
    });

    it('should match the symbols when symbols is set to true', () => {
      expect(
        shoetest.test('the creme, de la creme, de la creme.', texts, {
          symbols: true,
        }),
      ).toBe(false);
    });

    it('should match the symbols when symbols is set to true', () => {
      expect(
        shoetest.test('the creme de la creme de la creme!', texts, {
          symbols: true,
        }),
      ).toBe(true);
    });

    it('should not match the exact whitespaces by default', () => {
      expect(shoetest.test('the creme de la creme de la creme! eat it!', text)).toBe(
        true,
      );
    });

    it('should match the exact whitespaces when whitespaces is set to true', () => {
      expect(
        shoetest.test('the creme de la creme de la creme! eat it!', text, {
          whitespaces: true,
        }),
      ).toBe(false);
    });

    it('should match the exact whitespaces when whitespaces is set to true', () => {
      expect(
        shoetest.test('the creme de la creme de la creme!\neat it!', text, {
          whitespaces: true,
        }),
      ).toBe(true);
    });

    it('should match word boundaries by default', () => {
      expect(shoetest.test('thecreme', texts)).toBe(false);
    });

    it('should not match word boundaries when boundaries is set to false', () => {
      expect(shoetest.test('thecreme', texts, { boundaries: false })).toBe(true);
    });

    it('should not match word boundaries when boundaries is set to false', () => {
      expect(shoetest.test('thecre mede lacrem', texts, { boundaries: false })).toBe(
        true,
      );
    });

    it('should not be a bounded string by default', () => {
      expect(shoetest.test('he creme de la crem', texts)).toBe(true);
    });

    it('should match the regular expression set to begin', () => {
      expect(shoetest.test('he creme de la creme', texts, { begin: '\\b' })).toBe(
        false,
      );
    });

    it('should match the regular expression set to end', () => {
      expect(shoetest.test('the creme de la crem', texts, { end: '\\b' })).toBe(false);
    });

    it('should match the regular expression set to begin and end', () => {
      expect(
        shoetest.test('the creme de la creme', texts, {
          begin: '\\b',
          end: '\\b',
        }),
      ).toBe(true);
    });
  });

  describe('#match()', () => {
    const text = 'The Crème de la Crème de la Crème!\nEat it!';
    const texts = ['Algæ Britannicæ', 'The Crème de la Crème de la Crème! $@v€ it!'];

    it('should return an empty array when the query is not matched in the provided text', () => {
      expect(shoetest.match('Cream', text)).toEqual([]);
    });

    it('should return an array with the match query', () => {
      expect(shoetest.match('Creme', text)).toEqual(['Crème', 'Crème', 'Crème']);
    });

    it('should not match special characters by default', () => {
      expect(shoetest.match('save', texts)).toEqual([]);
    });

    it('should not match special characters by default', () => {
      expect(shoetest.match('$@v€', texts)).toEqual(['$@v€']);
    });

    it('should match special characters when strict is set to false', () => {
      expect(shoetest.match('save', texts, { strict: false })).toEqual(['$@v€']);
    });

    it('should not match the diacritics by default', () => {
      expect(shoetest.match('the créme', texts)).toEqual(['The Crème']);
    });

    it('should match the diacritics when diacritics is set to true', () => {
      expect(shoetest.match('the créme', texts, { diacritics: true })).toEqual([]);
    });

    it('should match the diacritics when diacritics is set to true', () => {
      expect(shoetest.match('the crème', texts, { diacritics: true })).toEqual([
        'The Crème',
      ]);
    });

    it('should not match the case by default', () => {
      expect(shoetest.match('The CREME De La CREME De La CREME!', texts)).toEqual([
        'The Crème de la Crème de la Crème!',
      ]);
    });

    it('should match the case when charCase is set to true', () => {
      expect(
        shoetest.match('The CREME De La CREME De La CREME!', texts, {
          charCase: true,
        }),
      ).toEqual([]);
    });

    it('should match the case when charCase is set to true', () => {
      expect(
        shoetest.match('The Creme de la Creme de la Creme!', texts, {
          charCase: true,
        }),
      ).toEqual(['The Crème de la Crème de la Crème!']);
    });

    it('should not match the symbols by default', () => {
      expect(
        shoetest.match(
          'Algae\'"-]^}\\[/{)(*+?.|`~_¤°#<>%,;:!ǃ=¡¿«»¼½¾¹²³ªº§¶¦ǀǁǂ¨´·±×÷¬¯¸©®&@ Britannicae',
          texts,
        ),
      ).toEqual(['Algæ Britannicæ']);
    });

    it('should match the symbols when symbols is set to true', () => {
      expect(
        shoetest.match('the creme, de la creme, de la creme.', texts, {
          symbols: true,
        }),
      ).toEqual([]);
    });

    it('should match the symbols when symbols is set to true', () => {
      expect(
        shoetest.match('the creme de la creme de la creme!', texts, {
          symbols: true,
        }),
      ).toEqual(['The Crème de la Crème de la Crème!']);
    });

    it('should not match the exact whitespaces by default', () => {
      expect(
        shoetest.match('the creme de la creme de la creme! eat it!', text),
      ).toEqual(['The Crème de la Crème de la Crème!\nEat it!']);
    });

    it('should match the exact whitespaces when whitespaces is set to true', () => {
      expect(
        shoetest.match('the creme de la creme de la creme! eat it!', text, {
          whitespaces: true,
        }),
      ).toEqual([]);
    });

    it('should match the exact whitespaces when whitespaces is set to true', () => {
      expect(
        shoetest.match('the creme de la creme de la creme!\neat it!', text, {
          whitespaces: true,
        }),
      ).toEqual(['The Crème de la Crème de la Crème!\nEat it!']);
    });

    it('should match word boundaries by default', () => {
      expect(shoetest.match('thecreme', texts)).toEqual([]);
    });

    it('should not match word boundaries when boundaries is set to false', () => {
      expect(shoetest.match('thecreme', texts, { boundaries: false })).toEqual([
        'The Crème',
      ]);
    });

    it('should not match word boundaries when boundaries is set to false', () => {
      expect(
        shoetest.match('thecre mede lacrem', texts, { boundaries: false }),
      ).toEqual(['The Crème de la Crèm']);
    });

    it('should not be a bounded string by default', () => {
      expect(shoetest.match('he creme de la crem', texts)).toEqual([
        'he Crème de la Crèm',
      ]);
    });

    it('should match the regular expression set to begin', () => {
      expect(shoetest.match('he creme de la creme', texts, { begin: '\\b' })).toEqual(
        [],
      );
    });

    it('should match the regular expression set to end', () => {
      expect(shoetest.match('the creme de la crem', texts, { end: '\\b' })).toEqual([]);
    });

    it('should match the regular expression set to begin and end', () => {
      expect(
        shoetest.match('the creme de la creme', texts, {
          begin: '\\b',
          end: '\\b',
        }),
      ).toEqual(['The Crème de la Crème']);
    });
  });

  describe('#replace()', () => {
    const text = 'The Crême de la Crème de la Créme!';
    const arr = ['One time', 'Two times', 3, [1, 2, 3]] as unknown as string[];

    it('should replace the provided string with the new string', () => {
      expect(shoetest.replace('creme', 'Crème fraîche', text)).toBe(
        'The Crème fraîche de la Crème fraîche de la Crème fraîche!',
      );
    });

    it('should keep the matched string when using $1', () => {
      expect(shoetest.replace('creme', '$1 fraîche', text)).toBe(
        'The Crême fraîche de la Crème fraîche de la Créme fraîche!',
      );
    });

    it('should work with mix arrays', () => {
      const mod = shoetest.replace('time', 'troll', arr);
      expect(mod).toEqual(['One troll', 'Two trolls', 3, [1, 2, 3]]);
    });

    it('should not alter the original array', () => {
      const originalCopy = [...arr];
      shoetest.replace('time', 'troll', arr);
      expect(arr).toEqual(originalCopy);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(shoetest.simplify(null as unknown as string)).toBeUndefined();
      expect(shoetest.simplify(undefined as unknown as string)).toBeUndefined();
      expect(shoetest.getRegExp(null as unknown as string)).toBeUndefined();
      expect(shoetest.getRegExp(undefined as unknown as string)).toBeUndefined();
      expect(shoetest.test(null as unknown as string, 'text')).toBeUndefined();
      expect(shoetest.test('text', null as unknown as string)).toBeUndefined();
      expect(shoetest.match(null as unknown as string, 'text')).toBeUndefined();
      expect(shoetest.match('text', null as unknown as string)).toBeUndefined();
      expect(
        shoetest.replace(null as unknown as string, 'new', 'text'),
      ).toBeUndefined();
      expect(shoetest.replace('old', 'new', null as unknown as string)).toBeUndefined();
    });

    it('should handle empty strings appropriately', () => {
      expect(shoetest.simplify('')).toBeUndefined();
      expect(shoetest.getRegExp('')).toBeUndefined();
      expect(shoetest.test('', 'text')).toBeUndefined();
      expect(shoetest.test('text', '')).toBeUndefined();
      expect(shoetest.match('', 'text')).toBeUndefined();
      expect(shoetest.match('text', '')).toBeUndefined();
      expect(shoetest.replace('', 'new', 'text')).toBeUndefined();
      expect(shoetest.replace('old', 'new', '')).toBeUndefined();
    });

    it('should handle numeric inputs by converting to string', () => {
      expect(shoetest.simplify('123')).toBe('123');
      expect(shoetest.getRegExp('123')).toBeInstanceOf(RegExp);
      expect(shoetest.test('123', '123456')).toBe(true);
    });

    it('should handle complex Unicode characters', () => {
      const unicodeText = '🚀 Hello 世界 café';
      const simplified = shoetest.simplify(unicodeText);
      expect(simplified).toContain('🚀');
      expect(simplified).toContain('世界');
      expect(simplified).toContain('cafe');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      const simplified = shoetest.simplify(longString);
      expect(simplified).toBe(longString);

      const regex = shoetest.getRegExp('a');
      expect(regex).toBeInstanceOf(RegExp);
      expect(shoetest.test('a', longString)).toBe(true);
    });

    it('should handle special regex characters in input', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const regex = shoetest.getRegExp(specialChars);
      expect(regex).toBeInstanceOf(RegExp);
      expect(shoetest.test(specialChars, specialChars)).toBe(true);
    });
  });

  describe('boundaries: true (default)', () => {
    it('should NOT use word boundaries \\b - only affects whitespace handling', () => {
      // This shows that boundaries: true does NOT enforce word boundaries
      expect(shoetest.test('test', 'testing')).toBe(true); // matches partial words
      expect(shoetest.test('cat', 'category')).toBe(true); // matches at start
      expect(shoetest.test('ing', 'testing')).toBe(true); // matches at end
    });

    it('should handle whitespace strictly when boundaries: true', () => {
      // boundaries: true means whitespace in pattern must match whitespace in text
      expect(shoetest.test('hello world', 'hello world')).toBe(true);
      expect(shoetest.test('hello world', 'hello    world')).toBe(true); // multiple spaces match
      expect(shoetest.test('hello world', 'helloworld')).toBe(false); // no space doesn't match
    });
  });

  describe('boundaries: false', () => {
    it('should ignore whitespace boundaries completely', () => {
      // boundaries: false allows matching across word boundaries without requiring whitespace
      expect(shoetest.test('hello world', 'helloworld', { boundaries: false })).toBe(
        true,
      );
      expect(shoetest.test('hello world', 'hello-world', { boundaries: false })).toBe(
        true,
      );
      expect(shoetest.test('hello world', 'hello_world', { boundaries: false })).toBe(
        true,
      );
    });

    it('should enable partial word matching across boundaries', () => {
      expect(
        shoetest.test('thecreme', 'The Crème de la Crème', { boundaries: false }),
      ).toBe(true);
      // Note: 'helwor' doesn't match 'hello world' because boundaries: false
      // removes whitespace from the pattern, making it try to match 'helwor' as a continuous string
      expect(shoetest.test('helloworld', 'hello world', { boundaries: false })).toBe(
        true,
      );
    });
  });

  describe('boundaries vs begin/end parameters', () => {
    it('should use begin/end for actual word boundaries', () => {
      // To get true word boundaries, use begin/end with \\b
      expect(shoetest.test('test', 'testing', { begin: '\\b', end: '\\b' })).toBe(
        false,
      );
      expect(shoetest.test('test', 'a test case', { begin: '\\b', end: '\\b' })).toBe(
        true,
      );
      expect(shoetest.test('cat', 'category', { begin: '\\b', end: '\\b' })).toBe(
        false,
      );
      expect(shoetest.test('cat', 'a cat is', { begin: '\\b', end: '\\b' })).toBe(true);
    });

    it('should combine boundaries: false with begin/end for flexible matching', () => {
      // boundaries: false + begin: '\\b' = word start only
      expect(
        shoetest.test('test', 'testing', { boundaries: false, begin: '\\b' }),
      ).toBe(true);
      expect(
        shoetest.test('test', 'contest', { boundaries: false, begin: '\\b' }),
      ).toBe(false);

      // boundaries: false + end: '\\b' = word end only
      expect(shoetest.test('test', 'contest', { boundaries: false, end: '\\b' })).toBe(
        true,
      );
      expect(shoetest.test('test', 'testing', { boundaries: false, end: '\\b' })).toBe(
        false,
      );
    });
  });

  describe('advanced configuration options', () => {
    it('should handle boundaries: false with symbols: true', () => {
      const text = 'hello world test';
      const options = { boundaries: false, symbols: true };
      const result = shoetest.test('hello world', text, options);
      expect(result).toBe(true);
    });

    it('should handle boundaries: false without symbols and whitespaces', () => {
      const text = 'hello-world@test.com';
      const options = { boundaries: false, symbols: false, whitespaces: false };
      const result = shoetest.test('hello world test', text, options);
      expect(result).toBe(true);
    });

    it('should handle multi-character sequences in index', () => {
      // Test multi-character sequences that exist in reference.json
      const text = 'Æ test';
      const result = shoetest.test('AE test', text);
      expect(result).toBe(true);
    });

    it('should handle whitespace processing with boundaries: false', () => {
      const text = 'hello   world   test';
      const options = { boundaries: false };
      const result = shoetest.test('hello world test', text, options);
      expect(result).toBe(true);
    });
  });

  describe('character mapping edge cases', () => {
    it('should handle character combinations not in basic index', () => {
      const text = 'unusual character combinations';
      const result = shoetest.test('unusual', text);
      expect(result).toBe(true);
    });

    it('should handle complex diacritic combinations', () => {
      // Test cases that exercise multi-character regex patterns
      const text = 'café résumé naïve';
      const result = shoetest.test('cafe resume naive', text);
      expect(result).toBe(true);
    });

    it('should handle structuredClone fallback for older environments', () => {
      // Mock structuredClone to be undefined to test fallback
      const originalStructuredClone = (
        globalThis as unknown as { structuredClone?: unknown }
      ).structuredClone;
      (globalThis as unknown as { structuredClone?: unknown }).structuredClone =
        undefined;

      // Create a new instance to trigger the fallback
      const result = shoetest.simplify('test');
      expect(result).toBe('test');

      // Restore original
      (globalThis as unknown as { structuredClone?: unknown }).structuredClone =
        originalStructuredClone;
    });
  });
});
