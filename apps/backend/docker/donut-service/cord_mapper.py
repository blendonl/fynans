import re
import logging

logger = logging.getLogger(__name__)

# Date patterns: DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
_DATE_RE = re.compile(r"(\d{2})[-/.](\d{2})[-/.](\d{4})")
# Time patterns: HH:MM or HH:MM:SS
_TIME_RE = re.compile(r"(\d{2}):(\d{2})(?::\d{2})?")


def _extract_str(value) -> str:
    """Extract a string from a value that may be a str, dict, or list."""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for key in ("value", "text", "nm"):
            if key in value and isinstance(value[key], str):
                return value[key].strip()
        parts = [v.strip() for v in value.values() if isinstance(v, str)]
        return " ".join(parts)
    if isinstance(value, list):
        parts = [_extract_str(v) for v in value]
        return " ".join(p for p in parts if p)
    return str(value).strip() if value is not None else ""


def _collect_all_strings(obj) -> list[str]:
    """Recursively collect all string values from a nested structure."""
    strings = []
    if isinstance(obj, str):
        strings.append(obj)
    elif isinstance(obj, dict):
        for v in obj.values():
            strings.extend(_collect_all_strings(v))
    elif isinstance(obj, list):
        for v in obj:
            strings.extend(_collect_all_strings(v))
    return strings


def _extract_date_time(cord_output: dict) -> tuple[str | None, str | None]:
    """Scan all CORD values for date and time patterns."""
    all_strings = _collect_all_strings(cord_output)
    full_text = " ".join(all_strings)

    date = None
    date_match = _DATE_RE.search(full_text)
    if date_match:
        day, month, year = date_match.group(1), date_match.group(2), date_match.group(3)
        if 1 <= int(day) <= 31 and 1 <= int(month) <= 12 and 2000 <= int(year) <= 2099:
            date = f"{day}/{month}/{year}"

    time = None
    time_match = _TIME_RE.search(full_text)
    if time_match:
        hours, minutes = int(time_match.group(1)), int(time_match.group(2))
        if 0 <= hours <= 23 and 0 <= minutes <= 59:
            time = f"{time_match.group(1)}:{time_match.group(2)}"

    return date, time


def _extract_store_name(menu_items: list[dict]) -> str:
    """Try to detect store name from first menu entries that have no valid price."""
    for entry in menu_items[:2]:
        if not isinstance(entry, dict):
            continue
        name = _extract_str(entry.get("nm"))
        if not name:
            continue
        price = _parse_price(entry.get("price"))
        # If entry has a name but no parseable price, it's likely store info
        if price is None:
            # Clean up common suffixes
            cleaned = re.sub(r'\s*(SH\.?P\.?K\.?|SHPK|L\.?L\.?C\.?)\.?\s*$', '', name, flags=re.IGNORECASE)
            cleaned = cleaned.strip('"\'').strip()
            if cleaned:
                return cleaned
    return ""


def map_cord_to_receipt(cord_output: dict) -> dict:
    """Map CORD v2 token output to the ReceiptParsingResult structure."""
    items = []

    menu_items = cord_output.get("menu", [])
    if isinstance(menu_items, dict):
        menu_items = [menu_items]

    store_name = _extract_store_name(menu_items)

    for entry in menu_items:
        if not isinstance(entry, dict):
            continue

        # Skip sub-items (modifiers)
        if entry.get("sub_nm") or entry.get("sub_price"):
            continue

        name = _extract_str(entry.get("nm"))
        if not name:
            continue

        price = _parse_price(entry.get("price"))
        if price is None:
            continue

        # Skip if this entry was used as store name
        if store_name and name.startswith(store_name.strip('"')):
            continue

        quantity = _parse_quantity(entry.get("cnt"))

        items.append({
            "name": name,
            "price": price,
            "quantity": quantity,
        })

    total_amount = _extract_total(cord_output)
    date, time = _extract_date_time(cord_output)

    logger.info(f"Mapped {len(items)} items, store={store_name!r}, date={date}, time={time}")

    return {
        "storeName": store_name,
        "storeLocation": "",
        "items": items,
        "totalAmount": total_amount,
        "date": date,
        "time": time,
    }


def _parse_price(raw) -> float | None:
    if raw is None:
        return None

    raw_str = _extract_str(raw) if not isinstance(raw, (int, float)) else str(raw)
    # Strip currency symbols and whitespace
    cleaned = re.sub(r"[^\d.,\-]", "", raw_str)
    if not cleaned:
        return None

    # Normalize comma as decimal separator
    cleaned = cleaned.replace(",", ".")

    # Handle multiple dots (e.g. "1.234.56" -> take last dot as decimal)
    parts = cleaned.split(".")
    if len(parts) > 2:
        cleaned = "".join(parts[:-1]) + "." + parts[-1]

    try:
        value = float(cleaned)
        return round(value, 2) if value > 0 else None
    except ValueError:
        return None


def _parse_quantity(raw) -> int:
    if raw is None:
        return 1
    raw_str = _extract_str(raw) if not isinstance(raw, (int, float)) else str(raw)
    # Strip trailing "x" from "1 x" format
    raw_str = re.sub(r"\s*x\s*$", "", raw_str, flags=re.IGNORECASE)
    try:
        val = int(float(raw_str))
        return val if val > 0 else 1
    except (ValueError, TypeError):
        return 1


def _extract_total(cord_output: dict) -> float | None:
    # Try total.total_price first
    total_section = cord_output.get("total", {})
    if isinstance(total_section, list):
        total_section = total_section[0] if total_section else {}
    if isinstance(total_section, dict):
        total_price = _parse_price(total_section.get("total_price"))
        if total_price is not None:
            return total_price

    # Fallback to sub_total.subtotal_price
    sub_total_section = cord_output.get("sub_total", {})
    if isinstance(sub_total_section, list):
        sub_total_section = sub_total_section[0] if sub_total_section else {}
    if isinstance(sub_total_section, dict):
        subtotal_price = _parse_price(sub_total_section.get("subtotal_price"))
        if subtotal_price is not None:
            return subtotal_price

    return None
