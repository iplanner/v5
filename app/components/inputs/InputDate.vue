<script setup>
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/de';
dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.locale('de');

/** The value when being manually set. - format is ISO 8601  - YYYY-MM-DD || null**/
const model = defineModel({
  required: true,
  type: [String, null],
  default: null,
  validator(value) {

    if (value === null) return true;

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value)) {
      console.error('Ungültiges Datumsformat! Erwartet wird YYYY-MM-DD.');
      return false;
    }

    if (!dayjs(value, 'YYYY-MM-DD', true).isValid()) {
      console.error('Ungültiges Datum! Bitte geben Sie ein gültiges Datum im Format YYYY-MM-DD ein.');
      return false;
    }

    // Alles ist korrekt
    return true;
  }
});
watch(() => model.value, (newValue, oldValue) => {
  if (newValue != oldValue) {
    emit('onValueChanged', _getEmitParams(null));
  }
});
/** Whether the picker are shown or hidden */
const opened = defineModel('opened', Boolean);

const props = defineProps({
  /** The attrId for the input field if exist */
  id: { type: [Number, String], default: null },
  /** The label for the input field */
  label: String,
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
  /** The format string to format the model value into the displayValue */
  dateFormat: {
    type: String,
    default: 'DD.MM.YYYY',
    validator(value) {
      // Definiere die gültigen Platzhalter, die im Format enthalten sein dürfen
      const validFormats = [
        'YY', 'YYYY', 'M', 'MM', 'MMM', 'MMMM', 'D', 'DD',
        'H', 'HH', 'h', 'hh', 'm', 'mm', 's', 'ss', 'S', 'SS', 'SSS',
        'Z', 'ZZ', 'A', 'a', 'Do', 'X', 'x'
      ];

      // Erlaube Platzhalter und Zeichen wie ".", "-", "/", Leerzeichen als Trennzeichen
      const formatRegex = new RegExp(`(${validFormats.join('|')}|[-./\\s])`, 'g');

      return value.match(formatRegex)?.join('') === value;
    }
  },
  /** Only date after the minDate can be selected or typed*/
  minDate: {
    type: String,
    default: null,
    validator(value) {
      return typeof value === 'string' &&
        (
          value === 'today' ||
          (/^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value, 'YYYY-MM-DD', true).isValid())
        )
    }
  },
  /** Only date before the maxDate can be selected or typed */
  maxDate: {
    type: String,
    default: null,
    validator(value) {
      return typeof value === 'string' &&
        (
          value === 'today' ||
          (/^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value, 'YYYY-MM-DD', true).isValid())
        )
    }
  },
  /** Text to display before the value. */
  suffix: { type: String, default: "" },
  /** Text to display after the value. */
  prefix: { type: String, default: "" },
  /**  Whether the picker is shown onFocus */
  openOnFocus: { type: Boolean, default: true },
  /** The startview of the picker */
  startView: {
    type: String,
    default: "month",
    validator(value) {
      return (typeof value === 'string' && ['day', 'month', 'year'].includes(value) || typeof value === 'number')
    }
  },
  /** The visible Weekdays in the Picker  */
  weekdays: { type: Array, default: () => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] },
  /** Determines whether the input field is empty. */
  showWeeks: Boolean,
  /** Determines whether the input field is empty. */
  allowEmpty: { type: Boolean, default: true },
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
const { previousValue } = usePreviousValue(model);

const emit = defineEmits([
  'onClick',
  'onFocus',
  'onInput',
  'onBlur',
  'onValueChanged',
  'onSelect'
]);

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

/** Template Refs */
const rootRef = useTemplateRef('rootRef');
const inputWrapRef = useTemplateRef('inputWrapRef');
const inputRef = useTemplateRef('inputRef');
const pickerRef = useTemplateRef('pickerRef');

const { height :__windowHeight, width : __windowWidth } = useResizeEvent();
const { scrollEvent } = useScrollEvent();
watch(() => scrollEvent, () => {
  if (opened.value) {
    opened.value = false;
  }
});


/** computed classes */
const __class_root = computed(() => {

  return [
    `ip-input-date w-full inline-block relative`,
    {
      'h-[22px]': props.size === 'tiny',
      'h-[28px]': props.size === 'small',
      'h-[34px]': props.size === 'medium',
      'h-[40px]': props.size === 'large',
      'h-[46px]': props.size === 'xLarge',
    },
    {
      'rounded-xl': typeof props.rounded === 'boolean' && props.rounded,
    }
  ];

});
const __class_input_wrap = computed(() => {

  return [
    `flex items-center transition relative z-10 h-full dark:bg-linear-to-b dark:from-primary-1100 dark:to-primary-1000/25`,
    {
      'cursor-pointer': !props.disabled,
      'bg-slate-50': props.disabled
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
      'text-slate-400': !__focused.value && !__error.value && !__hovered.value,
      'text-slate-500': __hovered.value && (!__focused.value && !__error.value),
      'text-primary': __focused.value && !__error.value,
      'text-red-500': __error.value,
      'text-sm': props.size === 'tiny' && __empty.value,
    },
    {
      'bg-white dark:bg-primary-1100': !props.disabled,
      'bg-slate-50': props.disabled
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
    'ip-input selection:bg-primary/25 dark:text-slate-200',
    {
      'text-sm': props.size === 'tiny',
      '!pl-0': slots.prefix,
      '!pr-0': slots.suffix,
      'bg-slate-50': props.disabled,
      'placeholder-transparent': __empty.value || !__focused.value,
      'placeholder:text-slate-400': !__empty.value || __focused.value || !props.label,
      'dark:text-slate-200': __filled.value
    }
  ]
})
const __class_error_icon = computed(() => __error.value ? 'text-red-500' : '');

const __class_picker = computed(() => {
  return [
    `absolute bg-white rounded-lg overflow-auto drop-shadow-2xl p-4 border-[0.5px] dark:border-0 border-slate-200 dark:border-slate-100/20`
  ]
});
const __class_header = computed(() => {
  return [
    `flex items-center pb-2`,
  ]
})
const __class_weekdays = computed(() => {
  return [
    `grid gap-1 text-center mb-2 text-slate-600`,
    {
      'grid-cols-7': !props.showWeeks,
      'grid-cols-8': props.showWeeks
    }
  ]
})
const __class_month_day = (day) => {

  const __today = day.isSame(dayjs(), 'day');
  const __selected = selectedDate.value && day.isSame(selectedDate.value, 'day');
  const __currentMonth = day.isSame(currentMonth.value, 'month');
  const __disabled = isDateDisabled(day);

  return [
    `flex items-center justify-center cursor-pointer rounded-full w-8 h-8`,
    {
      'bg-primary text-white': __selected,
      'bg-slate-100 text-primary cursor-pointer ': __today && !__selected,
      'transition ease-in-out hover:bg-primary/5': !__selected && !__today && !__disabled,
      'text-slate-400 cursor-pointer': !__currentMonth && !__disabled,
      'text-slate-300': __disabled,
      'line-through': __disabled && !__selected
    }
  ]
}
const __class_cell = computed(() => {
  return [
    `flex items-center justify-center rounded-full w-8`,
  ]
})


/** computed styles */
const __style_picker = () => {
  const { x, top, height, width } = rootRef.value.getBoundingClientRect();

  const _height = height + 3;
  let _bottom = top + _height;
  const _width = props.showWeeks ? 356 : 320;

  const spaceBelow = __windowHeight.value - _bottom;
  const spaceAbove = top;

  const spaceLeft = x - 8;
  const spaceRight = __windowWidth.value - (x + width) - 8;

  let _left = x - 1;
  if (spaceRight > spaceLeft) {
    _left = x - 1;
  } else {
    _left = x + width - _width;
  }

  return {
    top: `${_bottom}px`,
    left: `${_left}px`,
    width: `${_width}px`,
    zIndex: 100,
    transform: (spaceAbove > spaceBelow) ? `translate(0, calc(-100% - ${_height + 16}px))` : `translate(0, ${2}px)`
  };
};

/** computed attributes */
const __displayValue = ref(_formatValue(model.value));
const __label = computed(() => (!__error.value) ? props.label : `${props.validationErrors[0]?.message}`)


/** computed input states */
const { __focused: focused } = useFocusState(props, inputRef);
const __focused = computed(() => {
  return (focused.value || opened.value);
});
const { __filled, __empty } = useInputState(model)
const { __error } = useErrorState(props);
const { __hovered } = useHoverState(props, inputWrapRef);

onMounted(() => {
  console.log('onMounted InputDate', props);
})

/** Suffix & Prefix */
function _getSuffixLength() {
  return props.suffix && props.suffix.length ? props.suffix.length + 1 : 0;
}
function _getPrefixLength() {
  return props.prefix && props.prefix.length ? props.prefix.length + 1 : 0;
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

/** parse & format */
function _parseValue(input) {

  const _filtered = input
    .replace(props.suffix, '')
    .replace(props.prefix, '')
    .trim()
    .replace(/\s/g, '')

  const _iso = 'YYYY-MM-DD';

  if (_filtered.length === "" && props.allowEmpty) {
    return null;
  }
  const parsedDate = dayjs(_filtered, props.dateFormat);

  if (!parsedDate.isValid()) {
    return (props.allowEmpty) ? null : model.value;
  }

  if (props.minDate) {
    if (parsedDate.isBefore(minDate.value, 'day')) {
      console.error("Date is before the minDate => returning ", minDate.value.format(_iso));
      return minDate.value.format(_iso);
    }
  }

  if (props.maxDate) {
    if (parsedDate.isAfter(maxDate.value, 'day')) {
      console.log("Date is after the maxDate => returning ", maxDate.value.format(_iso));
      return maxDate.value.format(_iso);
    }
  }



  return parsedDate.format(_iso);
}
function _formatValue(input) {
  // Handle null, undefined, or empty input
  if (input === null || input === undefined || input === "") {
    if (props.allowEmpty) {
      return null;
    }
    return "Invalid Date";
  }

  // Verwende Day.js, um das Datum zu parsen
  const date = dayjs(input);

  // Überprüfe, ob das geparste Datum gültig ist
  if (!date.isValid()) {
    return "Invalid Date"; // Fehlerhafter Datumseingang
  }

  // Formatierung des Datums mit dayjs und props.dateFormat
  try {
    let formattedDate = date.format(props.dateFormat);

    if (formattedDate.length) {

      // Add prefix and suffix if they exist
      if (props.prefix) {
        formattedDate = `${props.prefix} ${formattedDate}`;
      }
      if (props.suffix) {
        formattedDate = `${formattedDate} ${props.suffix}`;
      }

    }

    return formattedDate;
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return "Invalid Format";
  }
}

/** events */
onClickOutside(inputWrapRef, event => {
  if (opened.value && pickerRef.value && !pickerRef.value.contains(event.target) && !rootRef.value.contains(event.target)) {
    opened.value = false;
  }

})
onKeyStroke(['Tab', 'ArrowUp', 'ArrowDown'], (e) => {
  if (opened.value) {
    opened.value = false;
  }
})
function onClick(event) {

  if (props.readonly || props.disabled) return _cancelEvent(event);;

  if (props.openOnFocus) {
    onToggle();
  }

  const el = event.currentTarget;

  const { start, end, isRangeSelected } = getCursor(el);
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

}
function onFocus(event) {
  emit('onFocus', _getEmitParams(event))
}
function onKeyDown(event) {

  console.clear();

  if (props.readonly || props.disabled) return _cancelEvent(event);

  const { target: el, key: keyPressed, code: keyCode } = event;
  const { start, end, isRangeSelected } = getCursor(el);

  const prefixLength = _getPrefixLength();
  const suffixLength = _getSuffixLength();
  const totalLength = el.value.length;

  const separators = [...new Set(props.dateFormat.match(/[-./\s]/g) || [])];
  const countSeparators = (value, separator) => {
    return value.split(separator).length - 1;
  };


  // 1. Behandle Backspace und Delete:
  if (keyPressed === 'Backspace' || keyPressed === 'Delete') {

    if (isRangeSelected && end - start === totalLength) {
      if (!props.allowEmpty) {
        return _cancelEvent(event); // Verhindert das Löschen im Suffix-Bereich
      }
    } else {

      if (prefixLength > 0 && start <= prefixLength) {
        console.log('Verhindere Backspace im Prefix-Bereich');
        return _cancelEvent(event); // Verhindert das Löschen im Prefix-Bereich
      }
      // Verhindere das Löschen im Suffix-Bereich mit Backspace (beim Löschen von links)
      if (suffixLength > 0 && start >= totalLength - suffixLength) {
        console.log('Verhindere Backspace im Suffix-Bereich');
        return _cancelEvent(event); // Verhindert das Löschen im Suffix-Bereich
      }
    }
  }
  // 2. Behandle Pfeiltasten (Navigation):
  else if (keyPressed === 'ArrowLeft') {
    // Verhindere, dass der Cursor vor das Prefix bewegt wird
    if (prefixLength > 0 && start <= prefixLength) {
      return _cancelEvent(event); // Cursor kann nicht in den Prefix-Bereich verschoben werden
    }
  }
  else if (keyPressed === 'ArrowRight') {
    // Verhindere, dass der Cursor hinter das Suffix bewegt wird
    if (suffixLength > 0 && start >= totalLength - suffixLength) {
      return _cancelEvent(event); // Cursor kann nicht in den Suffix-Bereich verschoben werden
    }
  }

  // 3. Behandle andere erlaubte Tasten (Zahlen und Trennzeichen):
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', ...separators, ...'0123456789'];
  if (!allowedKeys.includes(keyPressed) && !allowedKeys.includes(keyCode)) {
    // Verhindere das Eingeben von nicht erlaubten Tasten
    console.log('UNERLOWED key', keyCode);
    return _cancelEvent(event);
  }

  // 4. Verhindere das mehrfache Einfügen von Trennzeichen
  if (separators.includes(keyPressed)) {
    // Überprüfe, ob das letzte Zeichen bereits ein Trennzeichen war (um Doppeltrennzeichen zu vermeiden)
    const lastChar = el.value.charAt(start - 1);
    if (separators.includes(lastChar)) {
      return _cancelEvent(event);
    }

    // Überprüfe, ob das Trennzeichen häufiger verwendet wird als im Format erlaubt
    const maxSeparatorCount = props.dateFormat.split(keyPressed).length - 1;
    const currentSeparatorCount = countSeparators(el.value, keyPressed);

    if (currentSeparatorCount >= maxSeparatorCount) {
      return _cancelEvent(event);
    }
  }

}
function onInput(event) {

  if (props.readonly || props.disabled) return _cancelEvent(event);

  console.log('ONINPUT');

  const el = event.target;

  __displayValue.value = el.value;
  model.value = _parseValue(el.value);

  emit('onInput', _getEmitParams(event));
}
function onBlur(event) {

  if (!opened.value) {

    console.log('onBlur', event);

    const parsedValue = _parseValue(event.target.value);
    model.value = parsedValue;
    __displayValue.value = _formatValue(parsedValue);

    emit('onBlur', _getEmitParams(event))

  } else {
    opened.value = false;
  }

};
function onToggle() {
  opened.value = !opened.value;
}
function onSelectDate(day) {

  console.log('onSelectDate', day);

  if (day.isBefore(minDate.value) || day.isAfter(maxDate.value)) {
    day = minDate.value;
    console.error('Der ausgewählte Tag liegt nicht im zulässigen Bereich. => Es wird minDate gesetzt');
  }

  const formatted = day.format('YYYY-MM-DD');
  model.value = formatted;
  __displayValue.value = _formatValue(formatted);

  opened.value = false;

  emit('onSelect', _getEmitParams(null))

}
function _cancelEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  console.log('!!!!! canceled');
  return false;
}


/** picker...  */
const currentDate = computed(() => model.value ? dayjs(model.value) : dayjs());
watch(
  () => currentDate.value,
  (newDate) => {
    if (newDate) {
      currentMonth.value = currentDate.value.startOf('month');
    }
  }
);
const currentMonth = ref(currentDate.value.startOf('month'));

const minDate = computed(() => props.minDate === 'today' ? dayjs().startOf('day') : props.minDate ? dayjs(props.minDate).startOf('day') : null);
const maxDate = computed(() => props.maxDate === 'today' ? dayjs().startOf('day') : props.maxDate ? dayjs(props.maxDate).startOf('day') : null);

const selectedDate = computed(() => dayjs(model.value));
const monthView = computed(() => {
  const startDay = currentMonth.value.startOf('week'); // Start der Woche des aktuellen Monatsanfangs
  const endDay = currentMonth.value.endOf('month').endOf('week'); // Ende der Woche des Monatsendes

  const days = [];

  for (let day = startDay; day.isSameOrBefore(endDay, 'day'); day = day.add(1, 'day')) {
    days.push(day);
  }

  return days;
});
const weekNumbers = computed(() => {

  if (!props.showWeeks) return [];

  const weekSet = new Set();

  monthView.value.forEach(day => {
    const weekNumber = day.isoWeek();
    weekSet.add(weekNumber);
  });

  return Array.from(weekSet);
});

function goNext() {
  currentMonth.value = currentMonth.value.add(1, props.startView);
}
function goPrevious() {
  currentMonth.value = currentMonth.value.subtract(1, props.startView);
}

function isDateDisabled(day) {
  if (minDate.value && day.isBefore(minDate.value, 'day')) {
    return true;
  }
  if (maxDate.value && day.isAfter(maxDate.value, 'day')) {
    return true;
  }
  return false;
};



</script>

<template>
  <!--                 <pre>
model:{{ model }}
display : {{ __displayValue }}
opened: {{  opened }}
currentDate : {{ currentDate }}
currentMonth : {{ currentMonth }}
selectedDate : {{selectedDate}}
</pre> -->
  <div :class="__class_root" ref="rootRef">
    <div :class="__class_input_wrap" ref="inputWrapRef">
      <div class="ip-input-slot" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </div>
      <input :id="_id" :class="__class_input" type="text" :name :value="__displayValue" :placeholder :readonly :disabled
        @click="onClick" @focus="onFocus" @input="onInput" @keydown="onKeyDown" @blur="onBlur" @paste="onPaste"
        autocomplete="off" ref="inputRef" />
      <label :for="_id" :class="__class_label">
        <Icon v-if="__error" name="warning" :color="__class_error_icon" :size="13" class="mr-1" /><span
          class="text-ellipsis overflow-hidden whitespace-nowrap">{{ __label }}</span>
      </label>
      <div class="ip-input-slot" @click="onToggle">
        <slot name="suffix">
          <Icon :name="opened ? 'calendar text-primary' : 'calendar'" :size="12" center></Icon>
        </slot>
      </div>
    </div>
    <div :class="__class_border"></div>
    <Teleport v-if="opened" to="body">
      <Transition name="zoom" appear>
        <div ref="pickerRef" :class="__class_picker" :style="__style_picker()">
          <div :class="__class_header">
            <div class="flex-1 text-lg select-none ml-2 font-geist-semibold">{{
              currentMonth.format('MMMM YYYY') }}</div>
            <IconBox @click="goPrevious" class="group cursor-pointer">
              <Icon name="angle-left" center class="group-hover:text-primary" :size="16"></Icon>
            </IconBox>
            <IconBox @click="goNext" class="group cursor-pointer">
              <Icon name="angle-right" center class="group-hover:text-primary" :size="16"></Icon>
            </IconBox>
          </div>
          <div :class="__class_weekdays">
            <div v-if="showWeeks" :class="__class_cell">Kw</div>
            <div v-for="weekday in weekdays" :key="weekday" :class="__class_cell">{{ weekday }}</div>
          </div>
          <div class="flex items-start">
            <div v-if="showWeeks" class="grid grid-cols-1 gap-1">
              <div v-for="(week, index) in weekNumbers" :key="'week-' + index"
                :class="[__class_cell, 'h-9 text-base text-slate-400']">{{ week }}</div>
            </div>
            <div class="flex-1 grid grid-cols-7 gap-1 place-items-center">
              <div v-for="(day, index) in monthView" :key="index" :class="__class_month_day(day)"
                @mousedown="onSelectDate(day)">{{ day.date() }}</div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang='scss' scoped>
.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
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
  width: 40px;
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
