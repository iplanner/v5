<script setup>

const props = defineProps({
  /** wenn true → gridTemplateRows verwenden */
  rows: { type: Boolean, default: false },
  /** wenn true → gridTemplateColumns verwenden (hat Vorrang, falls beides true) */
  cols: { type: Boolean, default: false },
  /** Template-Fragmente, z. B. ['auto', '1fr'] */
  template: { type: Array, default: () => [] }
})

const slots = useSlots();
const children = computed(() => slots.default?.() || []);

/** computed classes */
const __class_root = `grid size-full relative overflow-hidden min-h-0`

const __style_root = computed(() => {
  const style = {}
  const tpl = props.template.join(' ')
  if (props.cols) {
    style.gridTemplateColumns = tpl
  } else if (props.rows) {
    style.gridTemplateRows = tpl
  }
  return style
})
</script>

<template>
    <div :class="__class_root" :style="__style_root">
       <component
        v-for="(vnode, i) in children"
        :key="i"
        :is="vnode"
        />
    </div>
</template>

<style lang="scss" scoped>
.grid-cols-auto{
    grid-template-columns: min-content 1fr;
}
</style>