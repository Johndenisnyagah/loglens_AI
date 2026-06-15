// Backend serializes naive UTC datetimes (no trailing 'Z' or offset). JavaScript's
// Date parser treats those strings as local time, which shifts every displayed
// timestamp by the user's timezone offset. Append 'Z' before parsing so they're
// correctly interpreted as UTC.
export function parseUtc(iso: string): Date {
  if (!iso) return new Date(NaN);
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTz ? iso : iso + 'Z');
}
