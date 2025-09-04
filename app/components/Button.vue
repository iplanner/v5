<script setup>

const props = defineProps({
    /** The button's type */
    primary: Boolean,
    /** The type attribute of the button's DOM */
    type: {
        type: String,
        default: 'button',
        validator(value) {
            // Überprüfe, ob der Wert einer der zulässigen Typen ist
            return ['button', 'submit', 'reset'].includes(value);
        }
    },
    /** The size of the button. */
    size: {
        type: [String, Number],
        default: 'medium',
        validator(value) {
            return (typeof value === 'string' && ['tiny', 'small', 'medium', 'large', 'xLarge'].includes(value) || typeof value === 'number')
        }
    },
    /** The name attribute for the input field*/
    name: String,
    /** Whether the button is displayed as block element. */
    block: Boolean,
    /** Whether the button is round. */
    circle: Boolean,
    /** Whether the button shows the border. */
    bordered: { type: Boolean, default: true },
    /** Whether the button shows round corners. */
    round: { type: Boolean, default: true },
    /** Whether the button is disabled. */
    disabled: Boolean
})

/** Computed root class */
const __class_root = computed(() => {
    return [
        {
            'border-y border-b-white/15 border-t-white/30': props.primary
        },
        'relative m-0 leading-none no-underline text-center whitespace-nowrap outline-none z-auto  select-none transition active:scale-[.98] transition duration-300 text-sm',
        {
            'px-4': !props.circle,
            'border-[0.5px] dark:border': props.bordered,
            'border-slate-400': props.bordered && !props.primary,
            'border-primary': props.bordered && props.primary,
            'block w-full': props.block,
            'inline-flex shrink-0 items-center justify-center': !props.block,
            'bg-primary bg-linear-to-b from-primary to-primary/25 to-25%': props.primary,
            'text-white': props.primary,
            'rounded-xl': props.round && !props.circle,
            'cursor-pointer': !props.disabled,
            'cursor-not-allowed': props.disabled,
            'opacity-60': props.disabled,
        },
        { 'w-9 shadow-none rounded-full': props.circle },
        {
            'h-6': props.size === 'tiny',
            'h-[30px]': props.size === 'small',
            'h-9': props.size === 'medium',
            'h-[42px]': props.size === 'large',
            'w-[42px]': props.size === 'large' && props.circle,
            'h-12': props.size === 'xLarge',
        }
    ];
});

const __style_root = computed(() => {
    return {
        height: typeof props.size === 'number' ? `${props.size}px` : null,
        width: typeof props.size === 'number' && props.circle ? `${props.size}px` : null
    }
});


onMounted(() => {
    console.log('onMounted Button', props);
})

/** show the wave effect */
const showWave = ref(false);
function onClick() {
    if (props.disabled) return;
    showWave.value = true;
}

</script>

<template>
    <button :class="__class_root" :type :name :disabled @click="onClick" :style="__style_root">
        <slot name="icon"></slot>
        <slot></slot>
        <Wave v-model:show="showWave" />
    </button>
</template>

<style lang='scss' scoped></style>
