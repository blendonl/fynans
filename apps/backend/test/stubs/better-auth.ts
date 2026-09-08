export const betterAuth = (): Record<string, unknown> => ({
  api: {},
  handler: () => Promise.resolve(null),
  options: {},
});

export const prismaAdapter = (): Record<string, unknown> => ({});

export const bearer = (): Record<string, unknown> => ({ id: 'bearer' });
