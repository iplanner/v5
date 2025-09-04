export function useInputState(model) {
  const __filled = computed(() => {
    if (typeof model.value === "number") {
      return !isNaN(model.value) && model.value !== null;
    }
    if (typeof model.value === "string") {
      return model.value.trim().length > 0;
    }
    if (Array.isArray(model.value)) {
      return model.value.length > 0;
    }
    return model.value !== null;
  });

  const __empty = computed(() => !__filled.value);

  return {
    __filled,
    __empty,
  };
}
