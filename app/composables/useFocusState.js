
export function useFocusState(props, inputRef) {

    const __focused = ref(false);

   const { focused } = useFocus(inputRef);
    watchEffect(() => {
        __focused.value = focused.value && !props.readonly;
    });
  
    return {
        __focused
    };
  }