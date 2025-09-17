<script setup>
import { motion } from "motion-v"
import { onClickOutside, onKeyStroke } from '@vueuse/core'

 /** Whether the popup is shown */
const show = defineModel('show', { type: Boolean, default: false });

const props = defineProps({
    /** Container node of the popup content */
    to : { type : String ,default : '#__nuxt'},
    /** Elements id or classes to be excluded when ouside click occurs */
    outsideIfNot : { type : Array , default : () => []},
    /** Wheater close the popup when ouside click occurs */
    closeOnOutsideClick : { type : Boolean , default : true },
    /** The initial width of the Popup */
    width : {type : [ Number, String], default: 400},
    /** The initial height of the Popup */
    height : { type : [ Number, String], default : 50 },
    /** The minimla width of the Popup */
    minWidth : {type : Number, default: 200},
    /** The minimal height of the Popup */
    minHeight : { type : Number, default : 50 },
    /** Wheater the Popup is resizeable */
    resizeable : { type : Boolean, default : true },
    /** Wheater the Popup is draggable */
    draggable : { type : Boolean, default : true },
})

const emit = defineEmits([
    'onOutsideClick',
    'onDragStart',
    'onDragMove',
    'onDragEnd'
]);


const _id = useId();
const popupRef = useTemplateRef('popupRef');

const __class_popup = 'absolute z-100 drop-shadow-2xl rounded-2xl bg-white dark:bg-slate-700/60 touch-none';

const { observe, unobserve } = useResizeObserver( rect => {

   resizable.minHeight = rect.height;

  if(popupRef?.value && (popupRef.value.scrollHeight > popupRef.value.clientHeight)){
    resizable.minHeight = rect.height;
  }
    
});

const _getStyleValue = (size) => {
  if (typeof size === 'number') return `${size}px`;
  if (typeof size === 'string' && size.length) return size;
  return false;
};
const _style = reactive({
  height: _getStyleValue(props.height),
  width: _getStyleValue(props.width)
});
watchEffect(() => {

  let transform = "";
  if(popupRef.value){
    transform = popupRef.value.style.transform;
  }
  Object.assign(_style, {
    height: _getStyleValue(props.height),
    width: _getStyleValue(props.width),
    transform
  })
})


onMounted(() => {
  console.log('onMounted PopupBox', props, popupRef.value);
  observe( popupRef.value);
})

onUnmounted(() => {
  unobserve( popupRef.value );
})

onClickOutside(popupRef, event => {

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


/** Configuration for v-draggable */
const draggable = reactive({
  disabled: !props.draggable,
  restriction : { restriction: props.to, endOnly: true },
  onDragStart,
  onDragMove,
  onDragEnd
});

function onDragStart(event){
    emit('onDragStart',event)
}
function onDragMove(event){
    emit('onDragMove',event)
}
function onDragEnd(event){
  emit('onDragEnd',event)
}

/** Configuration for v-resizeable */
const resizable = reactive({
    disabled : !props.resizeable,
    minHeight : props.minHeight,
    minWidth : props.minWidth
})


/** Access in binding instance v-... */
defineExpose({
  _id,
  draggable,
  resizable
})

</script>

<template>
  <ClientOnly>
  <Teleport :to="to">
      <div :id="_id" class="fixed inset-0 flex items-center justify-center overflow-hidden z-1500" :class="{ 'bg-black/15' : isVisible}" v-if="isMounted">
        <motion.div
           v-show="isMounted"
          :initial="{ scale: 0.1 }"
          :animate="isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.1 }"
          :transition="{ type: 'spring', duration: 0.7, bounce: 0.48, onComplete}"
          :class="__class_popup" 
          ref="popupRef" 
          v-draggable 
          v-resizable 
          :style="_style"
        >
         <slot></slot>
         </motion.div>
      </div>
  </Teleport>
</ClientOnly>
</template>