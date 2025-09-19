<script setup>
const route = useRoute();
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()
definePageMeta({
  layout: 'login',
  requiresAuth: false,
})

useHead({
  title: () => 'Login',
})

onBeforeRouteLeave((to, from, next) => {
  console.log('onBeforeRouteLeave Login', to)
  next();
});

const formRef = useTemplateRef('formRef');

const __class_text = computed(() => ['text-center text-gray-500'])
const __class_link = computed(() => ['text-sm hover:text-primary hover:underline transition cursor-pointer'])

/** FETCH PAGE DATA */
const __params = computed(() => route.query || null)
const { data, error } = await useFetch(`/api${route.path}`, {
  query: __params
});
if (import.meta.client) {
  console.log('data', data.value);
}
if (error.value) {
    console.log('ERROR.DATA', error.value.data);
    
    const params = error.value?.data?.data?.params;

    if (params && Object.keys(params).length > 0) {
    await navigateTo({ path: '/login/error', query: params })
    } else {
    await navigateTo('/login/error')
    }
}

/** FORM SUBMIT */
const isLoading = ref(false);
async function submit({ displays, values }) {

  isLoading.value = true;
  await delay(data.value.submitTimeout);

  console.log('submit', displays, values);

  try {

    if (!data.value.submitUrl) {
      return;
    }

    const response = await $fetch(data.value.submitUrl, {
      method: 'post',
      body: { ...values }
    });

    console.log('response',response);

    if (response?.path) {
      await navigateTo(response.path);
    }

  } catch (error) {

    console.log('error',error);

    if (error.data) {
      Object.assign( dialog, error.data.data)
    }

  } finally {
    isLoading.value = false;
    data.value.submitTimeout += 1000;
  }
}

/** RESEND */
const resendTimeout = ref(60000);
const resendAttempts = ref(1)
async function resend(url = "") {

  resendAttempts.value++;
  resendTimeout.value = resendAttempts.value * 60000;

  const fetchUrl = url.length ? url.split('?')[0] : data.value.resendUrl || "";
  if (!fetchUrl) {
    return;
  }
  const queryParams = url.length ? getQueryParams(url) : route.query;
  const { values = {} } = formRef.value?.getFormValues() || {};
  const options = { method: 'POST', query: queryParams, body: { ...values } };

  try {
    const response = await $fetch(fetchUrl, options);
    Object.assign(dialog, response)
  } catch (error) {
    if (error.data) {
      Object.assign(dialog, error.data.data)
    } else {
      await navigateTo('/login/error')
    }
  }

}

function onCountdownEnd() {
  resendTimeout.value = 0;
}

const dialog = reactive({
  show: false,
  title: "",
  loader: false,
  body: "",
  error: true,
  inline: false,
  buttons: [],
  width: 320
});

async function onSelect(event) {
  if (event.value.length) {
    await navigateTo(event.value);
  }
}

</script>

<template>
 {{ loggedIn }}
  <div class="w-95 md:w-140 mt-4" v-if="data == null || error"> ERROR</div>
  <div v-else class="w-95 md:w-140 text-center flex flex-col gap-2 mx-auto">
    <p v-if="data?.step" class="text-sm text-slate-400 mt-3 " v-html="data.step" />
    <h1 class="text-4xl font-bold text-gray-800 dark:text-slate-100" v-html="data?.title"></h1>
    <p :class="[__class_text,'md:w-100 mx-auto mt-2']" v-html="data?.subtitle" />
    <div v-if="data.qr" class="flex items-center justify-center mt-1" v-html="data.qr"></div>
    <Form v-if="data.fieldsets.length" v-model="data.fieldsets" :automation="data.automation" size="xLarge" class="w-95 md:w-100 mx-auto" :class="{ 'mt-4': data.submitLabel.length }" @on-submit="submit" ref="formRef">
      <template #footer="{ onSubmit }">
        <Button v-if="data.submitLabel.length" block primary type="submit" size="xLarge" @click.prevent="onSubmit()" :class="{ 'mt-4': data.fieldsets?.length }">
          <WheelTransition :duration="200">
            <div v-if="!isLoading">{{ data.submitLabel }}</div>
            <Loader v-else :size="24"/>
          </WheelTransition>
        </Button>
      </template>
    </Form>
    <NuxtLink v-if="!data.fieldsets.length && data.submitLabel.length" :to="data.navigateTo[1]" class="mt-4 md:w-100 mx-auto">
      <Button block primary type="submit" size="xLarge">{{ data.submitLabel }}</Button>
    </NuxtLink>
    <p v-if="!isLoading && data.navigateTo?.length" class="flex items-center justify-center gap-2">
      <Icon v-if="data.navigateTo[0]?.length" :name="data.navigateTo[0]" class="text-gray-500" />
      <NuxtLink :to="data.navigateTo[1]" :class="[__class_text, __class_link]">{{ data.navigateTo[2] }}</NuxtLink>
    </p>
    <div v-if="!isLoading && data.resendText?.length" class="mb-4 text-center md:w-100 mx-auto">
      <p class=" text-center text-gray-500">{{ data.resendText[0] }} <span v-if="!resendTimeout" class="text-primary hover:text-primary transition hover:underline cursor-pointer" @click="resend()">{{ data.resendText[1] }}</span>
        <Countdown v-if="resendTimeout > 0" :time="resendTimeout" v-slot="{ minutes, seconds }" @on-end="onCountdownEnd">
          <span> In <span class="text-primary">{{ minutes }}:{{ (seconds < 10) ? `0${seconds}` : seconds }} {{ (minutes > 0) ? 'Minute': 'Sekunden' }}</span> kannst du eine erneute Zustellung anfordern!</span>
        </Countdown>
      </p>
    </div>
    <Dialog v-model:show="dialog.show" v-bind="dialog" @on-select="onSelect"></Dialog>
  </div>
</template>
