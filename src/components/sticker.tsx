import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Ink, Pop, type PopName } from '@/constants/theme';

export type StickerShape = 'burst' | 'flower' | 'sparkle' | 'smile';

/** Points around a circle, alternating between an outer and inner radius. */
function star(points: number, outer: number, inner: number) {
  const d: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    d.push(`${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return d.join('') + 'Z';
}

const BURST = star(14, 46, 37);
const SPARKLE = star(4, 46, 14);
const PETALS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 6;
  return { cx: 50 + 24 * Math.cos(a), cy: 50 + 24 * Math.sin(a) };
});

/**
 * A decorative sticker, like the ones kids put on notebooks. Purely visual, so it's hidden
 * from screen readers.
 */
export function Sticker({
  shape,
  tone,
  size = 56,
  rotate = 0,
  style,
}: {
  shape: StickerShape;
  tone: PopName;
  size?: number;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const fill = Pop[tone];
  const line = { stroke: Ink, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {shape === 'burst' ? <Path d={BURST} fill={fill} {...line} /> : null}
        {shape === 'sparkle' ? <Path d={SPARKLE} fill={fill} {...line} /> : null}
        {shape === 'flower' ? (
          <>
            {PETALS.map((p, i) => (
              <Circle key={i} cx={p.cx} cy={p.cy} r={20} fill={fill} {...line} />
            ))}
            <Circle cx={50} cy={50} r={15} fill={Pop.yellow} {...line} />
          </>
        ) : null}
        {shape === 'smile' ? (
          <>
            <Path d={BURST} fill={fill} {...line} />
            <Circle cx={39} cy={44} r={4.5} fill={Ink} />
            <Circle cx={61} cy={44} r={4.5} fill={Ink} />
            <Path d="M36 58q14 13 28 0" fill="none" {...line} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}
