export function getCursor(el) {
  if (document.activeElement === el && typeof el.selectionStart === "number") {
    const start = el.selectionStart;
    const end = el.selectionEnd;

    return {
      start,
      end,
      isRangeSelected: start !== end,
    };
  }
  return null;
}
