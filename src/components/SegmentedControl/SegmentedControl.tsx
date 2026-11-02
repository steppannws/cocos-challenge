import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { styles } from './styles';

export type SegmentOption<T extends string> = { value: T; label: string; tone?: 'gain' | 'loss' };

type Props<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, testID }: Props<T>) {
  return (
    <View style={styles.container} testID={testID} accessibilityRole="radiogroup">
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
              selected && styles.selected,
              selected && option.tone === 'gain' && styles.selectedGain,
              selected && option.tone === 'loss' && styles.selectedLoss,
            ]}
          >
            <Text variant="captionStrong" color={selected ? 'textOnPrimary' : 'textMuted'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
