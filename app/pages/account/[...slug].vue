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
  title: () => 'Account',
})

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
     await navigateTo('/logout', { external : true })
    }
}
</script>

<template>
      <CssGrid :template="['48px', '1fr']" rows>
        <header class="flex items-center shrink-0 h-full border-b border-gray-300 px-4" >
          <div class="flex items-center justify-between h-full flex-1">
            <div class="flex items-center text-sm gap-2">
               <Logo :size="24"/>
               <Icon name="slash-forward" class="ml-0.5" :size="12"></Icon>
               <div class="text-sm text-foreground font-semibold">Account</div>
            </div>
            <div class="flex items-center text-sm">
              <NuxtLink to="/logout" class="underline"> → Logout</NuxtLink>
            </div>
          </div>
        </header>
        <div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="flex items-center justify-between gap-4">
                  <h1 class="text-3xl">Accounteinstellungen</h1>
              </div>
           </div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="first:pt-12 py-6 w-full flex flex-col gap-y-4">
                   <NuxtLink to="/account" class="underline"> → Account</NuxtLink>
                   <NuxtLink to="/account" class="underline"> → Access Token</NuxtLink>
                   <NuxtLink to="/account/secure" class="underline"> → Security</NuxtLink>
                   <NuxtLink to="/account" class="underline"> → Logs</NuxtLink>
                  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    
                  </div>
              </div>
           </div> 
        </div>
      </CssGrid>
</template>