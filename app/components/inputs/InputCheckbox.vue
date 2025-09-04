<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, default: false });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the checkbox field */
    label: { type: String, default: '' },
    /** The name attribute for the checkbox */
    name: { type: String, default: '' },
    /** Select only one value instead of multiple values. */
    binary: { type: Boolean, default: true },
    /** Value in checked state. */
    trueValue: { type: null, default: true },
    /** Value in unchecked state. */
    falseValue: { type: null, default: false },
    /** the true value wich is transformed into displayValue. */
    trueDisplayValue: { type: String, default: 'ja' },
    /** the false value wich is transformed into displayValue. */
    falseDisplayValue: { type: String, default: 'nein' },
    /** Border Radius of the select input. */
    rounded: {
        type: [Number, Boolean],
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
    /** Whether the group has an outside border. */
    bordered: { type: Boolean, default: false },
    /** Whether the checkbox is readonly */
    readonly: Boolean,
    /** Whether the input can't be activated */
    disabled: Boolean,
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] },
})

const emit = defineEmits([
    'onFocus',
    'onChange',
    'onBlur',
    'onValueChanged',
]);


const _id = computed(() => props.id ?? useId());
const _labelId = useId();


function _getEmitParams(event) {
    return {
        id: _id.value,
        originalEvent: event,
        value: model.value,
        name : props.name,
        displayValue: __displayValue.value,
        previousValue: previousValue.value,
        validationErrors: props.validationErrors
    }
}

/** Refs to the root element */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');

const { previousValue } = usePreviousValue(model);
const { __focused } = useFocusState(props, inputRef);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);

/** classes */
const __class_root = computed(() => [
        `ip-checkbox flex items-center`,
        {
            'border-[0.5px] dark:border border-slate-400 dark:border-slate-100/20 dark:bg-linear-to-b dark:from-primary-1100 dark:to-primary-1000/25 px-4 py-3 rounded-xl cursor-pointer transition duration-300 hover:border-primary hover:scale-99' : props.bordered,
        },
        {
            'gap-3' : props.label.length
        }
    ]);
const __class_input_wrap = computed(() => {
    return [
        'relative shrink-0',
        {
            'h-[14px] w-[14px]': props.size === 'tiny',
            'size-4': props.size === 'small',
            'h-[18px] w-[18px]': props.size === 'medium',
            'size-5': props.size === 'large',
            'h-[22px] w-[22px]': props.size === 'xLarge',
        },
        {
            'rounded-lg': typeof props.rounded === 'boolean' && props.rounded,
        },
        {
            'cursor-pointer': !props.disabled
        }
    ]
})
const __class_border = computed(() => [
    'absolute -inset-[1px] pointer-events-none border border-transition rounded-[inherit]',
    {
        'border-primary shadow-input-focus': __focused.value && !__error.value,
        'border-red-500 shadow-input-error': __error.value,
        'border-slate-400/80': __hovered.value && !__focused.value && !__error.value,
        'border-slate-300 dark:border-slate-100/20': !__focused.value && !__error.value && !__hovered.value
    }
])

const __class_label = computed(() => [
        'flex items-center overflow-hidden transition duration-300',
        {
            'text-red-500': __error.value,
            'text-slate-400': props.disabled || props.readonly,
            'dark:text-slate-100' : !__error.value
        },
        {
            'cursor-pointer': !props.disabled && !props.readonly,
            'pointer-events-none': props.readonly
        },
        {
            '__focused': __focused.value
        }
    ])
const __class_input = computed(() => {
    return [
        'ip-input',
        {
            'cursor-pointer': !props.disabled && !props.readonly,
            'pointer-events-none': props.readonly
        }
    ]
})
const __class_error_icon = computed(() => {
    if (__error.value) {
        return 'text-red-500'
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

/** values */
const __icon_name = computed(() => {
    if (props.binary) {
        return (model.value === props.trueValue) ? "check" : "";
    } else {
        if (props.value != null && Array.isArray(model.value) && model.value.length) {
            for (let val of model.value) {
                return "check"
            }
        }
        return ""
    }
})
const __icon_color = computed(() => {
    if (__error.value) {
        return 'text-red-500'
    }
    return 'text-primary';
})
const __icon_size = computed(() => {

    const map = {
        tiny: 10,
        small: 11,
        medium: 12,
        large: 13,
        xLarge: 14
    }
    return map[props.size] ?? 10;
})

onMounted(() => {
    console.log('onMounted InputCheckbox', props);
})

function onFocus(event) {
    emit('onFocus', _getEmitParams(event))
};
function onChange(event) {
    console.log('onChange', event, _getEmitParams(event))

    if (props.readonly || props.disabled) return;

    emit('onChange', _getEmitParams(event))
    emit('onValueChanged', _getEmitParams(event));

};
function onBlur(event) {
    console.log('onBlur', event)
    emit('onBlur', _getEmitParams(event))
};

</script>

<template>
    <div :class="__class_root" >
        <div :class="__class_input_wrap" ref="inputWrapRef">
            <input :id="_labelId" :class="__class_input" type="checkbox" :name v-model="model" :true-value :false-value :disabled @focus="onFocus" @change="onChange" @blur="onBlur" ref="inputRef"/>
            <Icon v-if="__icon_name" :name="['regular',__icon_name]" :color="__icon_color" :size="__icon_size" center />
            <div :class="__class_border"></div>
        </div>
        <label v-if="label" :for="_labelId" :class="__class_label">
            <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
            <slot name="label" :label="__label"><span class="text-ellipsis overflow-hidden text-left text-sm text-slate-500" v-html="__label"></span></slot>
        </label>
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

.border-transition {
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}
</style>