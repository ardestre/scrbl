import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { ArtView } from '@/components/art-view';
import { Ink, Pop } from '@/constants/theme';
import { useWorld } from '@/world/store';
import type { AvatarId, Profile } from '@/world/types';

const INK = Ink;

/** Tile colours are the bright Pop sticker colours from constants/theme. */
export const AVATARS: { id: AvatarId; name: string; background: string }[] = [
  { id: 'blob', name: 'Blob', background: Pop.sky },
  { id: 'dragon', name: 'Dragon', background: Pop.pink },
  { id: 'robot', name: 'Robot', background: Pop.yellow },
  { id: 'cat', name: 'Cat', background: Pop.purple },
  { id: 'alien', name: 'Alien', background: Pop.lime },
  { id: 'bunny', name: 'Bunny', background: Pop.lavender },
  { id: 'dino', name: 'Dino', background: Pop.orange },
  { id: 'owl', name: 'Owl', background: Pop.mint },
];

const background = (id: AvatarId) => AVATARS.find((a) => a.id === id)?.background ?? Pop.sky;

/** A profile's icon: one of the kid's own drawings if they picked one, otherwise a built-in character. */
export function ProfileAvatar({ profile, size }: { profile: Profile; size: number }) {
  const art = useWorld((s) => (profile.avatarCreationId ? s.creations.find((c) => c.id === profile.avatarCreationId) : undefined));
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.16, overflow: 'hidden' }}>
      {art ? <ArtView art={art} /> : <CharacterAvatar id={profile.avatar} size={size} />}
    </View>
  );
}

export function CharacterAvatar({ id, size }: { id: AvatarId; size: number }) {
  const line = { stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} fill={background(id)} />
      <Circle cx={18} cy={20} r={10} fill="rgba(255,255,255,0.18)" />
      <Circle cx={86} cy={84} r={16} fill="rgba(255,255,255,0.14)" />
      {id === 'blob' ? (
        <>
          <Path d="M22 82c-6-30 6-58 28-58s34 28 28 58z" fill="#E7F5FF" {...line} />
          <Circle cx={40} cy={52} r={6} fill={INK} />
          <Circle cx={60} cy={52} r={6} fill={INK} />
          <Circle cx={42} cy={50} r={2} fill="#FFF" />
          <Circle cx={62} cy={50} r={2} fill="#FFF" />
          <Path d="M40 66q10 8 20 0" fill="none" {...line} />
        </>
      ) : null}
      {id === 'dragon' ? (
        <>
          <Path d="M30 32l-6-16 14 10M70 32l6-16-14 10" fill="#FFE066" {...line} />
          <Ellipse cx={50} cy={56} rx={30} ry={28} fill="#69DB7C" {...line} />
          <Ellipse cx={50} cy={70} rx={16} ry={10} fill="#B2F2BB" {...line} />
          <Circle cx={44} cy={70} r={2} fill={INK} />
          <Circle cx={56} cy={70} r={2} fill={INK} />
          <Circle cx={38} cy={48} r={6} fill="#FFF" {...line} />
          <Circle cx={62} cy={48} r={6} fill="#FFF" {...line} />
          <Circle cx={39} cy={49} r={2.5} fill={INK} />
          <Circle cx={63} cy={49} r={2.5} fill={INK} />
        </>
      ) : null}
      {id === 'robot' ? (
        <>
          <Line x1={50} y1={26} x2={50} y2={14} {...line} />
          <Circle cx={50} cy={12} r={5} fill="#FF6B6B" {...line} />
          <Rect x={22} y={26} width={56} height={52} rx={10} fill="#DEE2E6" {...line} />
          <Rect x={32} y={40} width={14} height={12} rx={3} fill="#74C0FC" {...line} />
          <Rect x={54} y={40} width={14} height={12} rx={3} fill="#74C0FC" {...line} />
          <Path d="M36 64h28" {...line} />
          <Path d="M42 64v4M50 64v4M58 64v4" {...line} />
        </>
      ) : null}
      {id === 'cat' ? (
        <>
          <Path d="M26 44l2-24 16 14M74 44l-2-24-16 14" fill="#FFA94D" {...line} />
          <Circle cx={50} cy={56} r={28} fill="#FFA94D" {...line} />
          <Ellipse cx={40} cy={52} rx={4} ry={6} fill={INK} />
          <Ellipse cx={60} cy={52} rx={4} ry={6} fill={INK} />
          <Path d="M47 62h6l-3 4z" fill="#F783AC" {...line} />
          <Path d="M50 66q-4 6-9 3M50 66q4 6 9 3" fill="none" {...line} />
          <Path d="M20 60h14M20 68l14-3M80 60H66M80 68l-14-3" {...line} strokeWidth={2.5} />
        </>
      ) : null}
      {id === 'alien' ? (
        <>
          <Path d="M38 26l-8-12M62 26l8-12" {...line} />
          <Circle cx={29} cy={13} r={4} fill="#FFE066" {...line} />
          <Circle cx={71} cy={13} r={4} fill="#FFE066" {...line} />
          <Ellipse cx={50} cy={54} rx={28} ry={32} fill="#C0EB75" {...line} />
          <Ellipse cx={39} cy={50} rx={9} ry={12} fill={INK} transform="rotate(-20 39 50)" />
          <Ellipse cx={61} cy={50} rx={9} ry={12} fill={INK} transform="rotate(20 61 50)" />
          <Circle cx={37} cy={46} r={3} fill="#FFF" />
          <Circle cx={59} cy={46} r={3} fill="#FFF" />
          <Path d="M44 72q6 4 12 0" fill="none" {...line} />
        </>
      ) : null}
      {id === 'bunny' ? (
        <>
          <Ellipse cx={38} cy={24} rx={8} ry={20} fill="#FFFFFF" {...line} />
          <Ellipse cx={62} cy={24} rx={8} ry={20} fill="#FFFFFF" {...line} />
          <Ellipse cx={38} cy={26} rx={3.5} ry={12} fill="#FCC2D7" />
          <Ellipse cx={62} cy={26} rx={3.5} ry={12} fill="#FCC2D7" />
          <Circle cx={50} cy={60} r={26} fill="#FFFFFF" {...line} />
          <Circle cx={41} cy={56} r={4} fill={INK} />
          <Circle cx={59} cy={56} r={4} fill={INK} />
          <Ellipse cx={50} cy={65} rx={4} ry={3} fill="#F783AC" />
          <Circle cx={34} cy={66} r={4} fill="#FFC9C9" />
          <Circle cx={66} cy={66} r={4} fill="#FFC9C9" />
        </>
      ) : null}
      {id === 'dino' ? (
        <>
          <Path d="M30 30l6-12 6 10 8-12 8 12 6-10 6 12" fill="#FFE066" {...line} />
          <Rect x={22} y={30} width={56} height={50} rx={24} fill="#B197FC" {...line} />
          <Circle cx={40} cy={50} r={5} fill={INK} />
          <Circle cx={60} cy={50} r={5} fill={INK} />
          <Circle cx={41.5} cy={48.5} r={1.8} fill="#FFF" />
          <Circle cx={61.5} cy={48.5} r={1.8} fill="#FFF" />
          <Path d="M36 64q14 10 28 0" fill="#FFF" {...line} />
          <Path d="M44 66l2 4 2-4M52 66l2 4 2-4" fill="none" {...line} strokeWidth={2} />
        </>
      ) : null}
      {id === 'owl' ? (
        <>
          <Path d="M26 30l10 8M74 30l-10 8" {...line} />
          <Ellipse cx={50} cy={58} rx={28} ry={30} fill="#A9744F" {...line} />
          <Ellipse cx={50} cy={70} rx={16} ry={14} fill="#E6C9A8" />
          <Circle cx={39} cy={50} r={10} fill="#FFF" {...line} />
          <Circle cx={61} cy={50} r={10} fill="#FFF" {...line} />
          <Circle cx={39} cy={50} r={4.5} fill={INK} />
          <Circle cx={61} cy={50} r={4.5} fill={INK} />
          <Path d="M46 60l4 6 4-6z" fill="#FFA94D" {...line} />
        </>
      ) : null}
    </Svg>
  );
}
