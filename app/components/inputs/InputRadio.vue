<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, default: null });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the checkbox field */
    label: String,
    /** The name attribute for the checkbox */
    name: String,
    /** The value which is emitted when the radio is checked */
    trueValue: { type: null, default: null },
    /** The displayValue which is emitted when the radio is checked. */
    trueDisplayValue: { type: String, default: "" },
    /** The flex direction of the radio items */
    flex: {
        type: String, 
        default: 'row-reverse', 
        validator: (value) => ['row', 'row-reverse', 'col', 'col-reverse'].includes(value)
    },
    /** Forces the position and alignment of the flex elements along the main axis. */
    justify: {
        type: String, 
        default: 'end', 
        validator: (value) => ['start', 'end', 'center', 'between'].includes(value)
    },
    rounded: {
        type: [Number, Boolean],
        default: true,
        validator: (value) => typeof value === 'number' || typeof value === 'boolean'
    },
    /** The size of the component. */
    size: {
        type: [String, Number],
        default: 'medium',
        validator: (value) => (typeof value === 'string' && ['tiny', 'small', 'medium', 'large', 'xLarge'].includes(value)) || typeof value === 'number'
    },
   /** Whether the input is enclosed by a border. */
    bordered: { type: Boolean, default: false },
    /** Whether the radiobox is readonly */
    readonly: { type: Boolean, default: false },
    /** Whether the input can't be activated */
    disabled: { type: Boolean, default: false },
    /** The validation for the input e.g. [ ['required'], ['endsWith','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation failed e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
});

// Computed ID mit besserer Performance
const _id = computed(() => props.id ? `radio_${props.id}` : useId());

const emit = defineEmits([
    'onFocus',
    'onChange', 
    'onBlur',
    'onValueChanged',
]);

// Memoized emit params function
const _getEmitParams = (event) => ({
    id: props.id,
    originalEvent: event,
    value: model.value,
    name: props.name,
    displayValue: __displayValue.value,
    previousValue: previousValue.value,
    validationErrors: props.validationErrors
});

/** Refs to the root element */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');

const { previousValue } = usePreviousValue(model);

// Memoized size classes für bessere Performance
const SIZE_CLASSES = {
    tiny: 'h-[14px] w-[14px]',
    small: 'h-[16px] w-[16px]',
    medium: 'h-[18px] w-[18px]',
    large: 'h-[20px] w-[20px]',
    xLarge: 'h-[22px] w-[22px]'
};

const FLEX_CLASSES = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse'
};

const JUSTIFY_CLASSES = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between pl-1.5'
};

// Optimierte computed properties mit besserer Performance
const __class_root = computed(() => [
    'ip-input-radio flex items-center gap-2',
    FLEX_CLASSES[props.flex],
    JUSTIFY_CLASSES[props.justify],
    props.bordered && 'border border-slate-100/20 hover:border-slate-500 transition duration-300 px-4 hover:scale-99',
    props.bordered && props.size === 'xLarge' && 'py-[15px] rounded-xl',
    props.bordered && props.size === 'large' && 'py-[13px] rounded-lg',
    !props.disabled && !props.readonly && props.bordered && 'cursor-pointer'
].filter(Boolean));

const __class_input_wrap = computed(() => [
    'relative shrink-0',
    SIZE_CLASSES[props.size] || `h-[${props.size}px] w-[${props.size}px]`,
    typeof props.rounded === 'boolean' && props.rounded && 'rounded-full',
    props.disabled && 'bg-slate-50',
    !props.disabled && 'cursor-pointer'
].filter(Boolean));

const __class_checked = computed(() => [
    'bg-primary rounded-full w-[50%] h-[50%] absolute left-[50%] top-[50%] transform duration-300 -translate-y-[50%] -translate-x-[50%]',
    __checked.value ? 'scale-100 bg-primary' : 'scale-75 bg-primary/10'
]);

const __class_border = computed(() => {
    const baseClass = 'ip-text-border border-[0.5px] dark:border';
    
    if (__error.value) {
        return [baseClass, 'border-red-500 shadow-input-error'];
    }
    if (__focused.value) {
        return [baseClass, 'border-primary shadow-input-focus'];
    }
    if (__hovered.value) {
        return [baseClass, 'border-slate-500'];
    }
    return [baseClass, 'border-slate-400 dark:border-slate-100/20'];
});

const __class_label = computed(() => [
    'ip-input-label flex items-center overflow-hidden transition duration-300',
    __error.value && 'text-red-500',
    (props.disabled || props.readonly) && 'text-slate-400',
    !props.disabled && !props.readonly && 'cursor-pointer',
    props.readonly && 'pointer-events-none',
    __focused.value && '__focused'
].filter(Boolean));

const __class_input = computed(() => [
    'ip-input',
    !props.disabled && !props.readonly && 'cursor-pointer',
    props.readonly && 'pointer-events-none'
].filter(Boolean));

const __class_error_icon = computed(() => {
    if (__error.value) return 'text-red-500';
    
    const hasValue = (typeof model.value === 'string' && model.value.length > 0) || 
                    (typeof model.value === 'number' && !isNaN(model.value));
    
    return (__focused.value && hasValue) || !__focused.value ? 'text-primary' : '';
});

/** computed attributes */
const __displayValue = computed(() => 
    model.value === props.trueValue ? props.trueDisplayValue : null
);

const __label = computed(() => 
    !__error.value ? props.label : props.validationErrors[0]?.message
);

/** states */
const { __focused } = useFocusState(props, inputRef);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);
const __checked = computed(() => props.trueValue === model.value);

// Event handlers optimiert
const onFocus = (event) => {
    emit('onFocus', _getEmitParams(event));
};

const onChange = (event) => {
    if (props.readonly || props.disabled) return;
    
    const params = _getEmitParams(event);
    emit('onChange', params);
    emit('onValueChanged', params);
};

const onBlur = (event) => {
    emit('onBlur', _getEmitParams(event));
};

// Optimierte Root Click Handler
const onRootClicked = (event) => {
    if (!props.bordered) return;
    
    const target = event.target;
    if (target.closest('label') || target.tagName.toLowerCase() === 'input') {
        return;
    }

    model.value = props.trueValue;
    inputRef.value?.focus();
    
    nextTick(() => onChange(event));
};

// Development only
if (import.meta.env.DEV) {
    onMounted(() => {
        console.log('onMounted InputRadio', props);
    });
}

</script>

<template>
    <div :class="__class_root" @click="onRootClicked">
        <label :for="_id" :class="__class_label">
            <Icon 
                v-if="__error" 
                name="warning" 
                :color="__class_error_icon" 
                :size="13" 
            />
            <slot name="label" :label="__label" :error="__error">
                <span 
                    class="text-ellipsis overflow-hidden text-left text-gray-700 text-sm" 
                    v-html="__label"
                />
            </slot>
        </label>
        
        <div :class="__class_input_wrap" ref="inputWrapRef">
            <input 
                :id="_id" 
                :class="__class_input" 
                type="radio" 
                :name="props.name"
                v-model="model" 
                :value="trueValue" 
                :disabled="props.disabled"
                @focus="onFocus" 
                @change="onChange" 
                @blur="onBlur" 
                ref="inputRef"
            />
            <div :class="__class_checked" />
            <div :class="__class_border" />
        </div> 
    </div>
</template>

<style lang='scss' scoped>
.ip-input {
    appearance: none;
    border-radius: inherit;
    background: transparent;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border: 1px solid transparent;
}

.ip-text-border {
    position: absolute;
    inset: -1px;
    pointer-events: none;
    border-radius: inherit;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>