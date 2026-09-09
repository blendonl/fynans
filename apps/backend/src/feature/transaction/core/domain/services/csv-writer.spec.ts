import { csvDate, csvLine, csvLiteral, csvText } from './csv-writer';

describe('csvText', () => {
  it('leaves a plain value alone', () => {
    expect(csvText('Groceries')).toBe('Groceries');
  });

  it('renders an absent value as an empty cell', () => {
    expect(csvText(null)).toBe('');
    expect(csvText(undefined)).toBe('');
    expect(csvText('')).toBe('');
  });

  const quoted: [string, string, string][] = [
    ['a comma', 'Bread, milk', '"Bread, milk"'],
    ['a quote', 'The "big" shop', '"The ""big"" shop"'],
    ['a newline', 'Line one\nline two', '"Line one\nline two"'],
    ['a carriage return', 'Line one\rline two', '"Line one\rline two"'],
  ];

  it.each(quoted)('quotes a value containing %s', (_name, input, expected) => {
    expect(csvText(input)).toBe(expected);
  });

  const formulas: [string, string][] = [
    ['=1+1', "'=1+1"],
    ['+SUM(A1)', "'+SUM(A1)"],
    ['-2+3', "'-2+3"],
    ['@SUM(A1)', "'@SUM(A1)"],
    ['\tTab led', "'\tTab led"],
  ];

  it.each(formulas)(
    'neutralises a cell starting with %s',
    (input, expected) => {
      expect(csvText(input)).toBe(expected);
    },
  );

  it('neutralises a formula that also needs quoting', () => {
    expect(csvText('=HYPERLINK("http://evil","x")')).toBe(
      `"'=HYPERLINK(""http://evil"",""x"")"`,
    );
  });

  it('does not treat a formula character in the middle as a formula', () => {
    expect(csvText('2+2 pack')).toBe('2+2 pack');
  });
});

describe('csvLiteral', () => {
  it('keeps a negative amount numeric instead of escaping it as a formula', () => {
    expect(csvLiteral('-12.50')).toBe('-12.50');
  });

  it('renders an absent value as an empty cell', () => {
    expect(csvLiteral(null)).toBe('');
  });
});

describe('csvDate', () => {
  it('writes an ISO timestamp', () => {
    expect(csvDate(new Date('2026-03-04T05:06:07.000Z'))).toBe(
      '2026-03-04T05:06:07.000Z',
    );
  });

  it('renders an absent date as an empty cell', () => {
    expect(csvDate(null)).toBe('');
  });
});

describe('csvLine', () => {
  it('joins cells and terminates the row', () => {
    expect(csvLine(['a', 'b'])).toBe('a,b\r\n');
  });
});
