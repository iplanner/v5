<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, type: [String, Number, Array], default: "" });

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the input field */
    label: String,
    /** The name attribute for the input field */
    name: String,
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
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Whether the dropdown can't be activated */
    disabled: Boolean,
    /** The number of characters to initiate. */
    length: { type: Number, default: 6 },
    /* The default pattern for only numbers */
    pattern: { type: String, default: '^[0-9]*$'},
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
    'onInput',
    'onBlur',
    'onKeyDown',
    'onKeyUp',
    'onValueChanged'
]
);
function _getEmitParams(event) {
    return {
        id: _id.value,
        originalEvent: event,
        value: model.value,
        name : props.name,
        displayValue: model.value,
        previousValue: previousValue.value,
        validationErrors: props.validationErrors
    }
}

const rootRef = useTemplateRef('rootRef');
const itemRef = useTemplateRef('itemRef');

let isPasted = false;
let lastEvent = null;

// create the items repetition
const items = ref([]);
watchEffect(() => {
    if (!items.value.length) {
        for (let i = 0; i < props.length; i++) {
            const value = model.value;
            if (typeof value === 'number') {
                const valueAsString = value.toString();
                items.value.push(i < valueAsString.length ? valueAsString[i] : '');
            } else if (typeof value === 'string') {
                items.value.push(i < value.length ? value[i] : '');
            } else if (Array.isArray(value)) {
                items.value.push(i < value.length ? value[i] : '');
            } else {
                items.value.push('');
            }
        }
    }
});

const __class_root = computed(() => {

    return [
        `ip-input-group relative flex items-center gap-2`,
    ];

});

const __class_label = computed(() => {

    return [
        'ip-input-label flex items-center overflow-hidden transition duration-300 select-none',
        {
            'text-slate-400': !__focused.value && !__error.value && !__hovered.value,
            'text-slate-500': __hovered.value && (!__focused.value && !__error.value),
            'text-primary': __focused.value && !__error.value,
            'text-red-500': __error.value,
        },
        {
            'bg-white dark:bg-primary-1100': !props.disabled,
            'bg-slate-50': props.disabled
        },
    ];
})


const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __label = computed(() => (!__error.value) ? props.label : `&nbsp;`)

const __focused = ref(false)
const { focused } = useFocusWithin(rootRef);
watchEffect(() => {
    __focused.value = focused.value;
    if (focused.value) {
        emit('onFocus', _getEmitParams(lastEvent));
    } else {
        // Wenn der gesamte Container den Fokus verliert
        setTimeout(() => {
            const root = rootRef.value;
            if (root && !root.contains(document.activeElement)) {
                emit('onBlur', _getEmitParams(lastEvent));
            }
        }, 0);
    }
});
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, rootRef);


onMounted(() => {
    console.log(`onMounted InputCode`, props);
})

function onFocus(event) {
    lastEvent = event.originalEvent;
};
function onBlur(event) {
    lastEvent = event.originalEvent;
};
function onKeyDown(event, index) {

    const { originalEvent, value } = event;
    lastEvent = originalEvent;

    if (originalEvent.key.toLowerCase() === 'v' && (originalEvent.metaKey || originalEvent.ctrlKey)) {
        isPasted = true;
        return;
    }

    const cursorPosition = getCursor(originalEvent.target);

    if (['ArrowLeft', 'Backspace'].includes(originalEvent.key) && cursorPosition.start === 0) {
        const nextIndex = Math.max(index - 1, 0);
        itemRef.value[nextIndex]?.inputRef.focus();
    }

    if (['ArrowRight'].includes(originalEvent.key) && cursorPosition.end === value.length) {
        const nextIndex = Math.min(index + 1, items.value.length - 1);
        itemRef.value[nextIndex]?.inputRef.focus();
    }

    emit('onKeyDown', _getEmitParams(originalEvent))
}

function onInput(event, index) {

    if (isPasted) return;

    const { originalEvent, value } = event;

    if (!['Tab', 'ArrowRight', 'ArrowLeft'].includes(originalEvent.key) && value.trim().length) {
        const nextIndex = Math.min(index + 1, items.value.length - 1);
        itemRef.value[nextIndex]?.inputRef.focus();
    }

    if (originalEvent.key === 'Backspace' && !value.trim().length) {
        const previousIndex = Math.max(index - 1, 0);
        itemRef.value[previousIndex]?.inputRef.focus();
    }

    items.value[index] = value.trim();

    if (typeof model.value === 'number' || props.pattern) {
        model.value = parseInt(items.value.join(''), 10)
    } else if (typeof model.value === 'string') {
        ;
        model.value = items.value.join('');
    } else if (Array.isArray(model.value)) {
        model.value = [...items.value];
    }

    isPasted = false;

    emit('onInput', _getEmitParams(originalEvent))
    emit('onValueChanged', _getEmitParams(originalEvent))

}

function onKeyUp(event) {
    emit('onKeyUp', _getEmitParams(event.originalEvent))
}

function onPaste(event) {

    const { originalEvent } = event;
    lastEvent = originalEvent;

    const clipboardData = originalEvent.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');

    const regex = props.pattern ? new RegExp(props.pattern) : null;
    const filteredData = regex
        ? pastedData.split("").filter(value => regex.test(value)).join('')
        : pastedData;

    const values = filteredData.split("").map((regex) ? Number : String);
    values.forEach((item, index) => {
        if (index < items.value.length) {
            items.value[index] = item;
        }
    });

    const nextIndex = Math.min(values.length - 1, items.value.length - 1);
    itemRef.value[nextIndex]?.inputRef.focus();

    model.value = filteredData;
}

</script>

<template>
    <div :id="_id" :class="__class_root" ref="rootRef">
        <template v-for="(item, index) in items" :key="index">
            <slot name="before" :index="index"></slot>
            <InputText v-model="items[index]" :name="`${name}[${index}]`" :size :readonly :disabled :maxlength="1"
                :pattern text-align="center" :validationErrors @onFocus="onFocus" @onBlur="onBlur" @onKeyUp="onKeyUp"
                @onKeyDown="onKeyDown($event, index)" @onInput="onInput($event, index)" @onPaste="onPaste"
                class="flex-1" ref="itemRef" />
            <slot name="after" :index="index"></slot>
        </template>
        <label v-if="props.label" :for="_id" :class="__class_label">
            <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
            <span class="text-ellipsis overflow-hidden whitespace-nowrap" v-html="__label"></span>
        </label>
    </div>
</template>

<style lang='scss' scoped>
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
    z-index: 10;

    &.__focused,
    &:not(.__empty),
    .__error {
        transform: translateY(-100%) scale(0.85);
        top: 8px;
    }

    &.__disabled {
        background: linear-gradient(to top, rgba(0, 0, 0, 0) 42%, rgba(255, 255, 255, 1) 42%);
    }

}
</style>
