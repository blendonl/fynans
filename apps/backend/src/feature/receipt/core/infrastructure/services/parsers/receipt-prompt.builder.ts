export function buildReceiptPrompt(ocrText: string): string {
  return `Parse this Kosovo store receipt (Albanian). Return ONLY compact single-line JSON — no newlines, no indentation, no explanation, no markdown fences, no reasoning.

## Line Patterns

**Qty-header** — \`3.115 X 0.59\` or \`2,375 × 2,89\` means qty=first, unit_price=second. NEXT line has the item name. The trailing number on the item line is the LINE TOTAL (qty × unit_price) — NEVER use it as the price. Always use the unit_price from the qty-header.
**Standalone** — item name + price, no qty header. Omit quantity (defaults to 1).
**Glued prices** — trailing \`E\`: remove E, decimal 2 from right. \`184E\`→1.84, \`59E\`→0.59, \`005E\`→0.05. Standard decimals used as-is.
**PLU codes** — \`PLU4\` etc = produce codes. Remove from name.
**PEMEPERIME** = Vegetables/Produce. **QESE PLASTIKE / Kese sherbimi** = bag fee (include it).

## OCR Correction

Fix garbled item names only. Common: \`<\`→K, \`8\`→B. Do NOT modify numbers/prices/dates.

## Skip

Skip non-item lines: totals, tax, payment, fiscal metadata, operator, serial numbers, headers/footers.
Skip keywords: TOTALI, TVSH, KLIENT, ATK, ARTIKUJT, NR SERIAL, KOPJE, FISK, OPERATOR, VEPRIMI, MENYRA PAGESES, SHITESI, LOGIN, NR REFERIMIT, KUPON, SERIK, PAGESE, LLOGARIA.

## Output

JSON object. "price" is ALWAYS the unit price, never the line total. Every item MUST have a "category". Do NOT merge duplicates — if the same item appears on multiple lines, include it each time. Omit "quantity" when 1. Omit "size" when absent. Title Case names. Date=DD/MM/YYYY.
{"storeName":"S","storeLocation":"C","date":"DD/MM/YYYY","time":"HH:MM","total":0,"expenseCategory":"Groceries","items":[{"name":"N","price":0,"quantity":2.5,"category":"Cat","size":{"value":1,"unit":"kg"}}]}

## Example

OCR:
\`\`\`
MARKET EXTRA
Prishtine
DT: 15/02/2026 ORA:14:30
3.115 X 0.59
PEMEPERIME PLU4 1.84E
FLUIDI COLA 2L 0.64E
2,375 x 2,89
Bukuk 1kg Meka 6,86E
QESE PLASTIKE 0.05E
8U<E BARDHË 79E
TOTALI 12.50
\`\`\`
Output:
{"storeName":"Market Extra","storeLocation":"Prishtine","date":"15/02/2026","time":"14:30","total":12.5,"expenseCategory":"Groceries","items":[{"name":"Pemeperime","price":0.59,"quantity":3.115,"category":"Produce"},{"name":"Fluidi Cola","price":0.64,"category":"Beverages","size":{"value":2,"unit":"l"}},{"name":"Bukuk Meka","price":2.89,"quantity":2.375,"category":"Grains & Pasta","size":{"value":1,"unit":"kg"}},{"name":"Qese Plastike","price":0.05,"category":"Household"},{"name":"Buke Bardhe","price":0.79,"category":"Bakery"}]}

---
OCR TEXT:
${ocrText}

Return ONLY the compact single-line JSON object (no newlines, no indentation):`;
}

export function buildItemNameNormalizationPrompt(
  items: Array<{ name: string; category?: string }>,
): string {
  const itemList = JSON.stringify(items);
  return `You are a product name normalization assistant for Kosovo/Albanian grocery receipts.

Given a list of item names extracted from OCR text, fix any remaining OCR artifacts, expand common Albanian abbreviations, and standardize naming.

Rules:
- Fix obvious OCR errors (garbled characters, missing letters)
- Expand abbreviations (e.g. "QUM." → "Qumeshtore")
- Standardize casing (Title Case)
- Keep the name concise — do not add words that aren't implied
- If a name is already correct, return it unchanged
- Use the category hint to help infer correct names

Input: ${itemList}

Return a JSON array with this structure:
[
  { "original": "8U<E MEKA", "corrected": "Buke Meka" }
]

Return ONLY the JSON array, no explanation:`;
}
