import { AppInput } from './AppInput';

// Kept by name for the dev-rig login (e2e lands here); it's AppInput under the
// hood — screens import the AppInput barrel, never a raw TextInput.
export function UsernameField(props: Parameters<typeof AppInput>[0]) {
  return <AppInput autoCapitalize="none" autoCorrect={false} accessibilityLabel="Username" {...props} />;
}
