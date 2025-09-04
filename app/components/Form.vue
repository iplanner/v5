<script setup>
import Sortable from "sortablejs";
import { evaluate } from 'mathjs'
import dayjs from 'dayjs';

/** the array of fieldsets */
const model = defineModel({ required: true, type: Array, default: () => [] });
/**
 * @typedef {Object} FIELDSET
 * @property {Number} id - id of the fieldset
 * @property {String} label - the legend title seen in template
 * @property {String} name - the serealizeation name of the fieldset
 * @property {Boolean} toggled - if the fieldset is toggled
 * @property {Boolean} multiple - indicator if fieldset is a list
 * @property {Boolean} sortable - indicator if fieldset is a list & sortable
 * @property {Array} padding - [0, 4]
 * @property {Number} columns - 2
 * @property {Array} fields - [...field] - see typedef of field
 * @property {Objekt} default - {...list} - the default to push, see typedef list
 * @property {Array} list - [...list] see typedef list
 * @property {Array} showIf - [1, 11, '===', ["1"]]
 * @property {Array} math - [[13, 'a * 1.19', { a : 13}]]
 */

/**
* @typedef {Object} FIELD
* @property {Number} id - id of the field
* @property {Number} x - 0
* @property {Number} y - 0
* @property {Number} w - 1
* @property {Number} h - 1
* @property {String} input - 'text|number|checkbox ...'
* @property {Object} props - ... the default input props
* @property {Array} showIf - [], [11, '===', ["1"], ?DEFAULT_VALUE wenn the field goes hidden]
* @property {Array} disableIf - [], [11, '===', ["5"]]
* @property {Array} notice - [], [ ICON,TEXT]
* @property {Boolean} visible - true , toggled the visibility when showIf occurs
* @property {Boolean} isHiddenField - true , if true the field is always invisible
* @property {Array} margin - [0, 0]
*/

/**
* @typedef {Object} LIST
* @property {Number} id - id of the list-item for delete ...
* @property {String} name - 'fieldset_301'
* @property {Number} maxListItems - 10, max items per list
* @property {Array} fields - [...field] - see typedef of field
*/

/**
 * @typedef {props.automation}
 * [
          [
            [32, "==", [1]], // 32 = Laufzeit 1 = monatlich 12 = , 24 = . 36, 48
            "AND",
            [33, "===", [12]], // 33 = Zahlungsweise 12 = monatlich 1 = jährlich
            "AND",
            ["401[]", "===", [0]],
          ],
          [["402[]", "value", 83.19],["404[]", "disabled", true], ["405[]","value",83.19]], // Einzelpreis  => value || math || disbaled etc...
        ]
 */

const props = defineProps({
    /** The size of the component. */
    size: {
        type: [String, Number],
        default: 'medium',
        validator(value) {
            return (typeof value === 'string' && ['tiny', 'small', 'medium', 'large', 'xLarge'].includes(value) || typeof value === 'number')
        }
    },
    /** The automation schema for the form e.g. [] */
    automation: { type: Array, default: () => [] },
    /** Whether the form will be validated */
    validation: { type: Boolean, default: true },
    /** When the validation should perform */
    validationVisibility: {
        type: String,
        default: 'submit',
        validator(value) {
            return ['blur', 'live', 'dirty', 'submit'].includes(value);
        }
    },
    /** wheather the fields will be rearanged by it's y and x values after show & hide to close empty spaces */
    fillSpaces: { type: Boolean, default: true },
    /** shows the notice under the fields */
    showNotice: { type: Boolean, default: true },
    /** Whether the form is readonly */
    readonly: Boolean,
})

const { validation, fillSpaces } = props;

const emit = defineEmits([
    'onSubmit',
    'onFieldsetToggle',
    'onFieldsetItemDelete',
    'onFieldsetPush',
    'onValueChanged',
]);


/** Template Refs */
const formRef = useTemplateRef('formRef');

/** computed classes */
const __class_form = computed(() => {
    return [
        {
            'shake-it': __shake.value,
        }
    ]
})
const __class_root = (fieldset, index) => {

    const isLast = index === __form.value.length - 1;
    const next = __form.value[index + 1];

    return {
        'mb-4': !fieldset.toggled && !isLast && next?.label?.length,
        'mb-3': !isLast && !next?.label?.length,
        'mb-[16px]': isLast && ( !fieldset.multiple || fieldset.multiple && !fieldset.list.length)
    };
}
const __class_legend = computed(() => {
    return [
        `flex items-center gap-1 w-full relative`,
    ];
});


/** computed styles */
function __style_list(fieldset){
    const { padding = [0, 0] } = fieldset;
        return {
            'margin-bottom': `${padding[1] * 4}px`
        }
}
function __style_fieldset(fieldset) {
const { padding = [0, 0], columns = 2, breakpoints = {} } = fieldset;

    let _repeat = columns;
    for (const [breakpoint, colValue] of Object.entries(breakpoints)) {
        if (width.value != 0 && width.value <= parseInt(breakpoint)) {
            _repeat = colValue;
            break;
        }
    }
    
    return {
        'grid-template-columns': `repeat( ${_repeat}, 1fr)`,
        'row-gap': `${padding[1] * 4}px`,
        'column-gap': `${padding[0] * 4}px`
    }
}
function __style_fieldset_delete() {

    return {
        position: 'absolute',
        top: '50%',
        right: '-32px',
        transform: 'translate(0, -50%)'
    }
}
function __style_field(field) {
    return {
        'grid-column': `${field.x + 1} / ${field.x + field.w + 1}`,
        'grid-row': `${field.y + 1} / ${field.y + field.h + 1}`,
        'margin' : field.margin ? field.margin.join(' ') : null
    }
}


/** computed states */
const { height, width }  = useResizeEvent();
const __readonly = computed(() => props.readonly)
const __submitted = ref(false);
const __error = ref(false);

const __lastUpdatedField = ref(null);

const __shake = ref(false); // shaked the form if erro occurs
watch(__shake, (val) => {
  if (val) setTimeout(() => (__shake.value = false), 500);
});

const __max_items_exeeded = (fieldset, countItems) => {
    return (fieldset.maxListItems || Infinity) <= countItems;
}
const __show_add_button = (fieldset) => {
    return fieldset.multiple && !__readonly.value && !__max_items_exeeded(fieldset, fieldset?.list.length || 0) && !fieldset.toggled 
}
const __show_toggle_button = (fieldset) => {
  if (__readonly.value) return false;

  if (fieldset.multiple) {
    return Array.isArray(fieldset.list) && fieldset.list.length > 0;
  } else {
    return Array.isArray(fieldset.fields) && fieldset.fields.filter(i => !i.isHiddenField).length >= 1;
  }
};

/** computed form */
const __form = ref([]);
const isUpdated = ref(true);
function getFormValues() {
  
    const result = {
    values: {},
    displays: {},
    names: {},
    fields: serialize(true)
  };

  for (const fieldset of __form.value) {
    
    const { multiple, list, fields, name } = fieldset;

    if (multiple && list) {
      result.values[name] = [];
      result.displays[name] = [];
      result.names[name] = [];

      for (const listItem of list) {
        const valueEntry = { listId: listItem.id };
        const displayEntry = { listId: listItem.id };
        const nameEntry = { listId: listItem.id };

        for (const field of listItem.fields) {
          const fieldName = field.props.name.replace(/\[\w+\]$/, '');
          const value = field.props.value;
          const display = _valueToDisplay(field);

          valueEntry[fieldName] = value;
          displayEntry[fieldName] = display;
          nameEntry[fieldName] = { value, display };
        }

        result.values[name].push(valueEntry);
        result.displays[name].push(displayEntry);
        result.names[name].push(nameEntry);
      }

    } else {
      for (const field of fields) {
        const { name: fieldName, value, display } = field.props ?? {};
        if (!fieldName) continue;

        const finalDisplay = display ?? _valueToDisplay(field);

        result.values[fieldName] = value;
        result.displays[fieldName] = finalDisplay;
        result.names[fieldName] = { value, display: finalDisplay };
      }
    }
  }

  return result;
}
watch(model, (newValue) => {

    if (newValue) {
        isUpdated.value = true;
    }
});
watchEffect(() => {

    if (isUpdated.value) {

        const __fieldsetsMap = new Map(model.value.map(item => [item.id, item]));
        const __fieldsMap = new Map(
            _getFieldsAsMap(model.value).map(field => [
                field.listId ? `${field.id}[${field.listId}]` : field.id,
                field.props
            ])
        );

        _processAutomation(__fieldsMap);
        __form.value = model.value.filter(fieldset => {

            // open the legend when the label text exist's
            /* if (fieldset.label?.length) {
                fieldset.toggled = false;
            } */

            const { showIf, id } = fieldset;

            // If there's no `showIf` condition, the fieldset is always visible
            if (!showIf || showIf.length === 0) return true;

            const [foreignFieldsetId, foreignFieldId, operator, expectedValues] = showIf;
            const foreignFieldset = __fieldsetsMap.get(foreignFieldsetId);

            // Check if it's the same fieldset, if no foreign fieldset exists, or if the foreign fieldset is multiple
            if (id === foreignFieldsetId || !foreignFieldset || foreignFieldset.multiple) return true;

            const foreignField = foreignFieldset.fields.find(({ id }) => id === foreignFieldId);

            // If the foreign field or its props are missing, or the operator doesn't exist, the fieldset is visible
            if (!foreignField || !foreignField.props || !comparator[operator]) return true;

            // Check if any of the expected values match the condition based on the comparison operator
            return expectedValues.some(value => comparator[operator](foreignField.props.value, value));
            })
            .map(fieldset => {

                if (fieldset.list) {

                    fieldset.list.forEach(item => {
                        item.fields = _fillEmptySpaces(item.fields.map(field => _processField(field, fieldset, __fieldsMap, item.id)));
                        _processMath(fieldset.math, __fieldsMap, item.id);
                    });

                } else if (fieldset.fields) {
                    fieldset.fields = _fillEmptySpaces(fieldset.fields.map(field => _processField(field, fieldset, __fieldsMap)));
                    _processMath(fieldset.math, __fieldsMap);
                }

                return fieldset;

            });

        isUpdated.value = false;
    }
})

function _getFieldsAsMap(fieldsets = []) {
  return fieldsets.reduce((acc, fieldset) => {
    if (Array.isArray(fieldset.list)) {
      fieldset.list.forEach(item => {
        (item?.fields || []).forEach(field => {
          field.listId = item.id;
          acc.push(field);
        });
      });
    } else {
      acc.push(...(fieldset.fields || []));
    }
    return acc;
  }, []);
}
function _processField(field, fieldset, __fieldsMap, itemId = null) {

    // Handle readonly (props.readonly)
    field.props.readonly = __readonly.value || field.props.readonly;

    // Handle the size of the form inputs
    field.props.size = (field.props.size) ? field.props.size : props.size;

    // Handle the input type radio , deselect other fields
    if (field.input === 'radio' && __lastUpdatedField.value?.input === 'radio' ) {

        const { id: changedId, props } = __lastUpdatedField.value;
        for (const [id, _field] of __fieldsMap) {
            if (_field.name === props.name && id !== changedId) {
                _field.value = props.value;
            }
        }

        __lastUpdatedField.value = null; 
    }

    // Handle validation
    if (validation && props.validationVisibility === 'live') {
        useFormValidation([field.props]);
    }

    // Handle visibility (field.showIf)
    const [showForeignId, showOperator, showExpectedValues, resetValue] = field.showIf || [];

    const showForeignField = __fieldsMap.get(itemId ? `${showForeignId}[${itemId}]` : showForeignId);

    if (field.showIf && showForeignField && comparator[showOperator]) {
        field.visible = showExpectedValues.some(value => comparator[showOperator](showForeignField.value, value));
    }

    if (field.visible) {
        // Handle disabled (field.disableIf)
        const [disableForeignId, disableOperator, disableExpectedValues] = field.disableIf || [];
        const disableForeignField = __fieldsMap.get(itemId ? `${disableForeignId}[${itemId}]` : disableForeignId);

        if (disableForeignField && comparator[disableOperator]) {
            field.props.disabled = disableExpectedValues.some(value => comparator[disableOperator](disableForeignField.value, value));

            if (field.props.disabled) {
                field.props.validationErrors = [];
            }
        }
    } else {
        // Reset the value to default if resetValue != undefined
        if (resetValue) {
            field.props.value = resetValue;
        }
    }

    // Open fieldsets when field has validation errors
    if (field.props?.validationErrors?.length) {
        fieldset.toggled = false;
    }

    return field;
}
function _processMath(math, __fieldsMap, itemId = null) {

    if (!Array.isArray(math)) return;

    math.forEach(([resultFieldId, formula, fields]) => {

        const _resultFieldId = itemId ? `${resultFieldId}[${itemId}]` : resultFieldId;

        const resultField = __fieldsMap.get(_resultFieldId);
        if (!resultField) return;

        const formularFields = Object.entries(fields).reduce((acc, [key, fieldId]) => {
            const fullFieldId = itemId ? `${fieldId}[${itemId}]` : fieldId;
            const field = __fieldsMap.get(fullFieldId) || __fieldsMap.get(fieldId);

            if (field) {
                const fieldValue = Number(field.value);
                if (!isNaN(fieldValue)) {
                    acc[key] = fieldValue;
                }
            }
            return acc;
        }, {});

        try {
            resultField.value = evaluate(formula, formularFields);
        } catch (error) {
            console.error('Fehler bei der Berechnung der Formel: ', formula, formularFields, error);
        }
    });
}


/** automation */
const __autoConditionFields = computed(() => {
    // extrahiert die Felder aus props.condition die eine condition auslösen
    return new Set(
        props.automation.flatMap(item =>
            item[0]
                .filter(entry => Array.isArray(entry))
                .map(entry => entry[0])
        )
    );
})
function _processAutomation(__fieldsMap) {

    if (!props.automation.length) return;

    const bracketFields = Array.from(__fieldsMap.keys()).filter(id => String(id).endsWith("]"));


    for (let rule of props.automation) {
        let [conditions, thenPart] = rule;
        let matchingIndexes = [];
        let lastOperation = 'AND';
        let result = true;
        let hasBracketFields = false;

        // Verarbeite Bedingungen
        for (let item of conditions) {
            if (Array.isArray(item)) {
                const [fieldId, operator, expectedValues] = item;
                let tempMatchingIndexes = [];
                let queryResult = false;

                // Bracket-Feld-Verarbeitung
                if (typeof fieldId === 'string' && fieldId.includes('[]')) {
                    hasBracketFields = true;
                    let matchingFields = bracketFields.filter(id => id.startsWith(fieldId.replace('[]', '') + "["));

                    for (let matchingFieldId of matchingFields) {
                        let field = __fieldsMap.get(matchingFieldId);
                        if (field && expectedValues.some(value => comparator[operator](field.value, value))) {
                            queryResult = true;
                            tempMatchingIndexes.push(matchingFieldId.match(/\[(.*?)\]/)[1]);
                        }
                    }

                } else {
                    // Normale Feld-Verarbeitung
                    const field = __fieldsMap.get(fieldId);
                    if (field) {
                        queryResult = expectedValues.some(value => comparator[operator](field.value, value));
                    }
                }

                // Logische Operationen AND/OR
                result = (lastOperation === 'AND') ? result && queryResult : result || queryResult;

                // Update der Indizes für Bracket-Felder
                if (hasBracketFields) {
                    if (result) {
                        if (lastOperation === 'AND' && matchingIndexes.length > 0) {
                            matchingIndexes = matchingIndexes.filter(index => tempMatchingIndexes.includes(index));
                        } else if (lastOperation === 'OR') {
                            matchingIndexes = [...new Set([...matchingIndexes, ...tempMatchingIndexes])];
                        } else if (matchingIndexes.length === 0) {
                            matchingIndexes = tempMatchingIndexes;
                        }
                    } else {
                        matchingIndexes = [];
                        break;
                    }
                }

                // Abbruch, wenn das Ergebnis falsch ist
                if (!result) break;

            } else if (item === 'AND' || item === 'OR') {
                lastOperation = item;
            }
        }

        if (hasBracketFields && matchingIndexes.length > 0) {
            matchingIndexes.forEach(matchingIndex => {

                for (const [_fieldId, _field] of __fieldsMap) {
                    if (String(_fieldId).endsWith(`[${matchingIndex}]`) && _field) {
                        _field.disabled = false;
                    }
                }

                thenPart.forEach(thenAction => _processAutomationThen(thenAction, __fieldsMap, matchingIndex));
            });
        } else if (!hasBracketFields && result) {
            thenPart.forEach(thenAction => _processAutomationThen(thenAction, __fieldsMap, null));
        }
    }


}
function _processAutomationThen(thenAction, __fieldsMap, matchingIndex) {

    const [originalFieldId, actionKey, actionValue] = thenAction;

    let fieldId = originalFieldId;

    if (typeof fieldId === 'string' && fieldId.includes('[]') && matchingIndex !== null) {
        fieldId = fieldId.replace('[]', `[${matchingIndex}]`);
    }

    if (lastChangedFields.has(fieldId)) {
        console.log('canceled Automation !!! for ', fieldId)
        return;
    }

    const field = __fieldsMap.get(fieldId);
    if (field) {

        if (actionKey === 'math') {
            _processMath(actionValue, __fieldsMap, matchingIndex)
        } else {

            field[actionKey] = actionValue;


        }

    }
}

/* function _fillEmptySpaces(fields) {

    if (!fillSpaces) return fields;

    // Gruppiere nur die Felder nach ihrer y-Position, bei denen visible true ist
    const rows = fields.reduce((acc, field) => {
        if (field.visible === false) return acc; // Überspringe unsichtbare Felder
        if (!acc[field.y]) acc[field.y] = [];
        acc[field.y].push(field);
        return acc;
    }, {});

    // Sortiere die sichtbaren Felder nach ihren y-Werten und x-Werten innerhalb der Reihen
    const sortedRows = Object.values(rows)
        .sort((a, b) => a[0].y - b[0].y) // Sortiere nach y
        .map(row => {
            let currentX = 0;
            return row.sort((a, b) => a.x - b.x) // Sortiere nach x
                .map(field => {
                    field.x = currentX; // Setze x-Wert neu
                    field.y = row[0].y; // Behalte den y-Wert bei
                    currentX += field.w;
                    return field;
                });
        });

    // Flache das Array (entferne die geschachtelten Reihen)
    const positionedVisibleFields = sortedRows.flat();

    // Füge die unsichtbaren Felder wieder hinzu, ohne ihre Positionen zu verändern
    const finalFields = fields.map(field => {
        if (field.visible === false) {
            return field; // Unsichtbare Felder behalten ihre ursprünglichen Positionen
        }
        // Ersetze das Feld mit den neu positionierten, sichtbaren Feldern
        return positionedVisibleFields.find(f => f.id === field.id) || field;
    });

    return finalFields;
} */
function _fillEmptySpaces(fields) {

    if (!fillSpaces) return fields;

    let currentX;

    // Gruppiere die sichtbaren Felder, sortiere sie und berechne neue Positionen
    const positionedFields = fields.map(field => {
        if (field.visible === false) return field; // Unsichtbare Felder unverändert lassen

        if (currentX == null || field.y !== currentX.y) {
            currentX = { x: 0, y: field.y }; // Starte eine neue Reihe
        }

        field = { ...field, x: currentX.x }; // Neue x-Position setzen
        currentX.x += field.w; // x für das nächste Feld erhöhen

        return field;
    });

    return positionedFields;
}
function _setGroupSummary(group, fieldsMap) {

    return (!Array.isArray(group?.summary)) ? [] : group.summary.map(field => {

        /** get default */
        const { id, x, y, w, h, props } = getObjectByKeyPath(group.default.fields, 'props.name', field.fieldName);

        const format = props?.format || {};
        const sum = Array.from(fieldsMap).reduce((acc, [key, mapValue]) => {
            if (String(key).startsWith(`${id}[`) && String(key).endsWith("]")) {
                acc += mapValue.value;
            }
            return acc;
        }, 0);

        const values = {
            sum,
            count: group.set.length,
            text: field.text
        };
        const displays = {
            sum: numberFormat({ value: sum, ...format }),
            count: group.set.length,
            text: field.text
        }
        return {
            id,
            name: field.fieldName,
            x,
            y,
            w,
            h,
            value: values[field.type],
            display: displays[field.type],
            showInFooter: field.showInFooter || false
        };
    });
}

/** hooks */
onMounted(() => {
    console.log('onMounted Form', props);
    initSortable()
})

/** fieldsets actions */
let sortables = [];
function initSortable() {

    if (props.readonly || !formRef?.value) return;

    callSortable('destroy');

    let dragGhost = {}
    let mousePos = { x: 0, y: 0 }

    const elements = Array.from(formRef.value.querySelectorAll('.ip-fieldset-sortable'));

    for (var i = 0; i < elements.length; i++) {

        const instance = new Sortable(elements[i], {
            //group: elements[i].dataset.groupName,
            animation: 150,
            handle: ".ip-sortable-item",
            fallbackOnBody: true,
            swapThreshold: 0.65,
            setData: function (dataTransfer, dragEl) {

                dragGhost = dragEl.cloneNode(true);
                dragGhost.classList.add('custom-drag-ghost');

                const rect = dragEl.getBoundingClientRect();
                dragGhost.style.width = `${rect.width}px`;
                dragGhost.style.height = `${rect.height }px`;
        
                document.body.appendChild(dragGhost);

                dataTransfer.setDragImage(dragGhost, mousePos.x - rect.left, mousePos.y - rect.top);

            },
            onChoose: (evt) => {

                /** Save MouseX for DataTransfer Img */
                const { clientX, clientY } = evt.originalEvent;
                mousePos.x = clientX;
                mousePos.y = clientY;

            },
            onEnd: (evt) => {

                const { oldIndex, newIndex, from, item } = evt;

                
                if (from.dataset.multiple) {
                    const { fieldsetIndex } = item.dataset;

                    console.log('item.dataset',item.dataset);

                    console.log('__form.value',__form.value);

                    __form.value[fieldsetIndex].list.splice(newIndex, 0, __form.value[fieldsetIndex].list.splice(oldIndex, 1)[0]);
                } else {
                    // Hier kannst du die arrayMoveElement-Logik direkt nutzen, falls benötigt.
                    // visibleGroups = arrayMoveElement(visibleGroups, oldIndex, newIndex);
                }

                if (dragGhost && dragGhost.parentNode) {
                    dragGhost.parentNode.removeChild(dragGhost);
                }
            }
        });
        sortables.push(instance);
    }
}
function callSortable(fn, params = []) {

    sortables.forEach(instance => {
        if (typeof instance[fn] === 'function') {
            instance[fn](...params);
        }
    })

    if (fn == 'destroy') {
        sortables = [];
    }

}
function fieldsetToggle(fieldset) {

    if (__error.value) return;

    fieldset.toggled = !fieldset.toggled;

    if (!fieldset.toggled) {
        nextTick(() => {
            initSortable();
        })
    }

    emit('onFieldsetToggle', fieldset);

}
function fieldsetPush(fieldset) {

    const id = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const { name = "", maxListItems, fields, list } = fieldset;

    if(!fields.length) return;

    const newItem = {
        id,
        name,
        maxListItems,
        fields : JSON.parse(JSON.stringify(fields))
    }

    list.push(newItem);

    if (__submitted.value) {
        formValidate();
    }

    isUpdated.value = true;

    emit('onFieldsetPush', newItem)
}
function fieldsetItemDelete(fieldset, index) {

    emit('onFieldsetItemDelete', { fieldsetId: fieldset.id, ...fieldset.list[index] });

    fieldset.list.splice(index, 1);

    if (__submitted.value) {
        formValidate();
    }

}

/** fields events */
let lastChangedFields = new Set();
function onValueChanged(event, field) {

    console.log('onValueChanged',event, field);

     __lastUpdatedField.value = field;

    isUpdated.value = true;

    field.props.display = (field.displayValue) ? field.displayValue : _valueToDisplay(field);

    const [_, fieldId, listIndex] = String(event.id).match(/^([^\[]+)(?:\[(.*?)\])?$/) || [];

    const _plainId = Number(listIndex) > 0 ? `${fieldId}[]` : Number(fieldId);

    if (__autoConditionFields.value.has(_plainId)) {
        lastChangedFields.clear();
    }

    lastChangedFields.add(event.id);

    if (validation &&
        props.validationVisibility === 'dirty' ||
        props.validationVisibility === 'submit' && __submitted.value ||
        props.validationVisibility === 'live' ||
        props.validationVisibility === 'blur' && field.props.validationErrors.length
    ) {
        formValidate();
    }

    emit('onValueChanged', {
        event,
        field
    })
}
function onBlur(event) {

    if (validation && props.validationVisibility === 'blur') {
        formValidate();
    }

}
function onKeyUp(event, field) {

    if (field.input === 'code') {
        if (event.originalEvent.code === 'Enter') {
            onSubmit();
        }
    }
}


/** form actions*/
function formValidate() {
    if (validation) {
        __error.value = !isEmpty(useFormValidation(serialize(true)));
    }
}
function serialize(toArray = false) {

    const getFields = (form, fields, listId = false) => {
        fields.forEach(({ visible, props, id, isHiddenField = false }) => {

            if (props?.name && (visible || isHiddenField)) {

                props.name = listId ? `${props.name.replace(/\[.*?\]/g, '')}[${listId}]` : props.name;
                props.id = id;

                if (toArray) {
                    form.push(props);
                } else {
                    form[props.name] = props.value;
                }
            }
        });
    };

    return __form.value.reduce((form, fieldset) => {
        if (fieldset.multiple && fieldset.list) {
            fieldset.list.forEach(({ fields, id }) => getFields(form, fields, id));
        } else {
            getFields(form, fieldset.fields);
        }
        return form;
    }, toArray ? [] : {});
}
function _valueToDisplay(field) {

    const { input, props } = field;

    switch (input) {

        case "checkbox":
        case "toggle":
            return props.value === props.trueValue
                ? props.trueDisplayValue || props.value
                : props.falseDisplayValue || props.value;
        case "text":
            return props.value.toString();
        case "radio":
            return props.value === props.trueValue ? props.trueDisplayValue : null;
        case "select":
            return props.options.find(o => o.value === props.value)?.display || "";
        case "date":
            return dayjs(props.value).isValid() ? dayjs(props.value).format(props.dateFormat || "DD.MM.YYYY") : "";
        case "number":

            return `${props.prefix || ""} ${new Intl.NumberFormat('de-DE', {
                minimumFractionDigits: props.precision,
                maximumFractionDigits: props.precision,
                roundingMode: props.rounding ? 'ceil' : 'halfEven'
            }).format(props.value)} ${props?.suffix || ''}`.trim();

        case "code":
            return (typeof props.value === 'number') ? props.value.toString() : props.value;
        default:
            return ""
    }


}
function onSubmit() {

    __submitted.value = true;

    if (props.validationVisibility === 'submit') {
        
        formValidate();

        if (__error.value) {
            __shake.value = true
            return
        };
    }

    console.log('onSubmit', getFormValues());

    emit('onSubmit', getFormValues())

}
function onClear() {
    __submitted.value = false;
}


defineExpose({
    __submitted,
    onSubmit,
    getFormValues
});

</script>

<template>

    <form :class="__class_form" autocomplete="off" ref="formRef" @submit.prevent="onSubmit">
        <fieldset v-for="(fieldset, fieldsetIndex) in __form" :key="fieldset.id" :id="fieldset.id" :class="__class_root(fieldset, fieldsetIndex)">
            <legend v-if="fieldset.label?.length" :class="[__class_legend]">
                <slot name="border" :index="fieldsetIndex"></slot>
                <slot name="legend" :fieldset="fieldset" :showToggleButton="__show_toggle_button(fieldset)" :fieldsetToggle="() => fieldsetToggle(fieldset)" :fieldsetPush="() => fieldsetPush(fieldset)">
                    <slot v-if="fieldset.label" name="label" :label="fieldset.label" :fieldset=fieldset :fields-count="Number(fieldset?.fields?.length)" :list-count="Number(fieldset?.list?.length)">
                        <div class="flex-1 px-2 py-4 min-w-0">
                            <div class="text-base text-left text-slate-800 dark:text-slate-200 font-satoshi-medium">{{ fieldset.label }}</div>
                        </div>
                    </slot>
                    <slot v-if="__show_toggle_button(fieldset)" name="toggleButton" :fieldsetToggle="() => fieldsetToggle(fieldset)">
                        <IconBox size="tiny" class="group hover:bg-primary/7.5 cursor-pointer" @click="fieldsetToggle(fieldset)">
                            <Icon name="angle-down" :class="['group-hover:text-primary transition duration-300', {'rotate-180' : fieldset.toggled}]" center />
                        </IconBox>
                    </slot>
                    <slot v-if="__show_add_button(fieldset)" name="addButton" :fieldsetPush="() => fieldsetPush(fieldset)">
                        <Tooltip text="Hinzufügen">
                            <IconBox size="tiny" class="group hover:bg-primary/7.5 cursor-pointer" @click="fieldsetPush(fieldset)">
                                <Icon name="plus" class="group-hover:text-primary" center />
                            </IconBox>
                        </Tooltip>
                    </slot>
                </slot>
            </legend>
            <Expander v-if="!fieldset.multiple" :toggled="fieldset.toggled" class="-m-1.5">
                <div class="grid p-1.5 " :style="__style_fieldset(fieldset)">
                    <div v-for="field in fieldset.fields.filter(({ visible }) => visible === true)" :key="field.id" :style="__style_field(field, fieldset)">
                        <InputText v-if="['text', 'password', 'textarea'].includes(field.input)" v-model="field.props.value" :id="field.id" v-bind="field.props" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                        <InputCode v-else-if="field.input === 'code'" v-model="field.props.value" :id="field.id" v-bind="field.props" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" @onKeyUp="onKeyUp($event, field)" />
                        <InputNumber v-else-if="field.input === 'number'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                        <InputCheckbox v-else-if="field.input === 'checkbox'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                        <InputToggle v-else-if="field.input === 'toggle'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                        <InputSlider v-else-if="field.input === 'slider'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputRadio v-else-if="field.input === 'radio'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputDate v-else-if="field.input === 'date'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputSelect v-else-if="field.input === 'select'" v-model="field.props.value" v-bind="field.props":id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputUpload v-else-if="field.input === 'upload'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputSignature v-else-if="field.input === 'signature'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <InputTabselect v-else-if="field.input === 'tabselect'" v-model="field.props.value" v-bind="field.props" :id="field.id" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        <div v-if="field?.notice?.length" class="text-slate-500 text-left mt-2 px-3 text-xs flex items-start gap-2">
                            <Icon :name="['regular', field.notice[0]]" :size="12" color="text-primary" class="!leading-4"/>
                            <span>{{ field.notice[1] }}</span>
                        </div>
                    </div>
                </div>
            </Expander>
            
            <ul v-if="!fieldset.toggled && fieldset.multiple" :class="{ 'ip-fieldset-sortable': !__readonly && fieldset.sortable }" :data-multiple="true">
                <li v-for="(list, index) in fieldset.list" :key="list.id" class="relative" :class="{ 'ip-sortable-item': fieldset.list.length > 1 && fieldset.sortable }" :data-fieldset-index="fieldsetIndex" :style="__style_list(fieldset)">
                    <div class="grid" :style="__style_fieldset(fieldset)">
                        <div v-for="field in list.fields.filter(({ visible }) => visible === true)" :key="field.id"  :style="__style_field(field, fieldset)">
                            <InputText v-if="['text', 'password', 'textarea'].includes(field.input)" v-model="field.props.value" :id="`${field.id}[${list.id}]`" v-bind="field.props" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputCode v-else-if="field.input === 'code'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" @onKeyUp="onKeyUp($event, field)" />
                            <InputNumber v-else-if="field.input === 'number'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputCheckbox v-else-if="field.input === 'checkbox'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputToggle v-else-if="field.input === 'toggle'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputSlider v-else-if="field.input === 'slider'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputRadio v-else-if="field.input === 'radio'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                            <InputDate v-else-if="field.input === 'date'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputSelect v-else-if="field.input === 'select'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur" />
                            <InputTabselect v-else-if="field.input === 'tabselect'" v-model="field.props.value" v-bind="field.props" :id="`${field.id}[${list.id}]`" @onValueChanged="onValueChanged($event, field)" @onBlur="onBlur"/>
                        </div>
                    </div>
                    <slot v-if="!__readonly && list.fields.length" name="deleteButton" :fieldsetItemDelete="() => fieldsetItemDelete(fieldset, index)">
                        <IconBox :size="24" class="group cursor-pointer" @click="fieldsetItemDelete(fieldset, index)"
                            :style="__style_fieldset_delete()">
                            <Icon name="xmark" class="group-hover:text-primary" center />
                        </IconBox>
                    </slot>
                </li>
            </ul>
        </fieldset>
        <!-- ERRORS : {{ __error }}, SUMITTED : {{ __submitted }}  -->
        <slot v-if="!__readonly" name="footer" :submitted="__submitted" :onSubmit="onSubmit" :onClear="onClear">
            <div class="flex items-center justify-center gap-2 flex-1">
                <slot name="submit" :onSubmit="onSubmit"></slot>
                <slot name="cancel" :onClear="onClear"></slot>
            </div>
        </slot>
    </form>
</template>

<style lang='scss'>

.custom-drag-ghost {
    /* The original cloned element must not take place up in the page and must not be visible */
    position: absolute;
    top: -99999px;
    left: -99999px;
    list-style-type: none;
    background-color: color-mix(in oklab, var(--color-primary) 15%, transparent);
    border-radius: 12px;
    border: 1px dashed color-mix(in oklab, var(--color-primary) 30%, transparent);

    &:before {
        content: none;
    }

    >* {
        opacity : 0;
    }

}

.shake-it {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100%   { transform: translateX(0); }
  20%, 60%   { transform: translateX(-4px); }
  40%, 80%   { transform: translateX(4px); }
}

</style>