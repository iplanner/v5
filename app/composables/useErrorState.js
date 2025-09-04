export function useErrorState(props) {
  const __error = ref(false);

  watchEffect(() => {
    __error.value =
      Array.isArray(props.validationErrors) &&
      props.validationErrors.length > 0;
  });

  return {
    __error,
  };
}
