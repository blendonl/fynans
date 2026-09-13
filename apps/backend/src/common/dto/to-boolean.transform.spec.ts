import { plainToInstance } from 'class-transformer';
import { ToBoolean } from './to-boolean.transform';

class QueryWithPending {
  @ToBoolean()
  pending?: boolean;
}

const parse = (pending: unknown) =>
  plainToInstance(QueryWithPending, { pending }).pending;

describe('ToBoolean', () => {
  it('reads the query string "false" as false, not true', () => {
    expect(parse('false')).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on', 'TRUE', ' True '])(
    'reads %p as true',
    (value) => {
      expect(parse(value)).toBe(true);
    },
  );

  it.each(['false', '0', 'no', 'off', 'FALSE', ' False '])(
    'reads %p as false',
    (value) => {
      expect(parse(value)).toBe(false);
    },
  );

  it('leaves real booleans alone', () => {
    expect(parse(true)).toBe(true);
    expect(parse(false)).toBe(false);
  });

  it('leaves an absent value absent', () => {
    expect(parse(undefined)).toBeUndefined();
  });

  it('passes an unrecognised value through so IsBoolean can reject it', () => {
    expect(parse('maybe')).toBe('maybe');
  });
});
