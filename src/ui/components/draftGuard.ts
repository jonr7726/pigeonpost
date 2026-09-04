// Module-level draft guard: any composer with unsaved text sets `dirty`;
// navigations consult it before leaving the screen and raise the shared
// discard confirmation. Module scope because the storyboard shell is a single
// instance — a real router would hang this off navigation state instead.
export type DraftGuard = { dirty: boolean };

export const draftGuard: DraftGuard = { dirty: false };

export function markDraft(dirty: boolean) {
  draftGuard.dirty = dirty;
}

export function clearDraft() {
  draftGuard.dirty = false;
}
