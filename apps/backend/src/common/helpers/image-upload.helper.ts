export const ALLOWED_RECEIPT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export const MAX_RECEIPT_UPLOAD_BYTES = 10 * 1024 * 1024;

const MAGIC_BYTES: Record<string, readonly number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/jpg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};

export function isAllowedImageMimeType(mimeType: string): boolean {
  return (ALLOWED_RECEIPT_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function hasMatchingMagicBytes(
  buffer: Buffer,
  mimeType: string,
): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    return false;
  }

  return signatures.some(
    (signature) =>
      buffer.length >= signature.length &&
      signature.every((byte, index) => buffer[index] === byte),
  );
}
