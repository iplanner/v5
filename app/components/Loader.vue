<script setup>

const props = defineProps({
  /** Whether the Loader is shown */
  show: { type: Boolean, default: true },
  /** The initial size of the Loader */
  size: { type: Number, default: 32 },
  /** The color of the Loader, default is white */
  color: { type: String, default: `stroke-white` }
})

const __style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

</script>

<template>

  <div v-if="show" class="relative inline-block" :style="__style">
    <svg class="ip-circular" :class="color" viewBox="25 25 50 50">
      <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10" />
    </svg>
    <slot></slot>
  </div>

</template>

<style lang="scss" scoped>

.ip-circular {
  animation: rotate 1s linear infinite;
  height: 100%;
  transform-origin: center center;
  width: 100%;
  position: absolute;
  inset: 0;
  margin: auto;
}

.path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 3s ease-in-out infinite, color 6s ease-in-out infinite;
  stroke-linecap: round;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>