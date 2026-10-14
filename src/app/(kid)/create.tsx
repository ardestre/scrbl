import { router } from 'expo-router';

import { Body, Button, Screen, Title } from '@/components/ui';
import { ChatStep, DrawStep, KindPicker, MakingStep, PickStep, SavedStep } from '@/features/create/steps';
import { useCreateFlow } from '@/features/create/use-create-flow';
import { useWorld } from '@/world/store';

export default function CreateScreen() {
  const flow = useCreateFlow();
  const creationsLeft = useWorld((s) => s.credits.creationsLeft);
  const { draft } = flow;

  if (!draft && creationsLeft <= 0) {
    return (
      <Screen>
        <Title>You’ve made so much this month!</Title>
        <Body muted>Ask a grown-up to add more creations.</Body>
        <Button label="Ask a grown-up" onPress={() => router.navigate('/story-time')} style={{ alignSelf: 'flex-start' }} />
      </Screen>
    );
  }

  // The drawing step doesn't scroll, so a drawing finger never scrolls the page instead.
  return (
    <Screen scroll={draft?.step !== 'draw'}>
      {!draft ? <KindPicker onPick={flow.start} /> : null}
      {draft?.step === 'draw' ? <DrawStep flow={flow} draft={draft} /> : null}
      {draft?.step === 'chat' ? <ChatStep flow={flow} draft={draft} /> : null}
      {draft?.step === 'making' ? <MakingStep draft={draft} /> : null}
      {draft?.step === 'pick' ? <PickStep flow={flow} draft={draft} /> : null}
      {draft?.step === 'saved' ? <SavedStep flow={flow} draft={draft} /> : null}
    </Screen>
  );
}
