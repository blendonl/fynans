import {
  hasMatchingMagicBytes,
  isAllowedImageMimeType,
} from './image-upload.helper';

describe('image upload allowlist', () => {
  it('accepts only the exact allowed mime types', () => {
    expect(isAllowedImageMimeType('image/jpeg')).toBe(true);
    expect(isAllowedImageMimeType('image/jpg')).toBe(true);
    expect(isAllowedImageMimeType('image/png')).toBe(true);
  });

  it('rejects mime types the old unanchored regex would have matched', () => {
    expect(isAllowedImageMimeType('text/html;image/png')).toBe(false);
    expect(isAllowedImageMimeType('image/png-evil')).toBe(false);
    expect(isAllowedImageMimeType('application/image/jpeg')).toBe(false);
    expect(isAllowedImageMimeType('image/svg+xml')).toBe(false);
    expect(isAllowedImageMimeType(' image/png')).toBe(false);
  });

  it('accepts buffers whose magic bytes match the declared type', () => {
    expect(hasMatchingMagicBytes(Buffer.from([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg')).toBe(true);
    expect(
      hasMatchingMagicBytes(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
        'image/png',
      ),
    ).toBe(true);
  });

  it('rejects a payload that only claims to be an image', () => {
    const script = Buffer.from('<?php system($_GET["c"]); ?>');

    expect(hasMatchingMagicBytes(script, 'image/jpeg')).toBe(false);
    expect(hasMatchingMagicBytes(script, 'image/png')).toBe(false);
  });

  it('rejects a PNG buffer declared as JPEG', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(hasMatchingMagicBytes(png, 'image/jpeg')).toBe(false);
  });

  it('rejects a buffer shorter than the signature', () => {
    expect(hasMatchingMagicBytes(Buffer.from([0xff, 0xd8]), 'image/jpeg')).toBe(false);
  });
});
