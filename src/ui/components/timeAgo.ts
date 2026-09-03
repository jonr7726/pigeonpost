// Relative time for "2d", "in ~3 days" — letters and posts share one formatter.
export function timeAgo(past: number, now: number = Date.now()): string {
  const seconds = Math.max(1, Math.floor((now - past) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function daysUntil(future: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((future - now) / 86_400_000));
}
