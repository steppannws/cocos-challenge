import { useRef, useState } from 'react';
import { Animated, Easing, StatusBar, useWindowDimensions } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Svg, { Circle, Path } from 'react-native-svg';
import { brand } from '@/theme';
import { MARK_SIZE, styles } from './styles';

type Props = { onHidden: () => void };

// Exit style: 'iris' closes the navy into the mark and reveals the app from the edges;
// 'fade' is the plain scale-and-fade.
const EXIT: 'iris' | 'fade' = 'fade';

// Geometry from src/assets/brand/mark.svg (120-unit grid). The arc is 272° of a 36 radius: 171 units.
const C_PATH = 'M82 37 A36 36 0 1 0 82 87';
const C_LENGTH = 171;
const DOT = { cx: 97, cy: 24, r: 10 };

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The native splash is plain navy. First React frame: the same navy (the disc). Then the C draws in,
// the mint point pops, a short hold, and the exit hands over to the app. The parent unmounts us after.
export function AnimatedSplash({ onHidden }: Props) {
  const { width, height } = useWindowDimensions();
  // SVG props animate on the JS thread; the views below use the native driver. Separate values, never mixed.
  // Starts 10 past the length: the dash's round end cap (half the stroke) would otherwise show as a dot.
  const [dash] = useState(() => new Animated.Value(C_LENGTH + 10));
  const [dotRadius] = useState(() => new Animated.Value(0));
  const [discScale] = useState(() => new Animated.Value(1));
  const [markScale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    const exit =
      EXIT === 'iris'
        ? Animated.parallel([
            Animated.timing(discScale, {
              toValue: 0,
              duration: 600,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(markScale, {
              toValue: 0.6,
              duration: 400,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        : Animated.parallel([
            Animated.timing(markScale, {
              toValue: 1.3,
              duration: 450,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }),
          ]);
    // Hide the native splash only once this copy is on screen, so the hand-off is pixel-identical.
    BootSplash.hide({ fade: false })
      .then(() =>
        Animated.sequence([
          Animated.timing(dash, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(dotRadius, {
            toValue: DOT.r,
            duration: 450,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: false,
          }),
          Animated.delay(350),
          exit,
        ]).start(onHidden),
      )
      .catch(onHidden);
  };

  // Larger than the screen diagonal, so at scale 1 the disc is the whole background.
  const diameter = Math.ceil(Math.hypot(width, height)) + 2;
  const discLayout = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    transform: [{ scale: discScale }],
  };
  const exitStyle = EXIT === 'iris' ? undefined : { opacity };
  const markStyle = { opacity, transform: [{ scale: markScale }] };

  return (
    <Animated.View style={[styles.container, exitStyle]} onLayout={start} testID="animated-splash">
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.disc, discLayout]} />
      <Animated.View style={[styles.mark, markStyle]}>
        <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox="0 0 120 120">
          <AnimatedPath
            d={C_PATH}
            fill="none"
            stroke={brand.white}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={[C_LENGTH, C_LENGTH]}
            strokeDashoffset={dash}
          />
          <AnimatedCircle cx={DOT.cx} cy={DOT.cy} r={dotRadius} fill={brand.mint} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
