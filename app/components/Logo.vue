<script setup>

const props = defineProps({
  size: {type: [Number, String],default: 32},
});

const __size = computed(() => {
  return typeof props.size === "number" ? `${props.size}px` : props.size;
});

</script>
<template>
    <svg :width="__size" :height="__size" viewBox="0 0 56 56" class="bg-primary rounded-lg border-y border-b-white/10 border-t-white/20">
        <path class="fill-gray-50" d="M29.64,14H20.16A1.16,1.16,0,0,0,19,15.17v5.23a1.16,1.16,0,0,0,1.16,1.17H22a1.16,1.16,0,0,0,1.16-1.17V18.06h6.51c3.64,0,5,2.78,5,6.18s-1.33,6.18-5,6.18H20.16A1.16,1.16,0,0,0,19,31.59V42.83A1.16,1.16,0,0,0,20.16,44H22a1.16,1.16,0,0,0,1.16-1.17V34.6h6.51c6.07,0,9.36-4.67,9.36-10.3S35.69,14,29.64,14Z"></path>
        <path class="fill-gray-50" d="M20.12,28h1.76A1.12,1.12,0,0,0,23,26.88V25.12A1.12,1.12,0,0,0,21.88,24H20.12A1.12,1.12,0,0,0,19,25.12v1.79A1.12,1.12,0,0,0,20.12,28Z"></path>
    </svg>
</template>