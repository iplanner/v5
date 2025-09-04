export function useHoverState(props, elementRef) {
  const __hovered = ref(false);

  function onHover(event) {
    if (props.disabled || props.readonly) return;
    __hovered.value = event.type === "mouseenter";
  }

  function addListeners(el) {
    if (el) {
      el.addEventListener("mouseenter", onHover);
      el.addEventListener("mouseleave", onHover);
    }
  }

  function removeListeners(el) {
    if (el) {
      el.removeEventListener("mouseenter", onHover);
      el.removeEventListener("mouseleave", onHover);
    }
  }

  onMounted(() => {
    if (Array.isArray(elementRef.value)) {
      elementRef.value.forEach(addListeners);
    } else {
      addListeners(elementRef.value);
    }
  });

  onUnmounted(() => {
    if (Array.isArray(elementRef.value)) {
      elementRef.value.forEach(removeListeners);
    } else {
      removeListeners(elementRef.value);
    }
  });

  return {
    __hovered,
  };
}
