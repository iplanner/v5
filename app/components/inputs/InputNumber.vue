<script setup>

/** The value when being manually set. **/
const model = defineModel({ required: true, type: [Number, String], default: null });

const props = defineProps({
  /** The attrId for the input field if exist */
  id: { type: [Number, String], default: null },
  /** The label for the input field */
  label: String,
  /** The css class for the input label e.g. for background */
  labelClass: { type: String, default: "bg-white dark:bg-primary-1100" },
  /** The name attribute for the input field*/
  name: String,
  /** The placeholder attribute for the input field */
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
  /** Text to display before the value. */
  suffix: { type: String, default: "" },
  /** Text to display after the value. */
  prefix: { type: String, default: "" },
  /** The sign for the thousands seperator */
  thousands: { type: String, default: "." },
  /** The sign for the decimal seperator */
  decimal: { type: String, default: "," },
  /** The minimum number of fraction digits to use. Possible values are from 0 to 20;  */
  precision: { type: Number, default: 2 },
  /** The minimum boundary value. */
  min: Number,
  /** The maximum boundary value. */
  max: Number,
  /** How numbers should be rounded. */
  rounding: Boolean,
  /** Determines whether the input field is empty. */
  allowEmpty: { type: Boolean, default: true },
  /**  Whether the value can be increase or reduced by the arrows 10, 1, 0.1  0.001 etc.. */
  stepper: { type: Number, default: 0 },
  /** Whether the input is readonly */
  readonly: Boolean,
  /** Whether the component is disabled */
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
  'onKeyPress',
  'onBlur',
  'onPaste',
  'onValueChanged',
]);

function _getEmitParams(event) {
  return {
    id: _id.value,
    originalEvent: event,
    value: model.value,
    name : props.name,
    displayValue: __displayValue.value,
    previousValue,
    validationErrors: props.validationErrors
  }
}

/** Template Refs */
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');

let previousValue = model.value;
watch(() => model.value, (newValue, oldValue) => {
  previousValue = (oldValue === undefined) ? _addPrecision(newValue) : oldValue;
},
  { immediate: true }
);



/** computed classes */
const __class_root = computed(() => {

  return [
    `ip-input-number w-full inline-block relative`,
    {
      'h-[22px]': props.size === 'tiny',
      'h-[28px]': props.size === 'small',
      'h-[34px]': props.size === 'medium',
      'h-[40px]': props.size === 'large',
      'h-[46px]': props.size === 'xLarge',
    },
    {
      'rounded-lg': typeof props.rounded === 'boolean' && props.rounded,
    }
  ];

});
const __class_input_wrap = computed(() => {

  return [
    `flex items-center transition relative z-10 rounded-inherit h-full`,
    {
      'cursor-pointer': !props.disabled,
      'bg-slate-50': props.disabled
    },
    {
      'gap-1': !slots.prefix && !slots.suffix,
      'ml-1': slots.prefix,
      'mr-1': slots.suffix
    }
  ];
})
const __class_border = computed(() => {
  return [
    'ip-text-border border-[0.5px]',
    {
      'border-primary shadow-input-focus': __focused.value && !__error.value,
      'border-slate-400': !__focused.value && !__error.value && !__hovered.value,
      'border-red-500 shadow-input-error': __error.value,
      'border-slate-500': __hovered.value && (!__focused.value && !__error.value)
    }
  ];
})
const __class_label = computed(() => {

  return [
    'ip-input-label flex items-center overflow-hidden transition duration-300',
    {
      'text-slate-400': !__focused.value && !__error.value && !__hovered.value,
      'text-slate-500': __hovered.value && (!__focused.value && !__error.value),
      'text-primary': __focused.value && !__error.value,
      'text-red-500': __error.value,
      'text-sm': props.size === 'tiny' && __empty.value,
    },
    {
      'bg-slate-50': props.disabled
    },
    {
      '__focused': __focused.value,
      '__empty': __empty.value,
      '__filled': __filled.value,
      '__error': __error.value,
      '__disabled': props.disabled
    },
    (props.labelClass && !props.disabled) ? `${props.labelClass}` : ''
  ];
})
const __class_input = computed(() => {
  return [
    'ip-input selection:bg-primary/25 text-right text-sm',
    {
      '!pl-0': slots.prefix,
      '!pr-0': slots.suffix,
      '!pr-1': props.stepper > 0,
      'bg-slate-50': props.disabled,
      'placeholder-transparent': __displayValue.value.length < props.placeholder.length && !__focused.value,
      'placeholder:text-slate-400': !__empty.value || __focused.value || !props.label,
      'text-red-500' : __error.value,
    }
  ]
})



const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __class_stepper_icon = computed(() => {
  return `text-slate-500/70 !leading-[0.5] hover:text-primary transition duration-300`;
})

/** computed attributes */
const __displayValue = computed(() => {
  return _formatValue(model.value)
})
const __label = computed(() => {
  return (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`
})

/** computed input states */
const { __focused } = useFocusState(props, inputRef);
const __filled = computed(() => {
  if (typeof model.value === 'number') {
    return !isNaN(model.value) && model.value !== null;
  }
  if (typeof model.value === 'string') {
    return model.value.trim().length > 0;
  }
  return false;
});
const __empty = computed(() => !__filled.value);
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);

onMounted(() => {
  console.log('onMounted InputNumber', props);
  if (props.max !== undefined && model.value > props.max) {
    model.value = props.max;
  }

  if (props.min !== undefined && model.value < props.min) {
    model.value = props.min;
  }
})

/** Suffix & Prefix */
function _getSuffixLength() {
  return props.suffix.length ? props.suffix.length + 1 : 0;
}
function _getPrefixLength() {
  return props.prefix.length ? props.prefix.length + 1 : 0;
}
function _getCursorPrefixCheck(cursorStart) {
  const prefixLength = _getPrefixLength();
  return Math.max(cursorStart, prefixLength);
}
function _getCursorSuffixCheck(cursorStart, input) {

  const suffixLength = _getSuffixLength();
  const maxCursor = input.length - suffixLength;
  console.log('_getCursorSuffixCheck => ', Math.max(0, Math.min(cursorStart, maxCursor)));
  return Math.max(0, Math.min(cursorStart, maxCursor));
}


function _getCursorThousandsCheck(cursorStart, originalValue, formattedValue, keyCode = "") {

  let currCursorPos = cursorStart;

  if (props.thousands) {

    if (keyCode === 'Backspace') {
      currCursorPos--;
    }

    const thousandSeparator = props.thousands;

    // Zähle die Vorkommen des Tausendertrennzeichens in originalValue und formattedValue
    const originalThousandsCount = originalValue.split(thousandSeparator).length - 1;
    const formattedThousandsCount = formattedValue.split(thousandSeparator).length - 1;

    // Berechne die Differenz und passe die Cursorposition an
    currCursorPos -= (originalThousandsCount - formattedThousandsCount);

    // Stelle sicher, dass der Cursor nicht negativ wird
    currCursorPos = Math.max(currCursorPos, 0);

    // Überprüfe, ob der Cursor auf einem Tausendertrennzeichen steht und setze ihn dahinter
    if (formattedValue[currCursorPos] === thousandSeparator) {
      (keyCode === 'Backspace') ? currCursorPos-- : currCursorPos++;
    }
    console.log('_getCursorThousandsCheck =>', currCursorPos);
  }

  return currCursorPos;



}
function _getCursorDecimalCheck(cursorStart, formattedValue, keyCode) {

  let currCursorPos = cursorStart;

  // Überprüfe, ob es eine Dezimalstelle gibt und der aktuelle Cursor darauf steht
  if (props.decimal && formattedValue[currCursorPos] === props.decimal) {
    if (keyCode === 'Backspace') {
      currCursorPos--;
    } else {
      currCursorPos++;
    }
  }

  console.log('_getCursorDecimalCheck', currCursorPos);
  return currCursorPos;
}
function _getCursorMinusSignCheck(cursorStart, originalValue, formattedValue, keyCode) {

  let currCursorPos = cursorStart;

  if (keyCode === 'ArrowUp' || keyCode === 'ArrowDown' && props.stepper > 0) {
    if (originalValue.includes('-') && !formattedValue.includes('-')) {
      currCursorPos--
    }
    if (!originalValue.includes('-') && formattedValue.includes('-')) {
      currCursorPos++
    }
  }
  console.log('_getCursorMinusSignCheck', currCursorPos);
  return currCursorPos;
}

function _calcCursorPos(cursorStart, originalValue = "", formattedValue, keyCode = "") {

  let currCursorPos = cursorStart;

  console.log('_calcCursorPos => ', cursorStart, originalValue, formattedValue, keyCode);

  currCursorPos = _getCursorThousandsCheck(currCursorPos, originalValue, formattedValue, keyCode);

  //currCursorPos = _getCursorDecimalCheck( currCursorPos, formattedValue, keyCode);

  /*   // Behandlung für ein Minuszeichen am Anfang
    if (originalValue && originalValue.startsWith('-')) {
      // Wenn der Cursor vor dem Minuszeichen steht, setze ihn nach dem Minuszeichen
      if (currCursorPos <= 0) {
        currCursorPos = 1;
        console.log('currCursorPos (minus check)', currCursorPos);
      }
      // Wenn der Wert nur aus einem Minuszeichen und einer einzigen Ziffer besteht
      else if (originalValue.length === 2 && /\d/.test(originalValue[1])) {
        currCursorPos = 2;
        console.log('currCursorPos (single digit with minus check) ', currCursorPos);
      }
    } */

  currCursorPos = _getCursorMinusSignCheck(currCursorPos, originalValue, formattedValue, keyCode);

  currCursorPos = _getCursorPrefixCheck(currCursorPos);
  currCursorPos = _getCursorSuffixCheck(currCursorPos, formattedValue)

  return currCursorPos;
}
function _setCursor(el, position) {

  const setSelectionRange = () => {

    if (position < 0) {
      position = 0;
    }

    el.setSelectionRange(position, position);
  };

  if (el === document.activeElement) {
    setSelectionRange();
    setTimeout(setSelectionRange, 1);
    nextTick(() => {
      setSelectionRange();
    });
  }
}


function _parseValue(input) {

  // Prüfe, ob der Input eine Zahl ist und konvertiere sie zu einem String
  if (typeof input === 'number') {
    input = input.toString();
  }

  // Überprüfe auf ein Minuszeichen und behalte es nur, wenn es am Anfang steht
  const minusIndex = input.indexOf('-');
  if (minusIndex > 0) {
    input = input.slice(minusIndex); // Entferne alle Zeichen vor dem Minuszeichen
  }

  // Entferne das Präfix, Suffix und ersetze Dezimal- und Tausendertrennzeichen
  const filteredVal = input
    .replace(props.suffix, '')
    .replace(props.prefix, '')
    .trim()
    .replace(/\s/g, '')
    .replace(new RegExp(`\\${props.thousands}`, 'g'), '')
    .replace(new RegExp(`\\${props.decimal}`), '.')

  // Falls der gefilterte Wert leer ist, gib null zurück  
  if (!filteredVal) return null;

  // Falls der gefilterte Wert nur ein Minuszeichen ist, gib ihn zurück
  if (filteredVal === '-') return filteredVal;

  // Konvertiere den gefilterten Wert in eine Zahl und gib null zurück, wenn es keine gültige Zahl ist
  return isNaN(Number(filteredVal)) ? null : Number(filteredVal);
}
function _formatValue(input) {

  // Handle null or undefined input
  if (input === null || input === undefined) {
    input = 0;
    if (props.allowEmpty) {
      input = "";
    }
  }

  // Directly return if input is just a minus sign
  if (input === '-') {
    return input; // Minuszeichen wird direkt zurückgegeben
  }

  // Apply min and max constraints
  if (props.max !== undefined && input > props.max) {
    input = props.max;
  }

  if (props.allowEmpty && input === "") {
    return "";
  }

  if (props.min !== undefined && input < props.min) {
    input = props.min;
  }

  // Format the input value if it's not empty
  let formattedValue = input !== "" ? new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision,
    roundingMode: props.rounding ? 'ceil' : 'halfEven'
  }).format(input) : "";

  if (formattedValue.length) {

    // Add prefix and suffix if they exist
    if (props.prefix) {
      formattedValue = `${props.prefix} ${formattedValue}`;
    }
    if (props.suffix) {
      formattedValue = `${formattedValue} ${props.suffix}`;
    }

  }

  return formattedValue;

}
function _addPrecision(number) {

  if (number == null || isNaN(number)) {
    return props.allowEmpty ? "" : 0;
  }

  let [integerPart, decimalPart = ''] = number.toString().split('.');

  while (decimalPart.length < props.precision) {
    decimalPart += '0';
  }
  return Number(`${integerPart}.${decimalPart}`);
}


/**
 * EVENT HANDLER
 */
function onClick(event) {

  console.log('START ON_CLICK', event);

  const el = event.currentTarget;

  const { start, end, isRangeSelected } = getCursor(el);
  console.log('onClick cursor', { start, end, isRangeSelected });
  const prefixLength = _getPrefixLength();
  const suffixLength = _getSuffixLength();


  if (isRangeSelected) {
    if (props.prefix === el.value.slice(start, end).trim()) {
      _setCursor(el, prefixLength);
    }
    else if (props.suffix === el.value.slice(start, end).trim()) {
      _setCursor(el, el.value.length - suffixLength);
    }
  } else {

    if (start < prefixLength) {
      _setCursor(el, prefixLength);
    } else if (start > el.value.length - suffixLength) {
      _setCursor(el, el.value.length - suffixLength);
    }
  }
  emit('onClick', event)

  console.log('END ON_CLICK');

}
function onFocus(event) {
  emit('onFocus', _getEmitParams(event))
}
function onKeyDown(event) {

  console.clear()

  if (props.readonly || props.disabled) {

    return _cancelEvent(event);
  }

  const { target: el, code: keyCode } = event;
  const { start, end, isRangeSelected } = getCursor(el);

  console.log('keyCode', keyCode);

  // Erlaubte Tasten und Zeichen
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', '-', ...'0123456789'];
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const isPaste = (event.key === 'v' || event.key === 'V') && isCtrlOrCmd;
  const prefixLength = _getPrefixLength();
  const suffixLength = _getSuffixLength();

  if (isPaste) {
    //event is passed to onPaste()
    return false;
  }

  // Überprüfe, ob die gedrückte Taste erlaubt ist
  if (!allowedKeys.includes(event.key) && !allowedKeys.includes(keyCode) && !isCtrlOrCmd) {
    return _cancelEvent(event);
  }

  // Stelle sicher, dass das Minuszeichen nur einmal eingegeben werden kann
  if (event.key === '-') {
    // Überprüfe, ob das Minuszeichen bereits vorhanden ist oder nicht am Anfang eingegeben wird
    if (el.value.includes('-') || start > prefixLength) {
      return _cancelEvent(event);
    }
  }

  // Verhindere Eingaben vor dem Minuszeichen
  if (el.value[0] === '-' && start === 0 && keyCode !== 'ArrowRight' && keyCode !== 'Delete' && keyCode !== 'ArrowDown' && keyCode !== 'ArrowUp') {
    return _cancelEvent(event);
  }

  console.log('START KEYDOWN => keyCode', keyCode)

  let _value = el.value;
  let currCursorPos = start;

  console.log('cursor => ', { start, end, isRangeSelected });

  if (keyCode === 'ArrowLeft') {

    // if range or value is complete selected
    if (isRangeSelected && end - start === el.value.length) {
      console.log('force cursor after Prefix');
      _setCursor(el, prefixLength);
      return _cancelEvent(event);
    }

    // if cursor is bevor prefix
    if (start < prefixLength + 1) {
      console.log('force cursor after Prefix');
      _setCursor(el, prefixLength);
      return _cancelEvent(event);
    }

    return;

  }
  else if (keyCode === 'ArrowRight') {

    // if range or value is complete selected
    if (isRangeSelected && end - start === el.value.length) {
      console.log('force cursor before Prefix');
      _setCursor(el, end - suffixLength);
      return _cancelEvent(event);
    }

    // if cursor will jump after suffix
    if (start > el.value.length - suffixLength - 1) {
      console.log('force cursor before Prefix');
      _setCursor(el, el.value.length - suffixLength);
      return _cancelEvent(event);
    }

    return;
  }
  else if (keyCode === 'Backspace') {
    // Überprüfe, ob der Cursor nicht am Anfang steht und ob das Zeichen links vom Cursor eine Ziffer ist
    if (start > 0 && /\d/.test(el.value[start - 1])) {
      // Entferne die Ziffer links vom Cursor
      _value = el.value.slice(0, start - 1) + el.value.slice(start);
    }
    // Überprüfe, ob der Cursor nicht am Anfang steht und ob das Zeichen links vom Cursor ein Minuszeichen ist
    else if (start > 0 && el.value[start - 1] === '-') {
      // Entferne das Minuszeichen links vom Cursor
      _value = el.value.slice(0, start - 1) + el.value.slice(start);
    }
  }
  else if (keyCode === 'Delete') {

    if (isRangeSelected) {

      const substring = el.value.slice(start, end);
      let _decimalSign = ""
      if (substring.includes(props.decimal)) {
        _decimalSign = props.decimal;
      }
      _value = el.value.slice(0, start) + _decimalSign + el.value.slice(end);

    } else {

      if (el.value[start] === '0' || el.value[start] === props.decimal) {

        console.log('Delete A');

        if (el.value[start + 1] === props.decimal) {

          console.log('Delete AA');

          const integerPart = _parseValue(el.value.split(props.decimal)[0]).toString();
          if (integerPart.length > 1) {
            console.log('Mehrere Ziffern vor dem Komma, Löschung erlaubt.');
            _value = el.value.slice(0, start) + el.value.slice(end);
            return;
          }

        }


        // Springe zum nächsten Zeichen nach der '0', das keine Ziffer ist
        let nextPos = start + 1;
        while (nextPos < el.value.length && !/\d/.test(el.value[nextPos])) {
          nextPos++;
        }
        // Setze den Cursor an die neue Position
        if (nextPos > el.value.length - suffixLength - 1) {
          _setCursor(el, el.value.length - suffixLength);
          return _cancelEvent(event);
        } else {
          _setCursor(el, nextPos);
          return _cancelEvent(event);
        }
      }
      else if (el.value[start] === '-') {
        console.log('Delete B');
        // Entferne das Minuszeichen an der aktuellen Cursorposition
        _value = el.value.slice(0, start) + el.value.slice(start + 1);
      }
      else if (/\d/.test(el.value[start])) {
        console.log('Delete D', el.value[start]);
        // Entferne die Ziffer an der aktuellen Cursorposition
        _value = el.value.slice(0, start) + el.value.slice(start + 1);
      }

    }
  }

  const controlKeys = ['Backspace', 'Delete', 'ArrowUp', 'ArrowDown'];

  if (controlKeys.includes(keyCode)) {
    let parsedValue = _parseValue(_value);

    if (parsedValue === null && props.allowEmpty) return;

    if (keyCode.startsWith('Arrow') && props.stepper > 0) {
      const direction = keyCode.replace('Arrow', '').toLowerCase();
      parsedValue = _calcStep(parsedValue, direction);
    }

    const formattedValue = _formatValue(parsedValue);
    const cursorPos = _calcCursorPos(currCursorPos, el.value, formattedValue, keyCode);

    el.value = formattedValue;
    model.value = _addPrecision(parsedValue);
    _setCursor(el, cursorPos);

    event.preventDefault();
  }

  console.log('END KEYDOWN');
}
function onKeyPress(event) {
  //console.log('onKeyPress',event);
  emit('onKeyPress', _getEmitParams(event))
};
function onInput(event) {

  if (props.readonly || props.disabled) return;

  const el = event.target;
  const keyCode = event.code;

  console.log('ONINPUT');

  const { start, end, isRangeSelected } = getCursor(el);
  const parsedValue = _parseValue(el.value);
  const formatted = _formatValue(parsedValue);

  const cursorPos = _calcCursorPos(Math.max(_getPrefixLength() + 1, start), el.value, formatted, keyCode);

  el.value = formatted;
  const value = _addPrecision(parsedValue);
  model.value = value;

  const _emitparams = _getEmitParams(event);
  const params = { ..._emitparams, value, displayValue: el.value };

  emit('onInput', params);
  emit('onValueChanged', params)


  _setCursor(el, cursorPos);

  console.log('END ONINPUT');
}
function onBlur(event) {
  emit('onBlur', _getEmitParams(event))
};
function onPaste(event) {
  console.log('onPaste', event)

  event.preventDefault();


  const pastedData = (event.clipboardData || window?.clipboardData).getData('text');

  console.log('pastedData', pastedData);

  model.value = _parseValue(pastedData);

  //inputRef.value = _formatValue(_parseValue(pastedData));
  emit('onPaste', _getEmitParams(event))
};

function onStep(direction) {
  model.value = _calcStep(model.value, direction);
}
function _calcStep(value, direction) {

  const getPrecision = (num) => (num.toString().split('.')[1] || '').length;

  const precision = Math.max(getPrecision(value), getPrecision(props.stepper));
  const sign = direction === 'up' ? 1 : -1;

  const scale = Math.pow(10, precision);
  const result = (value * scale + sign * props.stepper * scale) / scale;

  return result.toFixed(precision);
}

function _cancelEvent(event) {
  event.preventDefault();
  console.log('!!!!! canceled');
  return;
}

</script>

<template>
  <div :class="__class_root">
    <div :class="__class_input_wrap" ref="inputWrapRef">
      <div class="ip-input-slot" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </div>
      <input :id="_id" :class="__class_input" type="text" :name :value="__displayValue" :placeholder :readonly :disabled
        @click="onClick" @focus="onFocus" @input="onInput" @keydown="onKeyDown" @keypress="onKeyPress" @blur="onBlur"
        @paste="onPaste" autocomplete="off" ref="inputRef" />
      <label :for="_id" :class="__class_label">
        <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" /><span
          class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
      </label>
      <div v-if="props.stepper > 0" class="ip-input-stepper flex flex-col mr-3">
        <Icon name="caret-up" :color="__class_stepper_icon" :size="11" @click="onStep('up')" />
        <Icon name="caret-down" color="__class_stepper_icon" :size="11" @click="onStep('down')" />
      </div>
      <div class="ip-input-slot" v-if="$slots.suffix">
        <slot name="suffix"></slot>
      </div>
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
  border-radius: inherit;
  height: inherit;
  background: transparent;

  &::selection {
    background: rgba(var(--color-primary), 0.35);
  }
}

.ip-input-slot {
  flex-shrink: 0;
  height: inherit;
  width: 34px;
  position: relative;
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
