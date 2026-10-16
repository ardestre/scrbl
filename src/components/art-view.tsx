import { memo, useId, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { PALETTES } from '@/world/catalog';
import { bounds, isClosed, luminance, mix, PAPER_SIZE, seeded, toPath, type Box } from '@/world/strokes';
import type { ArtStyleId, MoodId, Point, Stroke } from '@/world/types';

export type ArtSource = {
  sketch: Stroke[];
  style: ArtStyleId;
  mood: MoodId;
  variant: number;
  artUri?: string;
};

type Props = {
  art: ArtSource;
  /** 'sketch' shows the kid's original lines; 'art' shows the finished art. */
  mode?: 'art' | 'sketch';
  /** Draw in this style instead of the creation's own, so a whole book shares one look. */
  styleOverride?: ArtStyleId;
  background?: boolean;
  /** Width divided by height. */
  aspect?: number;
  style?: StyleProp<ViewStyle>;
};

const W = PAPER_SIZE;
const INK = '#15132B';

/**
 * Draws a creation. When the art service has returned an image, that image is shown.
 * Otherwise the art is previewed on device by restyling the kid's own lines.
 */
export const ArtView = memo(function ArtView({ art, mode = 'art', styleOverride, background = true, aspect = 1, style }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const H = W / aspect;
  const artStyle = styleOverride ?? art.style;
  const showImage = mode === 'art' && art.artUri && !styleOverride;

  const drawing = useMemo(() => {
    if (showImage) return null;
    if (mode === 'sketch') return <SketchLines strokes={art.sketch} />;
    return <StyledArt id={id} art={art} styleId={artStyle} background={background} height={H} />;
  }, [showImage, mode, art, artStyle, background, H, id]);

  if (showImage) {
    return (
      <View style={[{ aspectRatio: aspect, width: '100%' }, style]}>
        <Image source={{ uri: art.artUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>
    );
  }
  return (
    <View style={[{ aspectRatio: aspect, width: '100%' }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
        {mode === 'sketch' && background ? <Rect x={0} y={0} width={W} height={H} fill="#FFFFFF" /> : null}
        {drawing}
      </Svg>
    </View>
  );
});

function SketchLines({ strokes }: { strokes: Stroke[] }) {
  return (
    <G>
      {strokes.map((s, i) => (
        <Path key={i} d={toPath(s.points)} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
    </G>
  );
}

function fit(strokes: Stroke[], width: number, height: number, pad: number) {
  const bb = bounds(strokes);
  const s = Math.min((width - 2 * pad) / bb.w, (height - 2 * pad) / bb.h, width / 380);
  return { s, ox: width / 2 - (bb.x + bb.w / 2) * s, oy: height / 2 - (bb.y + bb.h / 2) * s, bb };
}

const wobble = (points: Point[], amount: number, rnd: () => number): Point[] =>
  points.map(([x, y]) => [x + (rnd() - 0.5) * amount, y + (rnd() - 0.5) * amount]);

function StyledArt({ id, art, styleId, background, height }: { id: string; art: ArtSource; styleId: ArtStyleId; background: boolean; height: number }) {
  const rnd = seeded(art.variant * 9973 + art.sketch.length * 31 + 11);
  const palette = PALETTES[art.mood] ?? PALETTES.bright;
  const pad = Math.min(W, height) * (background ? 0.12 : 0.06);
  const T = fit(art.sketch, W, height, pad);
  const shapes = art.sketch.map((stroke, i) => {
    const sb = bounds([stroke]);
    const dark = luminance(stroke.color) < 0.3;
    const small = Math.max(sb.w, sb.h) < 70;
    const base = dark
      ? palette[(i + art.variant) % palette.length]
      : mix(stroke.color, palette[(i + art.variant * 2) % palette.length], 0.18 + art.variant * 0.14);
    return { stroke, sb, dark, small, base, closed: isClosed(stroke) };
  });

  return (
    <G>
      {background ? <Backdrop id={id} styleId={styleId} palette={palette} night={art.mood === 'night'} height={height} rnd={rnd} /> : null}
      <G transform={`translate(${T.ox} ${T.oy}) scale(${T.s})`}>
        {styleId === 'storybook' && background ? <GroundShadow bb={T.bb} /> : null}
        <Defs>
          {shapes.map(({ base, dark, small }, i) => {
            const fill = dark && small ? '#1D1B2E' : base;
            return (
              <LinearGradient key={i} id={`${id}g${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={mix(fill, '#FFFFFF', 0.35)} />
                <Stop offset="1" stopColor={fill} />
              </LinearGradient>
            );
          })}
        </Defs>
        {shapes.map((shape, i) => (
          <StyledStroke key={i} index={i} gradientId={`${id}g${i}`} styleId={styleId} rnd={rnd} {...shape} />
        ))}
      </G>
    </G>
  );
}

function GroundShadow({ bb }: { bb: Box }) {
  return <Ellipse cx={bb.x + bb.w / 2} cy={bb.y + bb.h + 8} rx={bb.w * 0.42} ry={Math.max(8, bb.w * 0.06)} fill="rgba(20,20,50,0.13)" />;
}

type StrokeShape = {
  index: number;
  gradientId: string;
  styleId: ArtStyleId;
  rnd: () => number;
  stroke: Stroke;
  sb: Box;
  dark: boolean;
  small: boolean;
  base: string;
  closed: boolean;
};

function StyledStroke({ gradientId, styleId, rnd, stroke, sb, dark, small, base, closed }: StrokeShape) {
  const w = stroke.width;
  const d = toPath(stroke.points, closed);
  const eye = closed && dark && small;
  const fill = eye ? '#1D1B2E' : base;
  const glint = eye ? <Circle cx={sb.x + sb.w * 0.35} cy={sb.y + sb.h * 0.32} r={Math.max(3, sb.w * 0.16)} fill="#FFFFFF" /> : null;

  if (closed) {
    if (styleId === 'cartoon') {
      return (
        <G>
          <Path d={d} fill={fill} stroke={INK} strokeWidth={w * 2.2} strokeLinejoin="round" />
          {!small ? (
            <Ellipse cx={sb.x + sb.w * 0.3} cy={sb.y + sb.h * 0.25} rx={sb.w * 0.08} ry={sb.h * 0.05} fill="rgba(255,255,255,0.55)" transform={`rotate(-28 ${sb.x + sb.w * 0.3} ${sb.y + sb.h * 0.25})`} />
          ) : null}
          {glint}
        </G>
      );
    }
    if (styleId === 'watercolor') {
      return (
        <G>
          {[0, 1, 2].map((k) => (
            <Path key={k} d={toPath(wobble(stroke.points, 14, rnd), true)} fill={fill} opacity={0.32} />
          ))}
          <Path d={toPath(wobble(stroke.points, 3, rnd), true)} fill="none" stroke={mix(fill, '#2B2140', 0.5)} strokeWidth={w * 0.7} opacity={0.85} strokeLinejoin="round" />
          {glint}
        </G>
      );
    }
    return (
      <G>
        <Path d={d} fill="rgba(20,20,50,0.2)" transform="translate(0 8)" />
        <Path d={d} fill={`url(#${gradientId})`} stroke={mix(fill, '#000000', 0.45)} strokeWidth={w * 0.9} strokeLinejoin="round" />
        {glint}
      </G>
    );
  }

  if (styleId === 'cartoon') {
    return (
      <G>
        <Path d={d} fill="none" stroke={INK} strokeWidth={w * 2.3} strokeLinecap="round" strokeLinejoin="round" />
        {!dark ? <Path d={d} fill="none" stroke={base} strokeWidth={w * 1.1} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </G>
    );
  }
  if (styleId === 'watercolor') {
    return (
      <Path d={toPath(wobble(stroke.points, 4, rnd))} fill="none" stroke={dark ? '#3B2F4F' : stroke.color} strokeWidth={w * 0.8} opacity={0.8} strokeLinecap="round" strokeLinejoin="round" />
    );
  }
  return (
    <Path d={d} fill="none" stroke={dark ? '#3A2E3A' : mix(stroke.color, '#000000', 0.15)} strokeWidth={w * 1.15} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function Backdrop({ id, styleId, palette, night, height: H, rnd }: { id: string; styleId: ArtStyleId; palette: string[]; night: boolean; height: number; rnd: () => number }) {
  if (styleId === 'cartoon') {
    const step = W / 14;
    const dots: { x: number; y: number }[] = [];
    for (let y = step / 2, row = 0; y < H; y += step, row++) {
      for (let x = (row % 2) * (step / 2); x < W; x += step) dots.push({ x, y });
    }
    return (
      <G>
        <Rect x={0} y={0} width={W} height={H} fill={night ? '#3B2F7A' : mix(palette[3], '#FFFFFF', 0.35)} />
        {dots.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={step * 0.16} fill="rgba(255,255,255,0.18)" />
        ))}
      </G>
    );
  }
  if (styleId === 'watercolor') {
    const blobs = Array.from({ length: 6 }, (_, i) => ({ x: rnd() * W, y: rnd() * H, r: W * (0.2 + rnd() * 0.2), c: palette[i % palette.length] }));
    return (
      <G>
        <Rect x={0} y={0} width={W} height={H} fill="#FBF8F1" />
        {blobs.map((b, i) => (
          <G key={i}>
            <Circle cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={0.08} />
            <Circle cx={b.x} cy={b.y} r={b.r * 0.75} fill={b.c} opacity={0.08} />
            <Circle cx={b.x} cy={b.y} r={b.r * 0.5} fill={b.c} opacity={0.08} />
          </G>
        ))}
      </G>
    );
  }
  // Storybook, and the default for styles that don't have a preview yet.
  const clouds = Array.from({ length: 4 }, () => ({ x: rnd() * W, y: rnd() * H * 0.45, rx: W * (0.12 + rnd() * 0.1) }));
  const stars = night ? Array.from({ length: 40 }, () => ({ x: rnd() * W, y: rnd() * H * 0.7, r: rnd() * 2.5 + 0.8 })) : [];
  return (
    <G>
      <Defs>
        <LinearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night ? '#272B66' : mix(palette[3], '#FFFFFF', 0.72)} />
          <Stop offset="1" stopColor={night ? '#151838' : mix(palette[1], '#FFFFFF', 0.55)} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${id}sky)`} />
      {clouds.map((c, i) => (
        <Ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={H * 0.05} fill={night ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)'} />
      ))}
      {stars.map((s, i) => (
        <Circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="#FFF3BF" />
      ))}
      <Path d={`M0 ${H * 0.82}Q${W * 0.5} ${H * 0.74} ${W} ${H * 0.84}L${W} ${H}L0 ${H}Z`} fill={night ? '#1E2250' : mix(palette[2], '#FFFFFF', 0.45)} />
    </G>
  );
}
