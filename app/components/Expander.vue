<script setup>

const props = defineProps({
    /** the placholder icon if the prop.url is empty */
    toggled : { type: Boolean, default: false},
})

// Für die Animation: grid-rows-[1fr] wenn offen, grid-rows-[0fr] wenn zu
const __class__root = computed(() => [
  "grid overflow-hidden transition-[grid-template-rows] duration-300",
  !props.toggled ? "!grid-rows-[1fr]" : "!grid-rows-[0fr]"
])
</script>

<template>
    <div :class="__class__root">
        <div class="min-h-0">
            <slot />
        </div>
    </div>
</template>