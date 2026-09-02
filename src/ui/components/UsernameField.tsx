import { StyleSheet, TextInput } from 'react-native';

// The one shared username field — screens must use this instead of a raw
// TextInput (enforced by the client reuse gate, ceilings in check_ui_reuse.sh).
export function UsernameField({
  value,
  onChange,
  onSubmit,
  placeholder = 'username',
}: {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      onSubmitEditing={onSubmit}
      placeholder={placeholder}
      aria-label="Username"
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#2a3438',
    backgroundColor: '#161d20',
    color: '#e6eae7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
  },
});
