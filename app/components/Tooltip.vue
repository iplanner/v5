<script setup>

const props = defineProps({
    show:  { type: Boolean, default: true },
    /** the text which appears in the tooltip */
    text: String,
    /** the position of the tooltip top,right,bottom,left */
    position: { type: String, default: 'bottom'},
    /** the distance betwenn the element and the tooltip */
    offset: { type: Number, default: 8},
     /**  Whether an arrow is set between the element and the tooltip */
    arrow: Boolean,
    /** The duration of the enter and leave animation */
    duration : { type : Number, default : 400 },
    /** Whether the tooltip can't be activated */
    disabled: Boolean,
})

const _show = ref(false);
const __style_tooltip = ref({});


/** Refs to the root element */
const rootRef = useTemplateRef('rootRef');

/** computed classes */
const __class_tooltip = computed(() => ({
    'tooltip__text bg-slate-900 relative z-0 shadow-xl text-center': true,
    'tooltip--border': props.arrow ,
    'tooltip--top': props.arrow && props.position === 'bottom',
    'tooltip--bottom': props.arrow && props.position === 'top',
    'tooltip--right': props.arrow && props.position === 'left',
    'tooltip--left': props.arrow && props.position === 'right',
}))


const __duration = computed(() => `${props.duration}ms`);

const _visible = ref(false);
function onShow(){


    if(props.disabled) return;

    const target = rootRef?.value.getBoundingClientRect();
    const style = calcPositionByTarget( target, props.position, 'center', props.arrow ? 4 : 0, [props.offset, props.offset]);

    __style_tooltip.value = { ...style, zIndex: 999999, minWidth: 0, width : target.width };

    _visible.value = true;
}

function onHide() {
    _visible.value = false;
}

watch(() => props.show,(newVal) => {
    _show.value = newVal;
    if(!_show.value){
        onHide();
    }
},{ immediate : true})




</script>

<template>
    <div class="tooltip-wrapper" ref="rootRef" @pointerenter="onShow" @pointerleave="onHide">
        <slot></slot>
        <Teleport to="#teleports">
            <div class="absolute pointer-events-none" v-if="_show && _visible && text?.length" :style="__style_tooltip">
                <Transition appear>
                    <div :class="__class_tooltip">
                        <slot name="prefix"></slot>
                        <div class="flex-1 px-8 text-slate-100" v-html="text"></div>
                        <slot name="suffix"></slot>
                    </div>
                </Transition>
            </div> 
        </Teleport>
    </div>
</template>

<style lang="scss" scoped>

.v-enter-active,
.v-leave-active {
  transition: opacity v-bind(__duration) ease-in-out, transform v-bind(__duration) ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  transition-delay: 1s;
}


.tooltip__text {
    font-size: 13px;
    padding: 12px 8px;
    border-radius: 0.5rem;
    max-width: 320px;
    display : flex;
    align-items: center;
}

/* Pfeil-Grundstruktur */
.tooltip--border::after {
    content: "";
    position: absolute;
    border-width: 6px;
    border-style: solid;
    z-index: -1;
}

.tooltip--bottom::after {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-color: transparent rgba(var(--color-slate-900),1) rgba(var(--color-slate-900),1) transparent;
}

.tooltip--top::after {
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-color: rgba(var(--color-slate-900),1) transparent transparent rgba(var(--color-slate-900),1);
}

.tooltip--left::after {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-color: transparent black transparent transparent;
}

.tooltip--right::after {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-color: transparent transparent transparent black;
}

.tooltip-wrapper {
    position: relative;
    display: inherit
}

</style>