export function isEmpty(value) {

  if (value === undefined || value === null) return true;

  const type = typeof value;

  if (type === 'number') return !isFinite(value);
  if (type === 'string') return value.trim() === ''; // Leere Zeichenfolge
  if (type === 'object') {
      if (value instanceof RegExp || value instanceof Date) return false; // RegExp und Date sind nie leer
      return Object.keys(value).length === 0; // Leere Objekte
  }

  return false; // Fallback für andere Typen
}