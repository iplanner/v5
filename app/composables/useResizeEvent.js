export function useResizeEvent(elementRef = null) {
  
  const width = ref(0);
  const height = ref(0);
  const originalSize = ref({ width: 0, height: 0 });

  let observer;

  const updateSize = (rect) => {
    width.value = rect.width;
    height.value = rect.height;

    if (originalSize.value.width === 0 && originalSize.value.height === 0) {
      originalSize.value = { width: rect.width, height: rect.height };
    }
  };

  onMounted(() => {
    const el = toValue(elementRef) || document.body;

    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateSize(entry.contentRect);
      }
    });

    observer.observe(el);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { width, height, originalSize };
}