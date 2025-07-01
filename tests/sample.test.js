//
// Sample Jest test for backend initialization
//

// PUBLIC_INTERFACE
describe('Sample Test for Backend', () => {
  /** This is a public test to verify Jest is set up correctly. */
  test('Basic arithmetic: 2 + 2 = 4', () => {
    expect(2 + 2).toBe(4);
  });

  /** Example of asynchronous test */
  test('Promise resolves to true', async () => {
    const p = Promise.resolve(true);
    await expect(p).resolves.toBe(true);
  });
});
