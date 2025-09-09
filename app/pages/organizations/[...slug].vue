<script setup>

const route = useRoute();
const { message } = useSocketClient();


watchEffect(() => {
  console.log('Socket Client = ', message.value );
})

definePageMeta({
  requiresAuth: true,
})
useHead({
  title: () => 'Organisations',
})

const __params = computed(() => route.query || null)


const { data, error } = await useFetch(`/api${route.path}`, {
  query: __params
});
if (import.meta.client) {
  console.log('data', data.value);
}
if (error.value) {
  if (import.meta.client) {
    console.log('data', error.value.data);
  }
  //await navigateTo('/login/error')
}



</script>

<template>
      <CssGrid :template="['48px', '1fr']" rows>
        <header class="flex items-center shrink-0 h-full border-b border-gray-300 px-4" >
          <div class="flex items-center justify-between h-full flex-1">
            <div class="flex items-center text-sm gap-2">
               <Logo :size="24"/>
               <Icon name="slash-forward" class="ml-0.5" :size="12"></Icon>
               <div class="text-sm text-foreground font-semibold">Organisationen</div>
            </div>
            <div class="flex items-center text-sm">
               B
            </div>
          </div>
         
        </header>
        <div>Row 2</div>
      </CssGrid>
</template>