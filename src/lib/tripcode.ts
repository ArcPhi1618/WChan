// Simple deterministic 4chan-style Tripcode generator for 16-bit board
export function parseNameAndTripcode(rawInput: string): { name: string; tripcode?: string } {
  if (!rawInput.includes('#')) {
    return { name: rawInput.trim() || 'Anonymous' };
  }

  const parts = rawInput.split('#');
  const name = parts[0].trim() || 'Anonymous';
  const pass = parts.slice(1).join('#');

  if (!pass) {
    return { name };
  }

  // Simple hash function to generate clean 8-character tripcode
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const baseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
  let trip = '!';
  let absHash = Math.abs(hash);

  for (let i = 0; i < 7; i++) {
    trip += baseChars[(absHash + i * 17) % baseChars.length];
  }

  return { name, tripcode: trip };
}

export function formatPostTimestamp(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    // Return raw input if custom text
    return typeof dateInput === 'string' ? dateInput : new Date().toLocaleString();
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dayName = days[d.getDay()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}(${dayName})${hours}:${minutes}:${seconds}`;
}
