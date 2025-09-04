<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, default: false });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the checkbox field */
    label: { type: [String, Array], default: "" },
    /** The name attribute for the checkbox */
    name: String,
    /** The flex direction of the radio items */
    flex: {
        type: String, 
        default: 'row-reverse', 
        validator(value) {
            return (typeof value === 'string' && ['row', 'row-reverse', 'col', 'col-reverse'].includes(value))
        }
    },
    /** Forces the position and alignment of the flex elements along the main axis. */
    justify : {
        type: String, 
        default: 'end', 
        validator(value) {
            return (typeof value === 'string' && ['start', 'end', 'center', 'between'].includes(value))
        }
    },
    /** Value in checked state. */
    trueValue: { type: null, default: true },
    /** Value in unchecked state. */
    falseValue: { type: null, default: false },
    /** the true value wich is transformed into displayValue. */
    trueDisplayValue: { type: String, default: 'An' },
    /** the false value wich is transformed into displayValue. */
    falseDisplayValue: { type: String, default: 'Aus' },
    /** Border Radius of the select input. */
    rounded: {
        type: [ Number, Boolean],
        default: true,
        validator(value) {
            return (typeof value === 'number' || typeof value === 'boolean')
        }
    },
    /** The size of the component. */
    size: {
        type: [String, Number],
        default: 'medium',
        validator(value) {
            return (typeof value === 'string' && ['tiny', 'small', 'medium', 'large', 'xLarge'].includes(value) || typeof value === 'number')
        }
    },
    /** Whether the checkbox is readonly */
    readonly: Boolean,
    /** Whether the input can't be activated */
    disabled: Boolean,
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
})

const _id = computed(() => props.id || useId());
const { previousValue } = usePreviousValue(model);

const emit = defineEmits([
    'onFocus',
    'onChange',
    'onBlur',
    'onValueChanged',
]);

function _getEmitParams(event) {
    return {
        id: _id.value,
        originalEvent: event,
        value: model.value,
        name : props.name,
        label : props.label,
        displayValue: __displayValue.value,
        previousValue: previousValue.value,
        validationErrors: props.validationErrors
    }
}

/** Refs to the root element */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');

/** classes */
const __class_root = computed(() => {
    return [
        `ip-input-toggle flex items-start gap-3`,
        {
            'flex-row ': props.flex === 'row',
            'flex-row-reverse': props.flex === 'row-reverse',
            'flex-col': props.flex === 'col',
            'flex-col-reverse': props.flex === 'col-reverse',
        },
        {
            'justify-start' : props.justify === 'start',
            'justify-end' : props.justify === 'end',
            'justify-center' : props.justify === 'center',
            'justify-between pl-1.5' : props.justify === 'between'
        }
    ];
});
const __class_input_wrap = computed(() => {
    return [
        'ip-input-wrap relative shrink-0 transition',
        {
            ...(props.size && typeof props.size === 'string' && {
                'h-4 8': props.size === 'tiny',
                'h-[18px] 9': props.size === 'small',
                'h-5 w-10': props.size === 'medium',
                'h-6 w-10': props.size === 'large',
                'h-8 w-16': props.size === 'xLarge',
            })
        },
        {
            'rounded-full': typeof props.rounded === 'boolean' && props.rounded,
        },
        {
            ...(props.disabled !== undefined && {
                'bg-slate-50': props.disabled,
                'cursor-pointer': !props.disabled
            })
        },
        {
            'bg-primary': __selected.value,
            'bg-slate-200': !__selected.value
        }
    ]
})
const __style_input_wrap = computed(() => {
    return {
        height: typeof props.size === 'number' ? `${props.size}px` : null,
        width: typeof props.size === 'number' ? `${props.size * 2}px` : null
    }
})

const __class_border = computed(() => {
    return [
        'ip-text-border border-[0.5px] dark:border',
        __error.value
            ? 'border-red-500 shadow-input-error'
            : __focused.value
                ? 'border-primary shadow-input-focus'
                : __hovered.value
                    ? 'border-slate-500'
                    : 'border-slate-400 dark:border-slate-100/20'
    ];
});
const __class_label = computed(() => {
    return [
        'ip-input-label flex items-start gap-2 overflow-hidden transition duration-300 text-sm',
        {
            'text-red-500': __error.value,
            'text-slate-400': props.disabled || props.readonly,
            'text-slate-500': !__error.value,
        },
        {
            'cursor-pointer': !props.disabled && !props.readonly,
            'pointer-events-none': props.readonly
        },
        {
            '__focused': __focused.value
        }
    ];
})

const __class_input = computed(() => {
    return [
        'ip-input',
        {
            'cursor-pointer': !props.disabled && !props.readonly,
            'pointer-events-none': props.readonly
        }
    ]
})
const __class_slider = computed(() => {
    return [
        `ip-input-slider rounded-full h-full aspect-square absolute top-0 transition-[left] transition-[right] duration-300 drop-shadow-xl `,
        {   
            'left-0': !__selected.value,
            'right-0': __selected.value
        },
        {
            'bg-white dark:bg-slate-300 dark:bg-radial dark:from-slate-400/80 dark:to-slate-400': !__error.value,
            'bg-red-500 bg-radial from-red-500/80 to-red-500': __error.value
        }
    ];
})
const __class_error_icon = computed(() => {
    if (__error.value) {
        return 'text-red-500 mt-[3px]'
    }
    return (__focused.value && ((typeof model.value === 'string' && model.value.length > 0) || (typeof model.value === 'number' && !isNaN(model.value)))) || !__focused.value ? 'text-primary' : '';
})

/** computed attributes */
const __displayValue = computed(() => {
    return model.value === props.trueValue ? props.trueDisplayValue : props.falseDisplayValue
})
const __label = computed(() => {
    return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})
const __selected = computed(() => {
    return (model.value === props.trueValue);
})

/** states */
const { __focused } = useFocusState(props, inputRef);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);

onMounted(() => {
    console.log('onMounted InputToggle', props);
})

function onFocus(event) {
    emit('onFocus', _getEmitParams(event))
};
function onChange(event) {

    if (props.readonly || props.disabled) return;

    emit('onChange', _getEmitParams(event))
    emit('onValueChanged', _getEmitParams(event));

};
function onBlur(event) {
    emit('onBlur', _getEmitParams(event))
};

</script>

<template>
    <div :class="__class_root">
        <label v-if="label" :for="_id" :class="__class_label">
            <Icon v-if="__error" name="warning" :color="__class_error_icon" />
            <slot name="label" :label="__label" :error="__error">
                <span class="text-ellipsis overflow-hidden text-left " v-html="__label"></span>
            </slot>
        </label>
        <div :class="__class_input_wrap" ref="inputWrapRef" :style="__style_input_wrap">
            <input :id="_id" :class="__class_input" type="checkbox" :name v-model="model" :true-value :false-value :disabled @focus="onFocus" @change="onChange" @blur="onBlur" ref="inputRef" />
            <div :class="__class_slider"></div>
            <div :class="__class_border"></div>
        </div>
    </div>
</template>

<style lang='scss' scoped>
.ip-input {
    appearance: none;
    border-radius: inherit;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
}

.ip-input-slider{
    box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 2px 0px 0 hsla(0, 0%, 0%, 0.04), 0 2px 6px hsla(0, 0%, 0%, 0.13), 0 3px 3px hsla(0, 0%, 0%, 0.05);
}

.ip-text-border {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}


</style>