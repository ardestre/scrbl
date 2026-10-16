import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import type { CreationKind } from '@/world/types';

const INK = '#231F20';

export function KindIcon({ kind, size = 64 }: { kind: CreationKind; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {kind === 'character' ? (
        <>
          <Circle cx={32} cy={36} r={20} fill="#4DABF7" stroke={INK} strokeWidth={3} />
          <Path d="M20 18 32 4l12 14z" fill="#FF6B6B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <Circle cx={25} cy={34} r={3} fill={INK} />
          <Circle cx={39} cy={34} r={3} fill={INK} />
          <Path d="M25 43q7 6 14 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </>
      ) : null}
      {kind === 'place' ? (
        <>
          <Path d="M6 56 26 18h12l20 38z" fill="#F783AC" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <Ellipse cx={32} cy={18} rx={7} ry={3} fill="#FFA94D" stroke={INK} strokeWidth={2.5} />
          <Circle cx={52} cy={12} r={6} fill="#FFD43B" stroke={INK} strokeWidth={2.5} />
        </>
      ) : null}
      {kind === 'pet' ? (
        <>
          <Ellipse cx={28} cy={34} rx={18} ry={13} fill="#FFA94D" stroke={INK} strokeWidth={3} />
          <Path d="M45 34 58 24v20z" fill="#FFD43B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <Circle cx={21} cy={31} r={3} fill={INK} />
          <Circle cx={12} cy={12} r={4} fill="none" stroke="#4DABF7" strokeWidth={2.5} />
        </>
      ) : null}
      {kind === 'object' ? (
        <>
          <Path d="M14 52 44 22" stroke="#7048E8" strokeWidth={6} strokeLinecap="round" />
          <Path d="m48 6 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFD43B" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </>
      ) : null}
    </Svg>
  );
}
