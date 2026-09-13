export function firstCallArgument<T>(mock: jest.Mock): T {
  const [argument] = mock.mock.calls[0] as [T];
  return argument;
}

export function callArguments<T>(mock: jest.Mock): T[] {
  return (mock.mock.calls as [T][]).map(([argument]) => argument);
}
