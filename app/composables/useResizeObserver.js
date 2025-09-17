export function useResizeObserver(callback) {
  const resizeObserver = ref(null);
  const initialValues = ref({ width: 0, height: 0 });

  onMounted(() => {
    resizeObserver.value = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setInitialValues(entry.contentRect);
        callback(entry.contentRect, initialValues.value);
      }
    });
  });

  onUnmounted(() => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect();
    }
  });

  const observe = (element) => {
    if (resizeObserver.value && element) {
      const rect = element.getBoundingClientRect();
      setInitialValues(rect);
      resizeObserver.value.observe(element);
    }
  };

  const unobserve = (element) => {
    if (resizeObserver.value && element) {
      resizeObserver.value.unobserve(element);
    }
  };

  const setInitialValues = (rect) => {
    if (initialValues.value.width === 0 && initialValues.value.height === 0) {
      initialValues.value = {
        width: rect.width,
        height: rect.height,
      };
    }
  };

  return { observe, unobserve };
}