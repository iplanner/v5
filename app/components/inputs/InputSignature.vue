<script setup>
import SignaturePad from "signature_pad";

/** The value when being manually set. **/
const model = defineModel({ required: true, type: String, default: null });

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
    /** The rows attribute for the textarea */
    rows: { type: Number, default: 6 },
    /** Whether the input is readonly */
    readonly: { type: Boolean, default: false },
    /** Whether the dropdown can't be activated */
    disabled: { type: Boolean, default: false },
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
})

const _id = computed(() => props.id || useId());
const emit = defineEmits([
    'onFocus',
    'onBlur',
    'onValueChanged'
]);

const { previousValue } = usePreviousValue(model);

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

/** Refs to the root element */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');
const canvasRef = useTemplateRef('canvasRef');


/** computed classes */
const __class_root = computed(() => {

    return [
        `ip-input-signature relative`,
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
            'cursor-pointer': !props.disabled,
            'bg-slate-50': props.disabled,
        },
        {
            'rounded-xl': typeof props.rounded === 'boolean' && props.rounded,
        },
        {
            'overflow-hidden': __empty.value && !__focused,
        }
    ];
})
const __class_border = computed(() => {
    return [
        'ip-text-border border-[0.5px] dark:border',
        {
            'border-primary shadow-input-focus': __focused.value && !__error.value,
            'border-slate-400 dark:border-slate-100/20': !__focused.value && !__error.value && !__hovered.value,
            'border-red-500 shadow-input-error': __error.value,
            'border-slate-500': __hovered.value && (!__focused.value && !__error.value)
        }
    ];
})
const __class_label = computed(() => {

    return [
        'ip-input-label flex items-center overflow-hidden transition duration-300 select-none',
        {
            'text-slate-500': !__focused.value && !__error.value && !__hovered.value,
            'text-slate-400': __hovered.value && (!__focused.value && !__error.value),
            'text-primary': __focused.value && !__error.value,
            'text-red-500': __error.value,
            'text-sm': props.size === 'tiny' && __empty.value,
        },
        {
            'bg-slate-50 dark:bg-primary-1100': !props.disabled,
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
        }
    ];
})
const __class_input = computed(() => {
    return [
        'relative -z-10 w-full'
    ]
})
const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __class_canvas = computed(() => {
    return [
        'size-full absolute inset-0 z-1 fill-primary',
    ]
})

/** computed attributes */
const __label = computed(() => {
    return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})

/** input states */
const { __focused } = useFocusState(props, inputRef);
const { __filled, __empty } = useInputState(model)
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);


/** signature */
let signaturePad = ref(null);

function _initSignature() {

    const canvas = canvasRef.value;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    signaturePad.value = new SignaturePad(canvas, {
        penColor : '#1a73e8'
    });

    if(model.value){
        // Render modelValue To 
        signaturePad.value.fromDataURL(model.value);
    }

    

    signaturePad.value.addEventListener("endStroke", (event) => {
      
        model.value = signaturePad.value.toDataURL();
        nextTick(() => {
            onInput(event);
        })       
    });
}
watchEffect(() => {
  
    if (!signaturePad.value) return;

  // Aktivieren/Deaktivieren
  if (!props.disabled && !props.readonly) {
    signaturePad.value.on();
  } else {
    signaturePad.value.off();
  }
});

onMounted(() => {
    console.log(`onMounted InputSignature`, props);
    _initSignature();
    
})

function onFocus(event) {
    emit('onFocus', _getEmitParams(event))
};
function onInput(event) {
    if (props.readonly || props.disabled) return;
    const params = _getEmitParams(event);
    emit('onValueChanged', params)
};
function onBlur(event) {
    emit('onBlur', _getEmitParams(event))
};

function onClear(event){
    if(signaturePad.value){
        inputRef.value.focus()
        signaturePad.value.clear()
        model.value = "";
        nextTick(() => {
            onInput(event)
        })
    }
}

</script>

<template>
    <div :class="__class_root" :style="__style_root">
        <div :class="__class_input_wrap" ref="inputWrapRef" >
            <canvas :class="__class_canvas" ref="canvasRef" @pointerdown="inputRef.focus()" @click="inputRef.focus()"></canvas>
            <IconBox v-if="model" class="absolute! right-0 top-0 group z-10" @click.stop="onClear"><Icon name="circle-xmark" color="text-slate-400 dark:text-slate-500 group-hover:text-primary" :size="14" center /></IconBox>
            <textarea :id="_id" :class="__class_input" :rows :name readonly="true" :disabled autocomplete="off" @focus="onFocus" @input="onInput" @blur="onBlur" ref="inputRef"></textarea>
            <label v-if="label" :for="_id" :class="__class_label">
                <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
                <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
            </label>
        </div>
        <div :class="__class_border"></div>
    </div>
</template>

<style lang='scss' scoped>
textarea {
    appearance: none;
    outline: 0 none;
    resize: none;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

.ip-input-label {
    position: absolute;
    top: 18px;
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

.ip-text-border {
    position: absolute;
    inset: -1px;
    pointer-events: none;
    border-radius: inherit;
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}
</style>
