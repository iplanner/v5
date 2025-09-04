<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, type: Array, default: () => [] });

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
    /** The rows attribute for the input field */
    rows: { type: Number, default: 4 },
    /** The acceptedFileTypes for the Uploader */
    acceptedFileTypes: { type: Array, default: () => [] },
    /** Enable or disable adding multiple files */
    allowMultiple: { type: Boolean, default: true },
    /** The maximum size of a file, for instance 5MB or 750KB*/
    maxFileSize: { type: String, default: '10MB' },
    /** Maximum size of all files in list, same format as maxFileSize*/
    maxTotalFileSize: { type: String, default: "1000MB" },
    /** The maxmimum number of files that can be uploaded in parallel */
    maxParallelUploads: { type: Number, default: 100 },
    /** Enable or disable drag n' drop */
    allowDrop: { type: Boolean, default: true },
    /** Enable or disable file browser */
    allowBrowse: { type: Boolean, default: true },
    /** Open the file browser when click on dropzone */
    browseOnClick: { type: Boolean, default: true },
    /** Whether the input has a autocomplete attribute */
    autocomplete: { type: String, default: "off" },
    /** Whether the input has a auto-focus */
    focus: Boolean,
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Whether the dropdown can't be activated */
    disabled: Boolean,
    /** The validation for the input e.g. [ ['required'], ['endsWidth','xxx']] */
    validation: { type: Array, default: () => [] },
    /** The Messages to be shown when a single validation faild e.g. required : "message goes here..." */
    validationMessages: { type: Object, default: () => ({}) },
    /** The errors for the input after the validation */
    validationErrors: { type: Array, default: () => [] }
})


const _id = computed(() => props.id || useId());
const __files_id = computed(() => `ip-files-wrap-${_id.value}`)
const { previousValue } = usePreviousValue(model);


const emit = defineEmits([
    'onFocus',
    'onInput',
    'onBlur',
    'onKeyPress',
    'onKeyUp',
    'onPaste',
    'onValueChanged',

    'onFileSuccess',
    'onProcessComplete',
    'onError'
]);

function _getEmitParams(event) {
    const _value = model.value?.map(({ extension, filePath, name, sizeFormatted }) => ({ extension, filePath, name, sizeFormatted })) || [];

    return {
        id: _id.value,
        originalEvent: event,
        value: _value,
        name : props.name,
        displayValue: _value.length ? _value.map(({ name, extension }) => `${name}.${extension}`).join(', ') : '',
        previousValue: previousValue?.value ?? '',
        validationErrors: props?.validationErrors ?? []
    };
}

/** Refs to the root element */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');

watchEffect(() => {
    if (props.focus) {
        inputRef.value.focus();
    }
})


/** computed classes */
const __class_root = computed(() => {
    return [
        `ip-input-upload relative`,
        {
            'rounded-lg': typeof props.rounded === 'boolean' && props.rounded,
        }
    ];
});
const __style_root = computed(() => ({
  height: typeof props.size === 'number' ? `${props.size}px` : null,
  borderRadius: typeof props.rounded === 'number' && props.rounded
    ? `${props.rounded}px`
    : null
}));

const __class_input_wrap = computed(() => {
    return [
        `ip-text-input-wrap transition relative z-10 rounded-inherit h-full`,
        {
            'cursor-pointer': !props.disabled,
            'bg-slate-50': props.disabled
        }
    ];
})
const __class_input = computed(() => {
    return [
        'ip-input',
        {
            'bg-slate-50': props.disabled,
            'placeholder-transparent': __empty.value || !__focused.value,
            'placeholder:text-slate-400': !__empty.value || __focused.value || !props.label
        }
    ]
})
const __class_border = computed(() => {
    return [
        'ip-text-border border-[0.5px]',
        {
            'border-primary shadow-input-focus': __focused.value && !__error.value,
            'border-slate-400': !__focused.value && !__error.value && !__hovered.value,
            'border-red-500 shadow-input-error': __error.value,
            'border-slate-500': __hovered.value && (!__focused.value && !__error.value) || dragover.value
        }
    ];
})
const __class_label = computed(() => {

    return [
        'ip-input-label flex items-center overflow-hidden transition duration-300 select-none',
        {
            'text-slate-400': !__focused.value && !__error.value && !__hovered.value,
            'text-slate-500': __hovered.value && (!__focused.value && !__error.value) || dragover.value,
            'text-primary': __focused.value && !__error.value,
            'text-red-500': __error.value,
            'text-sm': props.size === 'tiny' && __empty.value,
        },
        {
            'bg-white': !props.disabled,
            'bg-slate-50': props.disabled
        },
        {
            '!top-[8px] !translate-y-0': !__focused.value && __empty.value,
        },
        {
            '__focused': __focused.value,
            '__empty': __empty.value,
            '__filled': __filled.value,
            '__error': __error.value
        }
    ];
})
const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __class_dropzone_cloud = computed(() => {

    const color = (!dragover.value && !__focused.value) ? 'text-slate-400/80' : 'text-primary'
    return `group-hover:text-primary transition duration-500 ${color}`
})
const __class_dropzone_text = computed(() => {
    return [
        'absolute -bottom-6 w-full text-xs text-slate-500 group-hover:opacity-100 transition duration-500',
        {
            'opacity-0': !dragover.value,
            'opacity-100': dragover.value || __focused.value
        }
    ]
})
const __style_dropzone = computed(() => {

    let _height = (props.rows * 20) + 16;
    if (inputRef.value) {
        const { height } = inputRef.value?.getBoundingClientRect();
        _height = height;
    }
    return {
        height: `${_height}px`
    }
});




/** computed attributes */
const __label = computed(() => {
    return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})

/** input states */
const { __focused } = useFocusState(props, inputRef);
const { __filled, __empty } = useInputState(model)
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);


onMounted(() => {
    console.log(`onMounted InputUpload`, props);
})

function onFocus(event) {
    emit('onFocus', _getEmitParams(event))
};
function onBlur(event) {
    emit('onBlur', _getEmitParams(event))
};

/** Uploader */
function onDropzoneClick() {
    setTimeout(() => {
        inputRef.value.focus();
    }, 150);
}
function onFileStart() {
    dragover.value = false;
}

const dragover = ref(false);
function onDragOver() {
    dragover.value = true;
    inputRef.value.focus();
}
function onDragLeave() {
    dragover.value = false;
    inputRef.value.blur();
}

function onFileSuccess(event) {
    emit('onFileSuccess', event)
}

function onProcessComplete(event) {
    emit('onProcessComplete', event)
    emit('onValueChanged', _getEmitParams(event))
}

defineExpose({
    _id,
    inputRef
});

</script>

<template>
    <div :class="__class_root" :style="__style_root">
        <div :class="__class_input_wrap" ref="inputWrapRef">
            <Uploader v-model="model" :to="'#' + __files_id" :acceptedFileTypes="acceptedFileTypes" @onFileStart="onFileStart" @onFileSuccess="onFileSuccess" @onProcessComplete="onProcessComplete" @onError="$emit('onError')" @onDropzoneClick="onDropzoneClick" @onDragOver="onDragOver" @onDragLeave="onDragLeave" class="absolute inset-0" :style="__style_dropzone">
                <template #dropzone="{ files }">
                    <div class="flex items-center justify-center size-full group ">
                        <div class="relative w-full">
                            <Icon name="cloud-arrow-up" :color="__class_dropzone_cloud" :size="24" />
                            <div v-if="!files.length" :class="__class_dropzone_text">Datei per Drag & Drop hochladen oder hier <span class="hover:underline transition text-primary-700">klicken.</span>
                            </div>
                        </div>
                    </div>
                </template>
                <template #files="{ files, abortProcessing, removeFile }">
                    <ul class="px-2 pb-2">
                        <li v-for="(file, index) in files" :key="file.id" class="rounded-lg text-left pr-2 pl-3 bg-slate-100 mb-1 border-y border-b-slate-400/2 border-t-slate-400/4">
                            <div class="flex items-center gap-2">
                                <div class="flex-1 relative">
                                    <div>{{ file.name }}.{{ file.extension }}</div>
                                    <Progressbar v-if="file.progress < 1" :value="file.progress * 100" class="absolute bottom-0"></Progressbar>
                                </div>
                                <IconBox @click="removeFile(index)">
                                    <Icon name="xmark" center :size="16"></Icon>
                                </IconBox>
                            </div>
                            <!-- <Button v-if="file.progress < 1 && !Object.keys(file.error).length" @click="abortProcessing(file)">Abourt</Button> -->
                        </li>
                    </ul>
                </template>
            </Uploader>
            <textarea :id="_id" :class="__class_input" :rows :name :readonly="true" autocomplete="off" @focus="onFocus" @blur="onBlur" ref="inputRef"></textarea>
            <div :id="__files_id"></div>
            <label v-if="label" :for="_id" :class="__class_label">
                <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
                <span class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
            </label>
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
    padding: 8px 12px;
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


.ip-text-border {
    position: absolute;
    inset: -1px;
    pointer-events: none;
    border-radius: inherit;
    transition: box-shadow .3s cubic-bezier(.4, 0, .2, 1), border-color .3s cubic-bezier(.4, 0, .2, 1);
}
</style>
