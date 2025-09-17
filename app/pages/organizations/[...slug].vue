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
    const params = error.value?.data?.data?.params;

    if (params && Object.keys(params).length > 0) {
    await navigateTo({ path: '/login/error', query: params })
    } else {
    await navigateTo('/login/error')
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
               <div class="text-sm text-foreground font-semibold">Organisationen</div>
            </div>
            <div class="flex items-center text-sm">
               <a href="/logout">Logout</a>
            </div>
          </div>
         
        </header>
        <div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="flex items-center justify-between gap-4">
                  <h1 class="text-3xl">Deine Organisationen</h1>
              </div>
           </div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="first:pt-12 py-6 w-full flex flex-col gap-y-4">
                  <NuxtLink to="/account" class="underline"> → Account Settings</NuxtLink>
                  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <NuxtLink to="/organizations/8dc3f3a7e89a3814">
                          <div class="overflow-hidden rounded-lg shadow-sm grow bg-gray-100 p-3 border border-gray-200 min-h-20 flex items-center gap-2">
                              <IconBox>
                                <Icon name="buildings" center></Icon>
                              </IconBox>
                              <div class="flex flex-col w-full">
                                  <div class="text-sm text-gray-800">Muster GmbH</div>
                                   <div class="flex items-center text-xs text-gray-400">
                                    <div>Professional</div>
                                    <div>•</div>
                                    <div>1 Module</div>
                                  </div>
                              </div>
                          </div>
                      </NuxtLink>
                       <NuxtLink to="/organizations/0103538dc2a7ffdd">
                          <div class="overflow-hidden rounded-lg shadow-sm grow bg-gray-100 p-3 border border-gray-200 min-h-20 flex items-center gap-2">
                              <IconBox>
                                <Icon name="buildings" center></Icon>
                              </IconBox>
                              <div class="flex flex-col w-full">
                                  <div class="text-sm text-gray-800">Other GmbH</div>
                                  <div class="flex items-center text-xs text-gray-400">
                                    <div>Professional</div>
                                    <div>•</div>
                                    <div>3 Module</div>
                                  </div>
                              </div>
                          </div>
                      </NuxtLink>
                  </div>
              </div>
           </div> 
        </div>
      </CssGrid>
</template>