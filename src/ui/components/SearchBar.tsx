import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput } from './AppInput';
import { Icon } from './Icon';
import { useTheme } from '../theme/useTheme';

// AppInput + icon + clear button. Friend search is its first user.
export function SearchBar({
  value,
  onChange,
  placeholder = 'search',
  onClear,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Icon name="search" size={16} />
      <AppInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable onPress={() => { onChange(''); onClear?.(); }} accessibilityRole="button" hitSlop={8}>
          <Icon name="close" size={16} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  input: { flex: 1 },
});
