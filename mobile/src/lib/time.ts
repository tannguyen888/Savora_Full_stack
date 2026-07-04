export function formatTimeAgo(input?: string) {
  if (!input) return "just now";

  const now = Date.now();
  const time = new Date(input).getTime();
  if (Number.isNaN(time)) return "just now";

  const diffSec = Math.max(1, Math.floor((now - time) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}y ago`;
}
