<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, type: [String, Number, null], default: null });
/** Whether the dropdown options are shown or hidden*/
const opened = defineModel('opened', Boolean);

/**
* @typedef {Array|Object} options
* @property {Number} value - the value ofe the option
* @property {String} display - the displayed value of the option
* @property {String} selected - the selected option
*/

const props = defineProps({
    /** The attrId for the input field if exist */
    id: { type: [Number, String], default: null },
    /** The label for the select field */
    label: String,
    /** The css class for the input label e.g. for background */
    labelClass: { type: String, default: "bg-white dark:bg-primary-1100" },
    /** The name attribute for the select field */
    name: { type: String, default: "" },
    /** The placeholder for the select field */
    placeholder: { type: String, default: "" },
    /** The dropdown options of the select */
    options: { type: Array, default: () => [] },
    /** The height of each option elemment in px */
    itemHeight: { type: Number, default: 30 },
    /** The minimal visible options - stop overflow*/
    minItems: { type: Number, default: 4 },
    /** The maximal visible options start overflow - default 75vh */
    maxItems: { type: Number, default: Infinity },
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
    /** Whether the select field is searchable */
    search: Boolean,
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

const _id = computed(() => props.id || useId());
const slots = useSlots();

const emit = defineEmits([
    'onClick',
    'onFocus',
    'onInput',
    'onBlur',
    'onKeyDown',
    'onValueChanged',
    'onSelect'
]);

function _getEmitParams(event) {
    return {
        id: _id.value,
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
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');
const optionsRef = useTemplateRef('optionsRef');

const { previousValue } = usePreviousValue(model);

/** watch window resize & scroll events*/
const { height :__windowHeight, width : __windowWidth } = useResizeEvent();
const { scrollEvent } = useScrollEvent();
watch(scrollEvent, event => {
    // close the options dropdown if target is not in the optionsRef
    if (opened.value && event.target.closest('div') !== optionsRef.value) {
        opened.value = false;
        optionsRef.value.blur();
    }
});

/** computed classes */
const __class_root = computed(() => {

    return [
        `ip-input-select relative`,
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
const __class_input_wrap = computed(() => {

    return [
        `flex items-center transition relative z-10 h-full dark:bg-primary-1100 dark:bg-linear-to-b dark:from-primary-1100 dark:to-primary-1000/25`,
        {
            'cursor-pointer': !props.disabled,
            'bg-slate-50': props.disabled
        },
        {
            'gap-1': props.readonly,
            'ml-0': props.readonly && !slots.suffix,
            'ml-1': slots.suffix,
        },
        {
            'rounded-xl': typeof props.rounded === 'boolean' && props.rounded,
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
        'ip-input-label flex items-center overflow-hidden transition duration-300 select-none text-sm',
        {
            'text-red-500': __error.value, // Fehler hat höchste Priorität
            'text-primary': __focused.value && !__error.value, // Fokus, aber kein Fehler
            'text-slate-400': __hovered.value || (__filled.value || __empty.value) && !__error.value, // Hover oder gefüllt/leer ohne Fehler
            'text-slate-500': !__focused.value && !__error.value && !__hovered.value, // Standardfarbe, wenn nichts aktiv ist
        },
        {
            'bg-slate-50': props.disabled
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
        'ip-input', //text-ellipsis !overflow-hidden whitespace-nowrap
        {
            'text-red-500' : __error.value,
            'text-slate-800 dark:text-slate-200' : !__error.value,
            'text-sm': props.size === 'tiny',
            '!pl-0': slots.prefix,
            '!pr-0': slots.suffix,
            'bg-slate-50': props.disabled,
            'placeholder-transparent': (_getSelectedOption().display.length < props.placeholder.length) && !__focused.value
        },
        {
            /* 'h-[22px]': props.size === 'tiny', */
            'text-sm': props.size === 'small',
            'text-sm': props.size === 'medium',
            /* 'h-[34px]': props.size === 'medium',
            'h-[40px]': props.size === 'large',
            'h-[46px]': props.size === 'xLarge', */
        },
    ]
})
const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

/** computed for options */
const __class_options = computed(() => {
    return [
        `absolute bg-white dark:bg-slate-900/50 dark:backdrop-blur-3xl rounded-xl overflow-auto drop-shadow`,
        {
            'p-2': props.options.length,
            '!shadow-none !border-0': !props.options.length,
        }
    ]
});
const __class_option_item = function (option) {
    return [
        `flex items-center px-2 rounded-lg cursor-pointer transition dark:text-slate-200`,
        {
           'text-sm': props.size === 'medium',
            'bg-primary/10': option.selected,
            'bg-primary/5': option.active && !option.selected,
            'hover:bg-primary/5 dark:hover:bg-primary/20': !option.selected
        }
    ]
}
const __style_options = computed(() => {

    void __windowWidth.value;

    const { x, top, height, width } = rootRef.value.getBoundingClientRect();

    const spacing = 3;
    const _height = height + spacing;
    const _bottom = top + _height;

    const spaceBelow = __windowHeight.value - _bottom;
    const spaceAbove = top;

    const calculateOptionsHeight = () => {

        const maxOptionsHeight = props.maxItems > 0 && props.maxItems !== Infinity
            ? props.maxItems * props.itemHeight
            : __windowHeight.value * 0.75;

        const currOptionsHeight = props.options.length * props.itemHeight + 16;

        const minOptionsHeight = props.minItems * props.itemHeight + 16;
    
        const availableSpace = spaceAbove > spaceBelow ? spaceAbove : spaceBelow;
        return Math.min(
            Math.max(minOptionsHeight, Math.min(currOptionsHeight, maxOptionsHeight)),
            availableSpace
        );

    };

    const optionsHeight = calculateOptionsHeight();

    return {
        top: `${_bottom}px`,
        left: `${x - 1}px`,
        width: `${width + 2}px`,
        maxHeight: `${optionsHeight}px`,
        zIndex: 99999999,
        transform: (spaceAbove > spaceBelow)
            ? `translate(0, calc(-100% - ${_height + 8}px))`
            : `translate(0, 2px)`
    };
});

/** computed attributes */
const __display = ref(_getSelectedOption().display);
const __label = computed(() => (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`);


/** computed states */
const __dirty = ref(false);
const { __focused } = useFocusState(props, inputRef);
const __filled = computed(() => _getSelectedOption().value === model.value);
const __empty = computed(() => !__filled.value);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);

onMounted(() => {
    console.log(`onMounted InputSelect`, props);
})

/** events */
onClickOutside(inputWrapRef, event => {
    // close when opened && set display value to selected value or empty
    if (opened.value) {
       opened.value = false;
    }
})
onKeyStroke(['ArrowUp', 'ArrowDown'], (e) => {
    if ((props.readonly || props.disabled) && opened.value) {
        e.preventDefault();
    }
})
function onClick(event) {
    opened.value = !opened.value;
    emit('onClick', _getEmitParams(event))
}
function onFocus(event) {
    props.options.map(option => {
        option.selected = option.value === model.value;
        option.active = option.selected;
    });
    emit('onFocus', _getEmitParams(event))
};
function onInput(event) {
    __dirty.value = true;
    opened.value = true;

    const params = _getEmitParams(event);
    emit('onInput', params)
    emit('onValueChanged', params)
    
};
function onBlur(event) {
    //console.log('onBlur', event)

    opened.value = false;

    props.options.forEach(option => {
        option.active = false;
    });

    nextTick(() =>{
        emit('onBlur', _getEmitParams(event))
    })

   
};
function onKeyDown(event) {

    // only for Arrow Navigation up & down + enter to select a new option

    let index = props.options.findIndex(option => option.active);

    const moveSelection = (newIndex) => {

        const activeOption = props.options[newIndex];

        props.options.forEach(option => {
            option.active = (option.display === activeOption.display);
        });

        __display.value = activeOption.display;
    };

    if (event.key === 'ArrowDown') {

        if (!opened.value) {
            onToggle();
            return;
        }

        if (index >= 0 && index === props.options.length - 1) {
            moveSelection(0);
        }
        else if (index >= 0 && index < props.options.length - 1) {
            moveSelection(index + 1);
        } else if (index === -1) {
            moveSelection(0);
        }
    } else if (event.key === 'ArrowUp') {

        if (!opened.value) {
            onToggle();
        }

        if (index === 0) {
            moveSelection(props.options.length - 1);
        }
        else if (index > 0) {
            moveSelection(index - 1);
        }
    } else if (event.key === 'Enter') {

        opened.value = false;
        onSelect(props.options[index])
        inputRef.value.focus()

        event.preventDefault();

    }
}
function onToggle() {
    if(props.disabled) return;
    opened.value = !opened.value;
    if (opened.value) {
        inputRef.value.focus();
    }
}
function onSelect(selected) {

    previousValue.value = model.value;
    model.value = selected.value;

    props.options.forEach(option => {
        option.selected = selected.value === option.value;
        if (option.selected) {
            __display.value = option.display;
        }
    });

    __dirty.value = false;

    const _emitparams = _getEmitParams(null);
    const params = { ..._emitparams, value: selected.value, displayValue: __display.value, selected : toRaw(_getSelectedOption(selected.value)) };

    if (selected.value != previousValue.value) {
        emit('onValueChanged', params);
    }

    emit('onSelect', params);
}

/** watcher */
watch(model, () => {
  const selected = _getSelectedOption();
  __display.value = selected?.display || "";
  console.log("model changed:", model.value);
});
watch(opened, async (isOpen) => { 
  if (!isOpen) {
    __dirty.value = false;
    __display.value = _getSelectedOption().display;
    return;
  }
  
  await nextTick();

  const selected = _getSelectedOption();
  const optionElement = document.getElementById(`${_id}-${selected?.value}`);

  if (optionElement) {
    optionElement.scrollIntoView({ block: 'nearest' });
  }
});

/** helpers */function _getSelectedOption(selected = null) {
    return props.options.find(o => o.value === (selected ? selected : model.value)) || { value: undefined, display: "" };
}

defineExpose({
    _id,
});

</script>

<template>
    <!-- <pre>
model:{{ model }}
display : {{ __display }}
opened: {{  opened }} 
dirty: {{__dirty}}
</pre>  -->
    <div :class="__class_root" ref="rootRef">

        <div :class="__class_input_wrap" ref="inputWrapRef">
            <div class="ip-input-slot" v-if="$slots.prefix">
                <slot name="prefix"><Icon name="magnifying-glass" :size="12" center></Icon></slot>
            </div>
            <input :id="_id" :class="__class_input" type="text" :name v-model="__display" :placeholder :readonly :disabled @click="onClick" @focus="onFocus" @input="onInput" @blur="onBlur" @keydown="onKeyDown" autocomplete="off" ref="inputRef" />
            <label :for="_id" :class="__class_label">
                <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
                <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
            </label>
            <div class="ip-input-slot" @click.prevent="onToggle">
                <slot name="suffix"><Icon v-if="!disabled" :name="['regular', opened ? 'chevron-up text-primary' : 'chevron-down' ]" :size="10" center color="text-slate-500"></Icon></slot>
            </div>
        </div>
        <div :class="__class_border"></div>
        <Teleport v-if="opened" to="body">
            <Transition name="zoom" appear>
                <div ref="optionsRef" :class="__class_options" :style="__style_options">
                    <ul class="relative overflow-y-auto overflow-x-hidden w-full min-w-0">
                        <li :id="`${_id}-${option.value}`" v-for="option in options" :key="option.value" :class="__class_option_item(option)" @mousedown="onSelect(option)":style="{ height: `${props.itemHeight}px` }">
                            <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ option.display }}</span>
                        </li>
                    </ul>
                </div>
            </Transition>
        </Teleport>
    </div>

</template>

<style lang='scss' scoped>
.zoom-enter-active,
.zoom-leave-active {
    transition: transform 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.zoom-enter-from,
.zoom-leave-to {
    transform: scale(0);
    opacity: 0;
}

.zoom-enter-to,
.zoom-leave-from {
    transform: scale(1);
    opacity: 1;
}


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
    width: 34px;
    position: relative;
}

.ip-text-border {
    position: absolute;
    inset: -1px;
    pointer-events: none;
    border-radius: inherit;
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}
</style>
