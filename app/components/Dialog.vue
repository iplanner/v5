<script setup>
import { motion } from "motion-v"
import { onClickOutside, onKeyStroke } from '@vueuse/core'

defineOptions({
  inheritAttrs: false
})

 /** Whether the Dialog is shown */
const show = defineModel('show', Boolean);

const props = defineProps({
    /** The title of the Dialog */
    title : String,
    /** Whether to show the laoding Spinner */
    loader :  Boolean,
    /** The body text or html of the Dialog */
    body : String,
    /** The submit or cancel button for the Dialog*/
    buttons : { type : Array , default : () => []},
    /** Wheater the Buttons are inline flex oder flex-col */
    inline : { type : Boolean , default : true},
    /** Wheater the Background is renders with error class */
    error : Boolean,
    /** Container node of the Dialog content */
    to : { type : String, default : '#__nuxt'},
    /** Elements id or classes to be excluded when ouside click occurs */
    outsideIfNot : {type : Array , default : () => []},
    /** Wheater close the Dialog when ouside click occurs */
    closeOnOutsideClick : { type : Boolean , default : true },
    /** The initial width of the Dialog */
    width : {type : [Number, String], default : 'auto'},
    /** The initial height of the Dialog */
    height : { type : [Number, String], default : 'auto'},
    /** Whether the Dialog is draggable */
    draggable :  { type : Boolean , default : true },
})

const emit = defineEmits([
  'onSelect',
  'onOutsideClick'
])

const _id = useId();
const dialogRef = useTemplateRef('dialogRef');

function _getStyleValue(size){
  if (typeof size === 'number') return `${size}px`;
  if (typeof size === 'string' && size.length) return size;
  return false;
};
const _style = reactive({
  height: '',
  width: ''
});
watchEffect(() => {
  _style.height = _getStyleValue(props.height)
  _style.width = _getStyleValue(props.width)
})

onClickOutside(dialogRef, event => {

    if (props.closeOnOutsideClick && outsideIgnore(event, props.outsideIfNot)) {
        emit('onOutsideClick');
        show.value = false;
    }

})
onKeyStroke(['Escape'], (e) => {    

    if (props.closeOnOutsideClick && e.key == 'Escape') {
        emit('onOutsideClick');
        show.value = false;
    }

})

function onSelect( button ){
    emit('onSelect', button);
    show.value = false;
}


const draggable = reactive({
  disabled: false,
  restriction : { restriction: props.to, endOnly: true },
});

watch(
    () => props.draggable, 
    (isDraggable) => {
        draggable.disabled = !isDraggable;
    },
    { immediate :true }
);

/** animation */
const isMounted = ref(false)
const isVisible = ref(false)
function onComplete() {
  if (!isVisible.value) {
    isMounted.value = false
  }
}
watch(
  show,
  async (newVal) => {
    if (newVal) {
      isMounted.value = true;
      nextTick(() => {
        isVisible.value = true
      })
    }else{
      isVisible.value = false;
    }
  },
  { immediate: true }
)

defineExpose({
  _id,
  draggable
})


</script>

<template>
    <Teleport :to="to">
      <div :id="_id" class="ip-dialog-box" v-if="isMounted">
        <motion.div
          :initial="{ scale: 0.1 }"
          :animate="isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
          :transition="{ type: 'spring', duration: 0.7, bounce: 0.48, onComplete }"
          :class="['ip-dialog shadow-2 rounded-3xl text-white drop-shadow-2xl ', $attrs.class, { 'bg-primary/85 shadow-dialog' : !props.error, 'bg-red-500/85 shadow-dialog-error' : props.error}]" 
          ref="dialogRef" 
          v-draggable 
          :style="_style"
        >
       <slot>
              <div class="flex flex-col gap-3 m-6">
                <div class="text-xl font-semibold" v-if="title">{{title}}</div>
                <Loader :show="loader" class="mt-2"/>
                <div class="text-sm" :class="{'mb-6' : !buttons.length}" v-if="body" v-html="body"></div>
                <div :class="[{ 'flex justify-around' : props.inline, 'flex-col' : !props.inline}]" v-if="buttons.length">
                  <div class=" cursor-pointer"
                    :class="[{ 'border-t border-white/20 py-3': !props.inline, 'py-2' : props.inline }, button.class]"
                    v-for="(button, index) in buttons"
                    :key="index"
                    @click="onSelect(button)">
                    {{button.display}}
                  </div>
                </div>
              </div>
            </slot>
      </motion.div>
     
       </div>
    </Teleport>  
</template>

<style lang="scss" scoped>



.ip-dialog-box{
  z-index: 2000;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100%;
}

.ip-dialog{
  backdrop-filter: blur(10px);
  touch-action: none;
  position: relative;
  display: inline-block;
  min-width: 200px;
}


</style>