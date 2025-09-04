<script setup>
import { motion } from 'motion-v';

/** The value when being manually set. **/
const model = defineModel({ required: true, type: [String, Number, null], default: null });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The name attribute for the select field */
    name: { type: String, default: "" },
    /** The label for the Tabselect field */
    label: { type: String, default: "" },
    /** The dropdown options of the select */
    options: { type: Array, default: () => [] },
    /** The border radius of the component. */
    rounded: {
        type: [Number, Boolean],
        default: true,
        validator: v => typeof v === 'number' || typeof v === 'boolean'
    },
    /** The flex direction of the tab items */
    flex: {
        type: String, 
        default: 'row', 
        validator: v => typeof v === 'string' || ['row', 'row-reverse', 'col', 'col-reverse'].includes(v)
    },
    /** The size of the component. */
    size: {
        type: [String, Number],
        default: 'medium',
        validator: v => typeof v === 'number' || ['tiny', 'small', 'medium', 'large', 'xLarge'].includes(v)
    },
    /** Whether the select is readonly & can be searched */
    readonly: Boolean,
    /** Whether the select can't be activated */
    disabled: Boolean,
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
})

const __id = computed(() => Math.random().toString(36).slice(2, 10) );

const emit = defineEmits([
    'onFocus',
    'onBlur',
    'onValueChanged',
    'onSelect'
]);

function _getEmitParams(event) {
    return {
        id: props.id,
        originalEvent: event,
        value: model.value,
        name : props.name,
        displayValue: __display.value,
        previousValue: previousValue.value,
        validationErrors: props.validationErrors,
    }
}

/** Refs to the root element */
const rootRef = useTemplateRef('rootRef');
const { previousValue } = usePreviousValue(model);

/** computed classes */

const __class_root = computed(() => [
  'relative ',
]);

const __class_nav = computed(() => [
  'relative bg-slate-200 py-0.25 px-0.5 border-y border-b-slate-500/5 border-t-slate-400/5',
  {
    'h-[20px]': props.size === 'tiny',
    'h-[26px]': props.size === 'small',
    'h-[32px]': props.size === 'medium',
    'h-[38px]': props.size === 'large',
    'h-[44px]': props.size === 'xLarge',
    'rounded-full': typeof props.rounded === 'boolean' && props.rounded,
    'separator': Array.isArray(props.options) && props.options.length > 2,
  }
]);

const __class_list = computed(() => [
       'flex size-full',
       {
            'flex-row ': props.flex === 'row',
            'flex-row-reverse': props.flex === 'row-reverse',
            'flex-col': props.flex === 'col',
            'flex-col-reverse': props.flex === 'col-reverse',
       }
    ])

const __class_button = `relative z-2 cursor-pointer rounded-full px-2 outline-none text-xs w-full`;

const __class_selected = function({value}){ 
    return [
        'relative flex items-stretch flex-1',
        { 
            'text-primary' : value === model.value,
            'text-slate-500' : value !== model.value
        }
    ]
};
const __class_selected_indicator = 'absolute bg-primary/15 inset-0 -inset-x-[1px] z-1 rounded-full border-y border-t-primary/8 border-b-primary/4'


const __class_label = computed(() => [
    'ip-input-label flex items-center gap-2 overflow-hidden transition duration-300 select-none text-sm',
    {
        'text-slate-400': !__focused.value && !__error.value,
        'text-primary': __focused.value && !__error.value,
        'text-red-500': __error.value,
    },
    {
        'bg-slate-50': props.disabled
    },
    {
        '__focused': __focused.value,
        '__error': __error.value
    }
])

const __class_border = computed(() => [
    'absolute -inset-[1px] pointer-events-none border border-transition rounded-[inherit]',
    {
        'border-primary shadow-input-focus': __focused.value && !__error.value,
        'border-red-500 shadow-input-error': __error.value,
        'border-slate-300/80': __hovered.value && !__focused.value && !__error.value,
        'border-slate-200 dark:border-slate-100/20': !__focused.value && !__error.value && !__hovered.value
    }
])


/** computed attributes */
const __display = ref(_getSelectedOption().display);
const __label = computed(() => {
    return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})

/** computed states */
const { focused : __focused } = useFocusWithin(rootRef)
const __selected = computed(() => _getSelectedOption().value === model.value);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, rootRef);

onMounted(() => {
    console.log(`onMounted InputTabselect`, props);
})

function onSelect({value}){

console.log('onSelect',value);

previousValue.value = model.value;
model.value = value;

const params = {
    ..._getEmitParams(null),
    value,
    displayValue: __display.value,
    selected: toRaw(_getSelectedOption(value))
};

if (value != previousValue.value) {
    emit('onValueChanged', params);
}


emit('onSelect', params);

}

/** watcher */
watch(model, () => {
  const selected = _getSelectedOption();
  __display.value = selected?.display || "";
});

watch(__focused, (focused) => {
    if(focused){
        emit('onFocus', _getEmitParams(null))
    }else{
        emit('onBlur', _getEmitParams(null))
    }
})  

/** helpers */function _getSelectedOption(selected = null) {
    return props.options.find(o => o.value === (selected ? selected : model.value)) || { value: undefined, display: "" };
}


function onFocus(event,index){
    console.log('onFocus',event);
}

</script>

<template>
    <div :class="__class_root" ref="rootRef">
        <label v-if="label" :class="__class_label">
            <Icon v-if="__error" name="warning" :color="__class_error_icon" />
            <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
        </label>
        <nav :class="__class_nav"  >
            <ul :class="__class_list">
                <li v-for="(option, index) in options" :key="index" :class="__class_selected(option)" role="tab" :aria-selected="option.value === model">
                    <motion.div v-if="option.value === model" :layout-id="`selected-indicator-${__id}`" :class="__class_selected_indicator"/>
                    <motion.button :class="__class_button" @focus="onFocus($event,index)" @press-start="() => onSelect(option)" :while-press="{ scale: 0.95 }" :while-focus="{ background : 'color-mix(in oklab, var(--color-primary) 10%, transparent)'}"  >
                        <slot :name="`tab-${index}`" :selected="option.value === model" :display="option.display" :icon="option.icon ?? ''">
                            <Icon v-if="option.icon.length" :name="option.icon" :color="option.value === model ? '!text-primary transition' : ''" center/>
                            <span v-else>{{ option.display }}</span>
                        </slot>
                    </motion.button>
                </li>
            </ul>
            <div :class="__class_border"></div>
            <span class="rotate-90"></span>
        </nav>
    </div>
</template>

<style lang='scss' scoped>

.ip-input-label {
    max-width: calc(100% + 30px);
    pointer-events: none;
    transform-origin: left center;
    transition: all 250ms;
    transform: scale(0.85);
    padding: 0 14px;
    text-overflow: ellipsis;
    width: calc(100% - 12px);

    &.__disabled {
        background: linear-gradient(to top, rgba(0, 0, 0, 0) 42%, rgba(255, 255, 255, 1) 42%);
    }

}

</style>
