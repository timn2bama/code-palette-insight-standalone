import { cn } from '../utils';

describe('Utils', () => {
  describe('cn (classnames utility)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const isVisible = false;
      const result = cn('foo', isVisible && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar'], 'baz');
      expect(result).toBe('foo bar baz');
    });
  });
});
