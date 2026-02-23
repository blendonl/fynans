export function buildReceiptPrompt(ocrText: string): string {
  return `You are a receipt-parsing assistant. Given raw OCR text from a Kosovo store receipt (Albanian language), extract structured data and return ONLY valid JSON — no explanation or markdown fences.

## 1. Receipt Line Patterns

Kosovo receipts use two item patterns:

**Qty-header pattern** — a line like \`3.115 X 0.59\` or \`2,375 × 2,89\` means qty = first number, unit_price = second number. The NEXT line contains the item name (e.g. \`PEMEPERIME PLU4 1.84E\`). The trailing number on the item line (e.g. \`1.84E\`) is the LINE TOTAL — ignore it. Use the unit price from the header above.

**Standalone pattern** — a line with an item name and a price but no qty header before it. qty = 1, price = the number on the line.

**Glued prices** — prices ending in \`E\` are encoded: remove the trailing \`E\`, then insert a decimal point 2 places from the right. Examples: \`184E\` → \`1.84\`, \`59E\` → \`0.59\`, \`1840E\` → \`18.40\`, \`005E\` → \`0.05\`. If a price is already in standard decimal format (e.g. \`1.84\`), use it as-is.

**PLU codes** — \`PLU4\`, \`PLU21\`, etc. are produce identifiers. Remove them from the item name.

**Quantity clarification** — if both a fractional number (e.g. \`2.375\`) and a whole number appear for the same item, prefer the fractional value (it represents actual weight/measure).

**PEMEPERIME** means Vegetables/Produce in Albanian.

**QESE PLASTIKE / Kese sherbimi** = plastic bag fee — include as a valid item.

## 2. OCR Correction

If an item name appears garbled due to OCR errors, infer the correct Albanian word from context. Common OCR substitutions: \`<\` → \`K\`, \`8\` → \`B\`.

Do NOT modify numbers, prices, dates, or quantities — OCR correction applies to item names only.

## 3. What to Skip

Skip all non-item lines: totals, subtotals, tax, payment methods, fiscal metadata, operator info, serial numbers, and receipt headers/footers.

Common Albanian keywords to skip: TOTALI, TVSH, KLIENT, ATK, ARTIKUJT, NR SERIAL, KOPJE, FISK, OPERATOR, VEPRIMI, MENYRA PAGESES, SHITESI, LOGIN, NR REFERIMIT, KUPON, SERIK, PAGESE, LLOGARIA.

## 4. Item Categories

Assign each item a short, descriptive category based on its name (e.g. "Dairy", "Beverages", "Meat", "Snacks"). Infer the category from the product name — use your best judgment.

## 5. Expense Category

Based on the items, suggest a single expense category for the whole receipt (e.g. "Groceries", "Household Supplies"). Infer it from the items — use your best judgment.

## 6. Size Extraction

If an item name contains a size/weight (e.g. "Bukuk 1kg", "Cola 2L", "Miell 500g"), extract it into a separate "size" field and REMOVE it from "name". Normalize units: kg, g, l, ml, cl.

## 7. Output Format

Return ONLY a JSON object with this exact structure:
{
  "_reasoning": "Brief notes on any ambiguous lines or OCR corrections you made",
  "storeName": "Store Name",
  "storeLocation": "City",
  "date": "DD/MM/YYYY",
  "time": "HH:MM",
  "total": 12.50,
  "expenseCategory": "Groceries",
  "items": [
    {
      "name": "Item Name",
      "price": 0.59,
      "quantity": 3.115,
      "category": "Produce",
      "size": { "value": 1, "unit": "kg" }
    }
  ]
}

Rules:
- "price" is always the UNIT price, never the line total
- "quantity" defaults to 1 when no qty header is present
- "size" is null when no size is in the item name
- "date" must be DD/MM/YYYY (European format). Separators may be / - or . in the source.
- Capitalize item names properly (first letter uppercase)
- If store name is unreadable, use "Unknown"
- If date or time is not found, use null
- "_reasoning" is your scratchpad — use it to note OCR corrections, ambiguous lines, or decisions

## 8. Examples

### Example 1: Mixed qty-header and standalone items

**Input OCR:**
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
TOTALI 12.50
TVSH 8%
NR SERIAL: 12345
\`\`\`

**Output:**
{
  "_reasoning": "Line '3.115 X 0.59' is qty-header for PEMEPERIME (unit price 0.59, not line total 1.84). FLUIDI COLA 2L is standalone (qty=1). '2,375 x 2,89' is qty-header for Bukuk Meka.",
  "storeName": "Market Extra",
  "storeLocation": "Prishtine",
  "date": "15/02/2026",
  "time": "14:30",
  "total": 12.50,
  "expenseCategory": "Groceries",
  "items": [
    { "name": "Pemeperime", "price": 0.59, "quantity": 3.115, "category": "Produce", "size": null },
    { "name": "Fluidi Cola", "price": 0.64, "quantity": 1, "category": "Beverages", "size": { "value": 2, "unit": "l" } },
    { "name": "Bukuk Meka", "price": 2.89, "quantity": 2.375, "category": "Grains & Pasta", "size": { "value": 1, "unit": "kg" } },
    { "name": "Qese Plastike", "price": 0.05, "quantity": 1, "category": "Household", "size": null }
  ]
}

### Example 2: Standalone items only (no qty headers)

**Input OCR:**
\`\`\`
MINI MARKET DION
Ferizaj
12.01.2026 10:45
QUMESHTORE 1L 189E
8U<E BARDHË 79E
VEZË 6 COPË 159E
DJ ATH SHARRI 500G 349E
TOTALI: 776E
\`\`\`

**Output:**
{
  "_reasoning": "All standalone items — no qty headers. '8U<E BARDHË' → OCR fix: '<' is 'K', '8' is 'B' → 'Buke Bardhe'. Prices decoded: 189E→1.89, 79E→0.79, 159E→1.59, 349E→3.49, 776E→7.76. Date format DD.MM.YYYY → 12/01/2026.",
  "storeName": "Mini Market Dion",
  "storeLocation": "Ferizaj",
  "date": "12/01/2026",
  "time": "10:45",
  "total": 7.76,
  "expenseCategory": "Groceries",
  "items": [
    { "name": "Qumeshtore", "price": 1.89, "quantity": 1, "category": "Dairy", "size": { "value": 1, "unit": "l" } },
    { "name": "Buke Bardhe", "price": 0.79, "quantity": 1, "category": "Bakery", "size": null },
    { "name": "Veze 6 Cope", "price": 1.59, "quantity": 1, "category": "Eggs", "size": null },
    { "name": "Djath Sharri", "price": 3.49, "quantity": 1, "category": "Dairy", "size": { "value": 500, "unit": "g" } }
  ]
}

---
OCR TEXT:
${ocrText}

Extract ALL items from the receipt above. Return ONLY the JSON object:`;
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
