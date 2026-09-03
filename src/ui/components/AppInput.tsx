import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

// The one text input (incl. multiline). UsernameField wraps this; screens feed
// it raw TextInput never (reuse gate).
export function AppInput({
  multiline,
  serif,
  style,
  ...rest
}: TextInputProps & { multiline?: boolean; serif?: boolean }) {
  const { palette } = useTheme();
  return (
    <TextInput
      placeholderTextColor={palette.textDim}
      style={[
        styles.input,
        { backgroundColor: palette.panel, borderColor: palette.panelEdge, color: palette.text },
        multiline && styles.multiline,
        serif && styles.serif,
        style,
      ]}
      multiline={multiline}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    width: '100%',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  serif: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 17 },
});
