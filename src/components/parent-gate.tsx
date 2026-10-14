import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Button, Row, Title } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useWorld } from '@/world/store';

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 4 + Math.floor(Math.random() * 5);
  const answer = a + b;
  const options = [answer, answer + 2, answer - 3].sort(() => Math.random() - 0.5);
  return { a, b, options };
}

/** A simple grown-up check in front of parent screens. Real verified parental consent happens at sign-up. */
export function ParentGate() {
  const unlock = useWorld((s) => s.setParentUnlocked);
  const [wrong, setWrong] = useState(false);
  const [{ a, b, options }, setQuestion] = useState(makeQuestion);
  return (
    <View style={styles.gate}>
      <Title>Grown-ups only</Title>
      <Body muted>To open this, answer: what is {a} + {b}?</Body>
      <Row style={{ justifyContent: 'center' }}>
        {options.map((n) => (
          <Button
            key={n}
            kind="ghost"
            label={String(n)}
            style={{ minWidth: 80 }}
            onPress={() => {
              if (n === a + b) unlock(true);
              else {
                setWrong(true);
                setQuestion(makeQuestion());
              }
            }}
          />
        ))}
      </Row>
      <Body muted>{wrong ? 'Not quite. Try this one!' : ' '}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { alignItems: 'center', gap: Spacing.four, paddingVertical: Spacing.six * 2 },
});
