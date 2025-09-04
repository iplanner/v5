<script setup>

const props = defineProps({
    /** The color of the icon */
    name : {
        type : [ Array, String],
        required : true,
        default : ["fa-light"],
        validator(value) {
            return (typeof value === 'string' || Array.isArray(value));
        }
    },
    /** Weather the icon is center in the parent IconBox */
    center : Boolean,
    /** The color of the icon */
    color : { type: [String, Object]},
    /** The size of the icon in px */
    size : { type : Number, default : 14 },
})

/** computed classes */
const __class_icon = computed(() => {
  const classes = [];

  // Name als String
  if (typeof props.name === 'string') {
    classes.push(`fa-light`, `fa-${props.name}`);
  }

  // Name als Array (z. B. ['solid', 'user'])
  if (Array.isArray(props.name)) {
    props.name.forEach(item => classes.push(`fa-${item}`));
  }

  // Farbe
  if (typeof props.color === 'string' && props.color.length) {
    classes.push(props.color);
  } else {
    classes.push('text-gray-400', 'dark:text-gray-500');
  }

  // Center
  if (props.center) {
    classes.push(
      'absolute',
      'left-[50%]',
      'top-[50%]',
      'transform',
      '-translate-x-[50%]',
      '-translate-y-[50%]',
    );
  }

  // Zusätzliche Farb-Klassen als Objekt
  if (typeof props.color === 'object' && props.color !== null) {
    Object.entries(props.color).forEach(([key, val]) => {
      if (val) classes.push(key);
    });
  }

  return classes;
});

/** Computed color of the icon */
const __style_icon = computed(() => {
    return {
        fontSize : `${props.size}px`
    };
});

</script>

<template>
    <i :class="__class_icon" :style="__style_icon"></i>  
</template>
