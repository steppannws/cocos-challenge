import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

// Outline icons (24×24 grid, stroke-based; paths after Lucide, ISC license).
const icons = {
  market: ['M3 17l6-6 4 4 8-8', 'M14 7h7v7'],
  portfolio: ['M21.21 15.89A10 10 0 1 1 8 2.83', 'M22 12A10 10 0 0 0 12 2v10z'],
  orders: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  account: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'circle:12,7,4'],
  search: ['circle:11,11,8', 'm21 21-4.35-4.35'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  check: ['M20 6 9 17l-5-5'],
  clock: ['circle:12,12,10', 'M12 6v6l4 2'],
  alert: ['circle:12,12,10', 'M12 8v4', 'M12 16h.01'],
} as const;

export type IconName = keyof typeof icons;

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 24, color = colors.text }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {icons[name].map((d) => {
        if (d.startsWith('circle:')) {
          const [cx, cy, r] = d.slice(7).split(',');
          return <Circle key={d} cx={cx} cy={cy} r={r} />;
        }
        return <Path key={d} d={d} />;
      })}
    </Svg>
  );
}
