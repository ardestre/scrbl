import { checkPin, makePinRecord } from '../pin';

jest.mock('expo-crypto', () => ({}));

/** A stand-in hash, so the test doesn't need the native crypto module. */
const fakeDigest = async (text: string) => `h(${text})`;

it('never stores the PIN digits as they are', async () => {
  const record = await makePinRecord('2468', fakeDigest, 'salt');
  expect(record.salt).toBe('salt');
  expect(record.hash).not.toBe('2468');
});

it('accepts the right PIN and rejects others', async () => {
  const record = await makePinRecord('2468', fakeDigest, 'salt');
  expect(await checkPin('2468', record, fakeDigest)).toBe(true);
  expect(await checkPin('1357', record, fakeDigest)).toBe(false);
  expect(await checkPin('24', record, fakeDigest)).toBe(false);
});

it('only accepts 4 digits when making a PIN', async () => {
  await expect(makePinRecord('12a4', fakeDigest, 's')).rejects.toThrow();
  await expect(makePinRecord('12345', fakeDigest, 's')).rejects.toThrow();
});
