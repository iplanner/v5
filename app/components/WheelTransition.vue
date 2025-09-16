<script setup>

const props = defineProps({
  name : {type: String, default: "slide-wheel" },
  mode : { type: String, default: "out-in"},
  duration: {type: Number,default: 200},
  translateY : {type: Number,default: 25}
})

const transitionDuration = computed( () => `${props.duration / 1000}s` );
const translateYEnter = computed( () => `-${props.translateY}px` )
const translateYLeave = computed( () => `${props.translateY + 5}px` )

</script>

<template>
    <Transition :name="name" :mode="mode">
        <slot></slot>
    </Transition>
</template>

<style lang='scss'>

.slide-wheel-enter-active,
.slide-wheel-leave-active {
  transition: all v-bind(transitionDuration) ease-out;
}

.slide-wheel-enter-from {
  opacity: 0;
  transform: translateY(v-bind(translateYEnter));
}

.slide-wheel-leave-to {
  opacity: 0;
  transform: translateY(v-bind(translateYLeave));
}
</style>