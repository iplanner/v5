<script setup>

/** declares "show" prop, consumed by parent via v-model:show */
const show = defineModel('show', Boolean);

const props = defineProps({
    duration : { type : Number, default : 800 }
})

let timeout = null;
watch(show, (isShown) => {
  if (isShown) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      show.value = false;
      timeout = null;
    }, props.duration);
  }
});

const _duration = computed(() => {
    return `${props.duration / 1000}s`
})

</script>

<template>
    <div class="ip-wave" :class="{ '--active' : show }"></div>
</template>

<style lang='scss' scoped>

.ip-wave{
    position: absolute;
    pointer-events: none;
    border-radius: inherit;
    pointer-events: none;
    inset : 0;
    animation-iteration-count: 1;
    animation-duration: v-bind(_duration);
    animation-timing-function: cubic-bezier(0, 0, .2, 1), cubic-bezier(0, 0, .2, 1);

    &.--active{
        z-index: 1;
        animation-name: ip-wave-spread, ip-wave-opacity;
    }
}

@keyframes ip-wave-spread {
    0% {
        box-shadow: 0 0 0.5px 0 rgba(var(--color-primary));
    }
    100% {
        box-shadow: 0 0 0.5px 5px rgba(var(--color-primary));
    }
}

@keyframes ip-wave-opacity {
    0% {
        opacity: 0.7    ;
    }
    100% {
        opacity: 0;
    }
}

   
</style>


