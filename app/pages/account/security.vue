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
    await navigateTo('/login/error')
    }
}



const { show, open, onResolve, onReject } = useShow();
const popup = reactive({});

function addAuthenticator(){
    open()
}

function generateQR(){
        
}


</script>

<template>
      <CssGrid :template="['48px', '1fr']" rows>
        <header class="flex items-center shrink-0 h-full border-b border-gray-200 px-4" >
          <div class="flex items-center justify-between h-full flex-1">
            <div class="flex items-center text-sm gap-2">
               <Logo :size="24"/>
               <Icon name="slash-forward" class="ml-0.5" :size="12"></Icon>
               <div class="text-sm text-foreground font-semibold">Account</div>
            </div>
            <div class="flex items-center text-sm">
               <a href="/logout">Logout</a>
            </div>
          </div>
        </header>
        <div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="flex items-center justify-between gap-4">
                  <h1 class="text-3xl">Security</h1>
              </div>
           </div>
           <div class="max-w-[1200px] px-4 lg:px-6 xl:px-10 mx-auto pt-12">
              <div class="first:pt-12 py-6 w-full flex flex-col gap-y-4">
                   
                <div class="border border-gray-200 rounded-xl p-3 flex flex-col  hover:bg-gray-50 transition">
                    <div class="flex items-center gap-2 cursor-pointer">
                        <IconBox><Icon name="mobile-button" :size="22" center></Icon></IconBox>
                        <div class="text-base flex-1">Authenticator App</div>
                        <div class="border border-gray-200 rounded-full bg-gray-50 text-xs text-gray-500 px-4 py-2">0 Apps verknüpft</div>
                    </div>
                    <div>
                        <div> 
                        Erzeuge Einmal-Passwörter über Authenticator-Apps wie Google, Microsoft, Authy usw., um deine Identität beim Anmelden mit einem zweiten Faktor zu bestätigen. 
                        </div>
                        <Button primary @click="addAuthenticator">Neue App hinzufügen</Button>
                           <Popup v-model:show="show" :width="480" height="auto" :resizeable="false">
                               <div class="flex items-center justify-between px-4 py-2">
                                <div class="">Authenticator-App hinzufügen</div>
                                <IconBox><Icon name="xmark" :size="18" center></Icon></IconBox>
                               </div>
                               <Button primary @click="generateQR">QR Code erzeugen</Button>
                           </Popup>
                    </div>
                </div>

              </div>
           </div> 
        </div>
      </CssGrid>
</template>