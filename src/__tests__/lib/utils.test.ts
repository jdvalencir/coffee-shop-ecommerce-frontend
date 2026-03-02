import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('joins multiple classes with a space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values (false, null, undefined)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(cn('foo', false as any, null as any, undefined, 'bar')).toBe('foo bar');
  });

  it('handles conditional class objects — true key included', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('handles conditional class objects — all false', () => {
    expect(cn({ foo: false, bar: false })).toBe('');
  });

  it('merges conflicting Tailwind utilities (last wins)', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('deduplicates identical classes via tailwind-merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('handles mixed inputs correctly', () => {
    expect(cn('base', { active: true, disabled: false }, ['extra'])).toBe(
      'base active extra',
    );
  });
});
