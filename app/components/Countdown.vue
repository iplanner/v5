<script setup>

const props = defineProps({
    /** Whether the countdown starts immediately. */
    autoStart: { type: Boolean, default: true },
    /** The interval in milliseconds  */
    interval: { type: Number, default: 1000, validator: value => value >= 0 },
    now: { type: Function, default: () => Date.now() },
    time: { type: Number, default: 0, validator: value => value >= 0 },
})

const emit = defineEmits(['onStart','onProgress','onEnd','onAbort']);


const MILLISECONDS_SECOND = 1000;
const MILLISECONDS_MINUTE = 60 * MILLISECONDS_SECOND;
const MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;
const MILLISECONDS_DAY = 24 * MILLISECONDS_HOUR;

const counting = ref(false);
const endTime = ref(0);
const totalMilliseconds = ref(props.time);
let requestId = 0;

const __days = computed(() => Math.floor(totalMilliseconds.value / MILLISECONDS_DAY));
const __hours = computed(() => Math.floor((totalMilliseconds.value % MILLISECONDS_DAY) / MILLISECONDS_HOUR));
const __minutes = computed(() => Math.floor((totalMilliseconds.value % MILLISECONDS_HOUR) / MILLISECONDS_MINUTE));
const __seconds = computed(() => Math.floor((totalMilliseconds.value % MILLISECONDS_MINUTE) / MILLISECONDS_SECOND));
const __milliseconds = computed(() => Math.floor(totalMilliseconds.value % MILLISECONDS_SECOND));

const __totalDays = computed(() => __days.value);
const __totalHours = computed(() => Math.floor(totalMilliseconds.value / MILLISECONDS_HOUR));
const __totalMinutes = computed(() => Math.floor(totalMilliseconds.value / MILLISECONDS_MINUTE));
const __totalSeconds = computed(() => Math.floor(totalMilliseconds.value / MILLISECONDS_SECOND));

watch(
    () => props.time,
    () => {
        totalMilliseconds.value = props.time;
        endTime.value = props.now() + props.time;

        if (props.autoStart && import.meta.client) {
            start();
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (props.autoStart) {
        start();
    }
});

function update() {
    if (counting.value) {
        totalMilliseconds.value = Math.max(0, endTime.value - props.now());
    }
}

function progress() {
    if (!counting.value) return;
    update();
    if (totalMilliseconds.value > 0) {
        emit('onProgress', {
            days: __days.value,
            hours: __hours.value,
            minutes: __minutes.value,
            seconds: __seconds.value,
            milliseconds: __milliseconds.value,
            totalDays: __totalDays.value,
            totalHours: __totalHours.value,
            totalMinutes: __totalMinutes.value,
            totalSeconds: __totalSeconds.value,
            totalMilliseconds: totalMilliseconds.value,
        });
    }
    continueCountdown();
}

function start() {
    if (counting.value) return;
    counting.value = true;

    if (!props.autoStart) {
        totalMilliseconds.value = props.time;
        endTime.value = props.now() + props.time;
    }

    emit('onStart');
    continueCountdown();
}

function continueCountdown() {
    if (!counting.value) return;

    const delay = Math.min(totalMilliseconds.value, props.interval);

    if (delay > 0) {
        let init, prev;
        const step = (now) => {
            if (!init) init = now;
            if (!prev) prev = now;

            const range = now - init;

            if (range >= delay || range + ((now - prev) / 2) >= delay) {
                progress();
            } else {
                requestId = requestAnimationFrame(step);
            }
            prev = now;
        };
        requestId = requestAnimationFrame(step);
    } else {
        end();
    }
}

function pause() {
    cancelAnimationFrame(requestId);
}

function end() {
    if (!counting.value) return;

    pause();
    totalMilliseconds.value = 0;
    counting.value = false;

    emit('onEnd');
}

</script>

<template> 
    <span>
        <slot :days="__days" :hours="__hours" :minutes="__minutes" :seconds="__seconds" :milliseconds="__milliseconds"></slot>
    </span>
</template>