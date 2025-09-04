<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, default: false });

const props = defineProps({
  /** The attrId for the input field if exist */
  id: { type: [Number, String], default: null },
  /** The label for the Slider field */
  label: { type: String, default: "" },
  /** The name attribute for the checkbox */
  name: String,
  /** The size of the component. */
  size: {
    type: [String, Number],
    default: "medium",
    validator(value) {
      return (
        (typeof value === "string" && ["tiny", "small", "medium", "large", "xLarge"].includes(value)) ||
        typeof value === "number"
      );
    },
  },
  /** Mininum boundary value */
  min: { type: Number, default: 0 },
  /** Maximum boundary value */
  max: { type: Number, default: 100 },
  /** Step factor to increment/decrement the value. */
  step: { type: Number, default: 1 },
  /** Basis value = 100% */
  basis: { type: Number, default: 100 },
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
});

const _id = computed(() => props.id || useId());
const { previousValue } = usePreviousValue(model);


const emit = defineEmits([
  "onFocus", 
  "onChange", 
  "onBlur", 
  "onValueChanged"
]);

function _getEmitParams(event) {
  return {
    id: _id.value,
    originalEvent: event,
    value: model.value,
    name : props.name,
    displayValue: __displayValue.value,
    previousValue: previousValue.value,
    validationErrors: props.validationErrors,
  };
}


/** Refs to the root element */
const rootRef = useTemplateRef("rootRef");
const handleRef = useTemplateRef("handleRef");
const inputRef = useTemplateRef("inputRef");

const sliderRange = ref(toRaw(model.value));
const sliderHandleSize = computed(() => {
  return typeof props.size === "number" ? props.size : {
    tiny: 16, small: 20, medium: 24, large: 28, xLarge: 32
  }[props.size]
});
const __style_slider_handle = reactive({});
watch(model, (newValue, oldValue) => {
  if(newValue != oldValue){
    Object.assign(__style_slider_handle, {
      left: `calc(${(model.value / (props.basis ?? 100)) * 100}% - ${sliderHandleSize.value / 2}px)`,
      width: `${sliderHandleSize.value}px`,
      height: `${sliderHandleSize.value}px`
    })
    sliderRange.value = toRaw(model.value);
  }
},{
  immediate :true
})



/** classes */
const __class_root = computed(() => {
  return [
    `ip-input-slider flex flex-col items-start relative`,
    {
            'h-[32px]': props.size === 'tiny',
            'h-[40px]': props.size === 'small',
            'h-[48px]': props.size === 'medium',
            'h-[56px]': props.size === 'large',
            'h-[64px]': props.size === 'xLarge',
    },
  ];
});
const __class_input_wrap = computed(() => {
  return [
    "flex items-center flex-1 relative cursor-pointer"
  ];
});
const __class_label = computed(() => {
  return [
    "ip-input-label flex items-center min-w-0 transition text-sm scale-85",
    {
      "text-red-500": __error.value,
      "text-slate-300": props.disabled || props.readonly,
      "text-slate-400": !__error.value && !__focused.value,
      "text-primary": __focused.value && !__error.value,
    }
  ];
});
const __class_input = computed(() => {
  return [
    "ip-input",
    {
      "cursor-pointer": !props.disabled && !props.readonly,
      "pointer-events-none": props.readonly,
    },
  ];
});
const __class_slider = computed(() => {
  return [
    "h-0.25 relative transition w-full",
    {
      "bg-slate-300": !__hovered.value,
      "bg-slate-400/80": __hovered.value && !props.disabled,
    }
  ];
});
const __class_slider_track = computed(() => {
  return ["absolute bg-primary w-1/2 h-0.25 transition"];
});
const __class_slider_handle = computed(() => {
  return [
    "absolute rounded-full drop-shadow-2xl text-[10px] flex items-center justify-center",
    {
      "bg-slate-200 bg-radial from-slate-300/80 to-slate-300 text-slate-500": !__focused.value,
      "bg-primary bg-radial from-primary-500/80 to-primary text-slate-100": __focused.value,
    },
  ];
});
const __class_border = computed(() => [
    "ip-input-border",
    {
      "shadow-input-focus": __focused.value && !__error.value,
      "shadow-input-error": __error.value,
    },
  ]);

const __class_error_icon = computed(() => {
  if (__error.value) {
    return "text-red-500";
  }
  return "";
});

/** computed attributes */
const __displayValue = computed(() => model.value);
const __label = computed(() => {
  return !__error.value ? props.label : `${props.validationErrors[0]?.message}`;
});

/** states */
const { __focused } = useFocusState(props, inputRef);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, rootRef);

onMounted(() => {
  
  console.log("onMounted InputSlider", props);

  Object.assign(draggable, {
    disabled: props.disabled,
    inertia: false,
    restriction: {
      restriction: rootRef.value,
      endOnly: false,
    },
    snap: {
      targets: [],
      relativePoints: [{ x: 0.5, y: 0.5 }],
      offset: "parent",
    },
    lockAxis: "x",
    onDragStart,
    onDragMove,
    onDragEnd,
  });
});

function onFocus(event) {
  emit("onFocus", _getEmitParams(event));
}
function onChange(event) {

  const newValue = Number(event.target.value);
  const steps = [...new Set(draggable.snap.targets.map(item => item.step))];
  const index = steps.indexOf(previousValue.value);

  let nextValue = (newValue > previousValue.value)
    ? steps[Math.min(index + 1, steps.length - 1)]
    : steps[Math.max(index - 1, 0)];

  model.value = sliderRange.value = nextValue;

  nextTick(() => _moveToX(event));
}
function onBlur(event) {
  emit("onBlur", _getEmitParams(event));
}
function onClick(event){
  
  const { offsetX } = event;

  const closestIndex = draggable.snap.targets.reduce((closest, target, i) => 
    Math.abs(target.x - offsetX) < Math.abs(draggable.snap.targets[closest].x - offsetX) ? i : closest
  , 0);

  const basis = props.basis ?? 100;

  model.value = sliderRange.value = Math.max(props.min ?? 0, Math.min(closestIndex * props.step, props.max ?? basis));

  nextTick(() => _moveToX(event));

}

/** draggable */
const draggable = reactive({});

watchEffect(() => {
  if (inputRef.value) {
    const { width } = inputRef.value.getBoundingClientRect();

    const basis = props.basis ?? 100;

    const minX = width * ((props.min ?? 0) / basis);
    const maxX = width * ((props.max ?? basis) / basis);

    draggable.snap.targets = Array.from(
      { length: Math.ceil(basis / props.step) + 1 },
      (_, i) => {
        let x = i * ((width / basis) * props.step);
        return { 
          x: Math.max(minX, Math.min(x, maxX)), 
          step : Math.min( props.max, Math.max(i * props.step, props.min)) 
        };
      }
    );
  }
});

const rootRect = reactive({});
const onDragStart = (event) => {

  const { top, right, bottom, left, width } = rootRef.value.getBoundingClientRect();
  rootRect.top = top;
  rootRect.right = right;
  rootRect.bottom = bottom;
  rootRect.left = left;
  rootRect.width = width;

}

const onDragMove = (event) => {
  sliderRange.value = _calcX(event);
};
const onDragEnd = (event) => {
  model.value = _calcX(event);

  nextTick(() => {
    emit("onChange", _getEmitParams(event));
    emit("onValueChanged", _getEmitParams(event));
    handleRef.value.removeAttribute("data-x");
    handleRef.value.style.transform = "";
  });
};

/* function _calcX(event) {
  
  const { left, width } = rootRect;
  const { rect } = event;

  const maxLeft = left + width - rect.width;
  const rectLeft = Math.max(left, Math.min(rect.left, maxLeft));

  const currPos = rectLeft - left;

  const closestIndex = draggable.snap.targets.reduce((closest, target, i) => 
    Math.abs(target.x - currPos) < Math.abs(draggable.snap.targets[closest].x - currPos) ? i : closest
  , 0);

  const basis = props.basis ?? 100;

  return Math.max(props.min ?? 0, Math.min(closestIndex * props.step, props.max ?? basis));
}
 */
function _calcX(event) {
  
  const { left, width } = rootRect;
  const { rect } = event;

  const maxLeft = left + width - rect.width;
  const rectLeft = Math.max(left, Math.min(rect.left, maxLeft));
  const currPos = rectLeft - left;

  const closestIndex = draggable.snap.targets.reduce((closest, target, i) =>
    Math.abs(target.x - currPos) < Math.abs(draggable.snap.targets[closest].x - currPos) ? i : closest,
    0
  );

  return draggable.snap.targets[closestIndex].step;
}

function _moveToX(event){

  //handleRef.value.removeAttribute("data-x");
 

    Object.assign(__style_slider_handle, {
      left: `calc(${(model.value / (props.basis ?? 100)) * 100}% - ${sliderHandleSize.value / 2}px)`,
    });

    emit("onChange", _getEmitParams(event));
    emit("onValueChanged", _getEmitParams(event));
}

defineExpose({
  draggable,
});
</script>

<template>
  <div :class="__class_root" ref="rootRef">
    <label v-if="label" :for="_id" :class="__class_label">
      <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" />
      <slot name="label" :label="__label" :error="__error"><span class="text-ellipsis overflow-hidden text-left text-sm"  v-html="label"></span></slot>
    </label>
    <div :class="__class_input_wrap" :style="{ margin : `0 ${sliderHandleSize/2}px`, width : `calc(100% - ${sliderHandleSize}px)`}" @click="onClick">
      <div :class="__class_slider">
        <div :class="__class_slider_track" :style="{ width: `${(sliderRange / (basis ?? 100)) * 100}%` }" ></div>
      </div>
      <input :id="_id" :class="__class_input" type="range" :name v-model="model" :disabled :min :max @focus="onFocus" @change="onChange" @blur="onBlur" ref="inputRef"/>
      <label :for="_id" :class="__class_slider_handle" :style="__style_slider_handle" ref="handleRef" v-draggable @mousedown.prevent="__focused = !disabled" >{{ (sliderRange != model) ? sliderRange : model  }}<div :class="__class_border"></div></label>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.ip-input {
  appearance: none;
  background: transparent;
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  z-index: 1;
  outline: 0 none;
  border: 0;
}

.ip-input-border {
  position: absolute;
  inset: -1px;
  pointer-events: none;
  border-radius: inherit;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
  border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
