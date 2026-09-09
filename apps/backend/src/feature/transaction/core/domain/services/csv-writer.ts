const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];
const NEEDS_QUOTING = /[",\n\r]/;

export function csvText(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return quote(defuseFormula(value));
}

export function csvLiteral(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return quote(String(value));
}

export function csvDate(value: Date | null | undefined): string {
  return value ? value.toISOString() : '';
}

export function csvLine(cells: string[]): string {
  return `${cells.join(',')}\r\n`;
}

function defuseFormula(value: string): string {
  return FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))
    ? `'${value}`
    : value;
}

function quote(value: string): string {
  return NEEDS_QUOTING.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
