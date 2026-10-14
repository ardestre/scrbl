import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'create' | 'art' | 'books' | 'story';

export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: ColorValue; size?: number }) {
  const common = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'create' ? (
        <>
          <Path d="M4 20l4-1 11-11-3-3L5 16z" {...common} />
          <Path d="M14 7l3 3" {...common} />
        </>
      ) : null}
      {name === 'art' ? (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={3} {...common} />
          <Circle cx={9} cy={10} r={2} {...common} />
          <Path d="M3 17l5-4 4 3 3-2 6 4" {...common} />
        </>
      ) : null}
      {name === 'books' ? (
        <>
          <Path d="M4 5h5v15H4zM10 5h5v15h-5z" {...common} />
          <Path d="M16 6l4-1 2 14-4 1z" {...common} />
        </>
      ) : null}
      {name === 'story' ? (
        <>
          <Path d="M12 6c-2-2-5-2-8-1v14c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1z" {...common} />
          <Path d="M12 6v14" {...common} />
        </>
      ) : null}
    </Svg>
  );
}
