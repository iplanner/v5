<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, type: [String, Number, null], default: null });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the input field */
    label: String,
    /** The css class for the input label e.g. for background */
    labelClass: { type: String, default: "bg-white dark:bg-primary-1100" },
    /** The name attribute for the input field */
    name: String,
    /** The placeholder for the input field */
    placeholder: { type: String, default: "" },
    /** The border radius of the component. */
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
    /** The type attribute for the input field */
    type: {
        type: String,
        default: 'text',
        validator(value) {
            return (typeof value === 'string' && ['text', 'password', 'textarea'].includes(value))
        }
    },
    /** The rows attribute for the input field only when of props.type textarea */
    rows: { type: Number, default: 3 },
    /** Whether the textareas height changed automatical when the size grows - only when of props.type textarea*/
    autoSize: { type: Boolean, default: true },
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Whether the dropdown can't be activated */
    disabled: Boolean,
    /** Whether the input has a autocomplete attribute */
    autocomplete: { type: String, default: "off" },
    /** The maxlength attribute for the input field */
    maxlength: Number,
    /** The minlength attribute for the input field d*/
    minlength: Number,
    /** The text-align css attribute */
    textAlign: { type: String, default: "left" },
    /** the pattern for the input field */
    pattern: String,
    /** Whether the input has a auto-focus */
    focus: Boolean,
    /** Whether the input has an prefix */
    prefix: String,
    /** Whether the input has an suffix */
    suffix: String,
    /** Whether the input has an prefix */
    startAddOn: String,
    /** Whether the input has an suffix */
    endAddOn: String,
    /** Whether to show an icon to display the password as plain text. */
    toggleMask: Boolean,
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
})



const slots = useSlots();
const _id = computed(() => props.id || useId());
const _type = ref(props.type);
watchEffect(() => {
    _type.value = props.type
})
const { previousValue } = usePreviousValue(model);

const emit = defineEmits([
    'onClick',
    'onFocus',
    'onInput',
    'onBlur',
    'onKeyPress',
    'onKeyDown',
    'onKeyUp',
    'onPaste',
    'onValueChanged'
]);

function _getEmitParams(event) {
    
    return {
        id: _id.value,
        originalEvent: event,
        value: typeof model.value === 'string' ? model.value.trim() : model.value,
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

watchEffect(() => {
    if (props.focus && inputRef.value) {
        inputRef.value.focus();
    }
})


/** computed classes */
const __class_root = computed(() => {

    return [
        `ip-input-${props.type} relative`,
        {
            'h-[22px]': props.size === 'tiny' && props.type !== 'textarea',
            'h-[28px]': props.size === 'small' && props.type !== 'textarea',
            'h-[34px]': props.size === 'medium' && props.type !== 'textarea',
            'h-[40px]': props.size === 'large' && props.type !== 'textarea',
            'h-[46px]': props.size === 'xLarge' && props.type !== 'textarea',
        },
        {
            'rounded-xl': typeof props.rounded === 'boolean' && props.rounded,
        }
    ];

});

const __style_root = computed(() => {
    return {
        height: typeof props.size === 'number' ? `${props.size}px` : null,
        borderRadius: props.rounded && typeof props.rounded === 'number' ? `${props.rounded}px` : null
    }
});

const __class_input_wrap = computed(() => {

    return [
        `flex items-center transition relative z-10 h-full dark:bg-linear-to-b dark:from-primary-1100 dark:to-primary-1000/25`,
        {
            'cursor-pointer': !props.disabled
        },
        {
            'gap-1': !slots.prefix && !slots.suffix,
            'ml-1': slots.prefix,
            'mr-1': slots.suffix
        },
        {
            'rounded-xl': typeof props.rounded === 'boolean' && props.rounded,
        },
        {
            'overflow-hidden': __empty.value && !__focused,
        }
    ];
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
const __class_label = computed(() => {

    return [
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
            '!top-5 !translate-y-0': props.type === 'textarea' && !__focused.value && __empty.value,
        },
        {
            '__focused': __focused.value,
            '__empty': __empty.value,
            '__filled': __filled.value,
            '__error': __error.value
        },
        (props.labelClass && !props.disabled) ? `${props.labelClass}` : ''
    ];
})
const __class_input = computed(() => {
    return [
        'ip-input selection:bg-primary/25 text-sm',
        {
            'text-left': props.textAlign === 'left',
            'text-center': props.textAlign === 'center',
            'text-right': props.textAlign === 'right',
            '!pl-0': slots.prefix,
            '!pr-0': slots.suffix,
            'bg-slate-50': props.disabled,
            'placeholder-transparent': __empty.value || !__focused.value,
            'placeholder:text-slate-400': !__empty.value || __focused.value || !props.label,
            'text-slate-800 dark:text-slate-200': __filled.value && !__error.value,
            'text-red-500' : __error.value,
        }
    ]
})
const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __class_add_on = computed(() => ({
  'flex items-center h-full px-3 select-none dark:text-slate-200': true,

  // Seitenränder
  'border-l-[0.5px] dark:border-l-0': props.endAddOn,
  'border-r-[0.5px]': props.startAddOn,

  // Zustände
  'border-slate-400': !__focused.value && !__error.value && !__hovered.value,
  'border-primary': __focused.value && !__error.value,
  'border-red-500': __error.value,
  'border-slate-500': __hovered.value && !__focused.value && !__error.value,

  // Hintergrund
  'bg-slate-100 dark:bg-primary-1000': !__error.value,

  // Rundungen
  'rounded-r-lg': props.rounded === true && props.endAddOn,
  'rounded-l-lg': props.rounded === true && props.startAddOn
}));

/** computed attributes */
const __displayValue = computed(() => model.value)
const __label = computed(() => {
    return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})

/** input states */
const { __focused } = useFocusState(props, inputRef);
const { __filled, __empty } = useInputState(model)
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);


onMounted(() => {
    console.log(`onMounted Input${props.type.charAt(0).toUpperCase() + props.type.slice(1)}`, props ,_id.value);
})

function _adjustHeight() {
    if (props.type === 'textarea' && props.autoSize) {

        const initialRows = inputRef.value.getAttribute('rows');
        inputRef.value.style.height = 'auto';
        const scrollHeight = inputRef.value.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(inputRef.value).lineHeight, 10);
        const minHeight = lineHeight * initialRows;
        inputRef.value.style.height = Math.max(scrollHeight, minHeight) + 'px';
    }

}

/** toggle mask */
const isMasked = ref(true);
const __masked_icon_name = computed(() => (isMasked.value) ? 'eye-slash' : 'eye');
function toggleMask() {
    isMasked.value = !isMasked.value;
    _type.value = isMasked.value ? 'password' : 'text';
}



function onClick(event) {
    emit('onClick', event)
}
function onFocus(event) {
    emit('onFocus', _getEmitParams(event))
};
function onInput(event) {
    if (props.readonly || props.disabled) return;
    const params = _getEmitParams(event);
    emit('onInput', params)
    emit('onValueChanged', params)
};
function onBlur(event) {
    emit('onBlur', _getEmitParams(event))
};
function onKeyPress(event) {

    if (props.pattern) {
        const regex = new RegExp(props.pattern);
        if (!regex.test(event.key)) {
            event.preventDefault();
        }
    }
    emit('onKeyPress', _getEmitParams(event))

};
function onKeyDown(event) {
    //console.log('onKeyDown',event);
    _adjustHeight();
    emit('onKeyDown', _getEmitParams(event))
};

function onKeyUp(event) {
    emit('onKeyUp', _getEmitParams(event))
};

function onPaste(event) {
    emit('onPaste', _getEmitParams(event))
};

defineExpose({
    _id,
    inputRef
});

</script>

<template>
    <div :class="__class_root" :style="__style_root">
        <div :class="__class_input_wrap" ref="inputWrapRef">
            <div v-if="startAddOn" :class="__class_add_on" >{{ startAddOn }}</div>
            <div v-if="$slots.prefix || prefix" class="ip-input-slot">
                <slot name="prefix">{{ prefix }}</slot>
            </div>
            <input v-if="type !== 'textarea'" :id="_id" :class="__class_input" :type="_type" :name v-model.trim="model"
                :placeholder :maxlength :minlength :readonly :disabled :autocomplete @click="onClick" @focus="onFocus"
                @input="onInput" @blur="onBlur" @keypress="onKeyPress" @keydown="onKeyDown" @keyup="onKeyUp"
                @paste="onPaste" ref="inputRef" />
            <textarea v-else :id="_id" :class="__class_input" :rows :name v-model.trim="model" :placeholder :maxlength
                :minlength :readonly :disabled :autocomplete @click="onClick" @focus="onFocus" @input="onInput"
                @blur="onBlur" @keydown="onKeyDown" @keyup="onKeyUp" @paste="onPaste" ref="inputRef"></textarea>
            <label v-if="label" :for="_id" :class="__class_label">
                <Icon v-if="__error" name="warning" :color="__class_error_icon" />
                <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
            </label>
            <div v-if="$slots.suffix || suffix" class="ip-input-slot" >
                <slot name="suffix" class="flex items-center">{{ suffix }}</slot>
            </div>
            <IconBox v-if="toggleMask && type === 'password'" @click="toggleMask()" class="mr-1">
                <Icon :name="__masked_icon_name" :color="__class_error_icon" :size="12" center />
            </IconBox>
            <div :class="__class_add_on" :style="__style_root" v-if="endAddOn">{{ endAddOn }}</div>
        </div>
        <div :class="__class_border"></div>
    </div>
</template>

<style lang='scss' scoped>

.ip-input {
    outline: none;
    caret-color: var(--color-primary);
    padding: 0 12px;
    flex: 1;
    min-width: 0;
    width: 100%;
    border-radius: inherit;
    height: inherit;
    background: transparent;
}

textarea.ip-input {
    padding: 12px 12px;
    resize: none;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

.ip-input-label {
    position: absolute;
    top: 50%;
    left: 8px;
    max-width: calc(100% + 30px);
    pointer-events: none;
    transform-origin: left center;
    transition: all 250ms;
    transform: translate(0, -50%);
    padding: 0 6px;
    text-overflow: ellipsis;
    width: calc(100% - 12px);

    &.__focused,
    &:not(.__empty),
    .__error {
        transform: translateY(-100%) scale(0.85);
        top: 8px;
        width: auto;
    }

    &.__disabled {
        background: linear-gradient(to top, rgba(0, 0, 0, 0) 42%, rgba(255, 255, 255, 1) 42%);
    }

}

.ip-input-slot {
    flex-shrink: 0;
    height: inherit;
    position: relative;
}

.border-transition {
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}
</style>
