export function usePreviousValue(model) {
  
  const previousValue = ref(toValue(model));

  watch(
    () => model.value,
    (newValue, oldValue) => {
      previousValue.value = oldValue === undefined ? newValue : oldValue;
    },
    { immediate: true }
  );

  return {
    previousValue,
  };
  
}
