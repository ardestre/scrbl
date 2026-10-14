import * as Crypto from 'expo-crypto';

/** The grown-up PIN as saved on the device: never the digits themselves, only a salted hash. */
export type PinRecord = { salt: string; hash: string };

export const PIN_LENGTH = 4;

export const isPinShaped = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

type Digest = (text: string) => Promise<string>;

const sha256: Digest = (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

export async function makePinRecord(pin: string, digest: Digest = sha256, salt: string = Crypto.randomUUID()): Promise<PinRecord> {
  if (!isPinShaped(pin)) throw new Error(`A PIN is ${PIN_LENGTH} digits`);
  return { salt, hash: await digest(`${salt}:${pin}`) };
}

export async function checkPin(pin: string, record: PinRecord, digest: Digest = sha256): Promise<boolean> {
  if (!isPinShaped(pin)) return false;
  return (await digest(`${record.salt}:${pin}`)) === record.hash;
}
