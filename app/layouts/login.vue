<script setup>

const rootRef = useTemplateRef('rootRef');
const headerRef = useTemplateRef('headerRef');

const __class_header = ref("");


function handleScroll() {
  if (!rootRef.value || !headerRef.value) return;

  const scrollTop = rootRef.value.scrollTop;
  if (scrollTop > 20) {
    __class_header.value = 'shadow-sm w-screen';
  } else {
    __class_header.value = '';
  }
};

</script>

<template>
  <div id="__login" class="grid place-items-center h-full overflow-y-auto overflow-x-hidden" ref="rootRef" @scroll="handleScroll">
    <div class="">
      <div class="flex justify-center sticky top-0 backdrop-blur-3xl py-2 z-50" :class="[__class_header]" ref="headerRef">
        <NuxtLink to="/" class="hover:underline decoration-1 mb-1"><Logo/></NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template>