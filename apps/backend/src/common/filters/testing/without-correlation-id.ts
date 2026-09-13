export function withoutCorrelationId(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const { correlationId: _correlationId, ...rest } = body;
  return rest;
}
