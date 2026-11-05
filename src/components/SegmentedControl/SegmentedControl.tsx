import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useStyles } from './styles';

export type SegmentOption<T extends string> = { value: T; label: string; tone?: 'gain' | 'loss' };

type Props<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
  /** Fully rounded track and options (order sheet side switch). */
  pill?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
  pill = false,
}: Props<T>) {
  const styles = useStyles();
  return (
    <View
      style={[styles.container, pill && styles.pill]}
      testID={testID}
      accessibilityRole="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => onChange(option.value)}
            testID={testID ? `${testID}-${option.value}` : undefined}
            style={[
              styles.option,
              pill && styles.pill,
              selected && styles.selected,
              selected && option.tone === 'gain' && styles.selectedGain,
              selected && option.tone === 'loss' && styles.selectedLoss,
            ]}
          >
            <Text
              variant="captionStrong"
              color={
                !selected
                  ? 'textMuted'
                  : option.tone === 'gain'
                    ? 'onGain'
                    : option.tone === 'loss'
                      ? 'onLoss'
                      : 'text'
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
