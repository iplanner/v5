<script setup>

const props = defineProps({
    /** The size of the component. */
    size : {
        type : [ String, Number, Array],
        default : 'medium',
        validator(value) {
            return (typeof value === 'string' && ['tiny' , 'small' , 'medium' , 'large', 'xLarge'].includes(value) || typeof value === 'number' || Array.isArray(value))
        }
    },
    /** The border radius of the component. */
    rounded : {
        type : [ Number, Boolean],
        default : true,
        validator(value) {
            return (typeof value === 'number' || typeof value === 'boolean')
        }
    },
})

const __class_root = computed(() => [
    `relative`,
    {
      'h-[24px] w-[24px]': props.size === 'tiny',
      'h-[30px] w-[30px]': props.size === 'small',
      'h-[36px] w-[36px]': props.size === 'medium',
      'h-[42px] w-[42px]': props.size === 'large',
      'h-[48px] w-[48px]': props.size === 'xLarge',
    },
    typeof props.rounded === 'boolean' && props.rounded  ? `rounded-lg` : null,
    { 'shrink-0' : !props.shrink }
  ]);

const __style_root = computed(() => ({
    width: typeof props.size === 'number' ? `${props.size}px` : (Array.isArray(props.size) ? `${props.size[1]}px` : null),
    height: typeof props.size === 'number' ? `${props.size}px` : (Array.isArray(props.size) ? `${props.size[0]}px` : null),
    borderRadius: typeof props.rounded === 'number' ? `${props.rounded}px` : null,
  }));

</script>

<template>
    <div :class="__class_root" :style="__style_root">
        <slot></slot>
    </div>
</template>
