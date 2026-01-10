import React from 'react';
import { ViewProps } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

type ColorMap = {
  [key: string]: string;
};

const COLORS: ColorMap = {
  success: '#00cc66',
  warning: '#ffaa00',
  frenzy: '#ff4444',
  default: '#666',
};

interface BiteGaugeProps extends ViewProps {
  value: number; // 0-100
  size?: number;
  color?: keyof ColorMap;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BiteGauge({ value, size = 256, color = 'success', style, ...props }: BiteGaugeProps) {
  const circumference = 2 * Math.PI * 14; // r=14 for viewBox 36
  const strokeDashoffset = useSharedValue(circumference);

  React.useEffect(() => {
    strokeDashoffset.value = withTiming(circumference * (1 - value / 100), { duration: 1500 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const gaugeColor = COLORS[color] || COLORS.default;

  return (
    <Svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className="mx-auto"
      style={[{ ...style }, { shadowColor: gaugeColor, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }]}
      {...props}
    >
      {/* Background ring */}
      <Circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="#333"
        strokeWidth="3"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <AnimatedCircle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke={gaugeColor}
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeLinecap="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
