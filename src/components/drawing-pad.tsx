import { useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Paper, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PAPER_SIZE, toPath } from '@/world/strokes';
import type { Point, Stroke } from '@/world/types';

type Props = {
  strokes: Stroke[];
  color: string;
  width: number;
  onStrokeEnd: (stroke: Stroke) => void;
};

/** Minimum distance between recorded points, in paper units. Keeps saved drawings small. */
const MIN_STEP = 4;

/**
 * Square drawing paper. Works with a finger, Apple Pencil and a mouse.
 * Touch positions are converted to paper units, so drawings look the same on any screen.
 */
export function DrawingPad({ strokes, color, width, onStrokeEnd }: Props) {
  const t = useTheme();
  const size = useRef(1);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const currentRef = useRef<Stroke | null>(null);

  const toPaper = (e: GestureResponderEvent): Point => {
    const k = PAPER_SIZE / size.current;
    const clamp = (v: number) => Math.max(0, Math.min(PAPER_SIZE, Math.round(v * k)));
    return [clamp(e.nativeEvent.locationX), clamp(e.nativeEvent.locationY)];
  };

  const begin = (e: GestureResponderEvent) => {
    const stroke = { color, width, points: [toPaper(e)] };
    currentRef.current = stroke;
    setCurrent(stroke);
  };

  const move = (e: GestureResponderEvent) => {
    const stroke = currentRef.current;
    if (!stroke) return;
    const p = toPaper(e);
    const last = stroke.points[stroke.points.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < MIN_STEP) return;
    const next = { ...stroke, points: [...stroke.points, p] };
    currentRef.current = next;
    setCurrent(next);
  };

  const end = () => {
    const stroke = currentRef.current;
    currentRef.current = null;
    setCurrent(null);
    if (stroke) onStrokeEnd(stroke);
  };

  return (
    <View
      accessibilityLabel="Drawing paper"
      onLayout={(e: LayoutChangeEvent) => (size.current = Math.max(1, e.nativeEvent.layout.width))}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={begin}
      onResponderMove={move}
      onResponderRelease={end}
      onResponderTerminate={end}
      style={[styles.pad, { borderColor: t.ink, boxShadow: `5px 5px 0px ${t.ink}` }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${PAPER_SIZE} ${PAPER_SIZE}`} pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={PAPER_SIZE} height={PAPER_SIZE} fill={Paper} />
        {[...strokes, ...(current ? [current] : [])].map((s, i) => (
          <Path key={i} d={toPath(s.points)} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: '100%',
    maxWidth: 640,
    aspectRatio: 1,
    borderRadius: Radius.large,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: Paper,
  },
});
