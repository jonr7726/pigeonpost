import { StyleSheet, type ViewProps } from 'react-native';

import { AppText } from './AppText';
import { Panel } from './Panel';

// A titled section card: Panel + heading (same grammatical role as the
// create-post composer). Right-column sections (stories, friends, members,
// settings) are cards like this; the columns themselves stay boxless and the
// hairline separator draws the column divide.
export function Card({
  title,
  children,
  style,
  ...rest
}: ViewProps & { title?: string }) {
  const pass: ViewProps = { ...rest };
  delete (pass as { children?: unknown }).children;
  return (
    <Panel style={[styles.card, style]} {...pass}>
      {title != null && <AppText size="md" tone="display">{title}</AppText>}
      {children}
    </Panel>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
});
