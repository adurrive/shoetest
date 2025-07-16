import { escape } from '../src/regexp';

describe('regexp', () => {
  describe('escape', () => {
    it('should be a function', () => {
      expect(typeof escape).toBe('function');
    });

    it('should escape $ in a string', () => {
      expect(escape("It's $5!")).toBe("It's \\$5!");
    });

    it('should escape ? in a string', () => {
      expect(escape('Is it $5?')).toBe('Is it \\$5\\?');
    });

    it('should escape all regex special characters', () => {
      const input = '.*+?^${}()|[]\\';
      const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
      expect(escape(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(escape('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      expect(escape('hello world')).toBe('hello world');
    });
  });
});
