import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, chunky, Title } from '@/components/ui';
import { Fonts, Ink, Pop, Radius, Spacing, type PopName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { checkPin, makePinRecord, PIN_LENGTH } from '@/world/pin';
import { useWorld } from '@/world/store';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
const KEY_TONES: PopName[] = ['pink', 'yellow', 'sky', 'lime', 'orange', 'purple', 'mint', 'lavender', 'pink'];

/** Wrong tries allowed before the keypad pauses. */
const MAX_TRIES = 5;
const PAUSE_SECONDS = 30;

/** Seconds until the keypad works again, or 0 when it isn't paused. Kept outside the component so render stays pure. */
const secondsLeft = (pausedUntil: number) => Math.max(0, Math.ceil((pausedUntil - Date.now()) / 1000));
const pauseFromNow = () => Date.now() + PAUSE_SECONDS * 1000;

/**
 * The grown-up PIN in front of every parent screen.
 * The first time, the parent picks a PIN and types it twice. After that, it unlocks grown-up mode.
 */
export function PinGate() {
  const t = useTheme();
  const record = useWorld((s) => s.parentPin);
  const setParentPin = useWorld((s) => s.setParentPin);
  const unlock = useWorld((s) => s.setParentUnlocked);
  const [digits, setDigits] = useState('');
  const [firstEntry, setFirstEntry] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [wrongTries, setWrongTries] = useState(0);
  const [pausedUntil, setPausedUntil] = useState(0);
  const [busy, setBusy] = useState(false);

  const creating = !record;
  const title = creating ? (firstEntry ? 'Type the PIN again' : 'Make a grown-up PIN') : 'Enter grown-up PIN';
  const hint = creating
    ? firstEntry
      ? 'Just to make sure it’s right.'
      : `Pick ${PIN_LENGTH} numbers your kids don’t know. You’ll use it to open the grown-up profile.`
    : 'The grown-up profile is locked with a PIN.';

  const submit = async (pin: string) => {
    setBusy(true);
    try {
      if (creating) {
        if (!firstEntry) {
          setFirstEntry(pin);
          setMessage('');
        } else if (pin === firstEntry) {
          setParentPin(await makePinRecord(pin));
          unlock(true);
        } else {
          setFirstEntry(null);
          setMessage('Those didn’t match. Let’s start again.');
        }
        return;
      }
      if (await checkPin(pin, record)) {
        unlock(true);
        return;
      }
      const tries = wrongTries + 1;
      setWrongTries(tries);
      if (tries >= MAX_TRIES) {
        setPausedUntil(pauseFromNow());
        setWrongTries(0);
        setMessage(`Too many tries. Wait ${PAUSE_SECONDS} seconds and try again.`);
      } else {
        setMessage('That’s not the PIN. Try again.');
      }
    } finally {
      setDigits('');
      setBusy(false);
    }
  };

  const press = (key: string) => {
    if (busy) return;
    const wait = secondsLeft(pausedUntil);
    if (wait > 0) {
      setMessage(`Too many tries. Wait ${wait} seconds and try again.`);
      return;
    }
    if (key === 'del') return setDigits((d) => d.slice(0, -1));
    const next = (digits + key).slice(0, PIN_LENGTH);
    setDigits(next);
    if (next.length === PIN_LENGTH) void submit(next);
  };

  return (
    <View style={styles.gate}>
      <Title>{title}</Title>
      <Body muted style={{ textAlign: 'center', maxWidth: 420 }}>
        {hint}
      </Body>
      <View style={styles.dots} accessibilityLabel={`${digits.length} of ${PIN_LENGTH} numbers entered`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <View key={i} style={[styles.dot, { borderColor: t.ink, backgroundColor: i < digits.length ? Pop.purple : t.surfaceAlt }]} />
        ))}
      </View>
      <Text style={[styles.message, { color: t.berry }]} accessibilityLiveRegion="polite">
        {message}
      </Text>
      <View style={styles.keypad}>
        {KEYS.map((key, i) =>
          key ? (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key === 'del' ? 'Delete' : key}
              onPress={() => press(key)}
              style={({ pressed }) => [styles.key, chunky(t, { pressed, depth: 3 }), { backgroundColor: key === 'del' ? t.surfaceAlt : Pop[KEY_TONES[(Number(key) + 8) % 9]] }]}>
              <Text style={[styles.keyText, { color: key === 'del' ? t.text : Ink }]}>{key === 'del' ? '⌫' : key}</Text>
            </Pressable>
          ) : (
            <View key={`gap${i}`} style={styles.key} />
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { alignItems: 'center', gap: Spacing.four, paddingVertical: Spacing.six },
  dots: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5 },
  message: { minHeight: 22, fontSize: 16, fontFamily: Fonts.label },
  keypad: { width: 3 * 76 + 2 * 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  key: { width: 76, height: 64, borderRadius: Radius.large, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 28, fontFamily: Fonts.display },
});
