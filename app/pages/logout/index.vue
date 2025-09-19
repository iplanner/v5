<script setup>
const route = useRoute();
const { clear } = useUserSession();

definePageMeta({
  requiresAuth: false,
})

useHead({
  title: () => 'Logout',
})

/** FETCH PAGE DATA */
const __params = computed(() => route.query || null)
const { data, error } = await useFetch(`/api${route.path}`, {
  query: __params
});
if (error.value) {
  await navigateTo('/login', { external: true })
}else{
  await clear()
  await navigateTo(data.value?.path || '/login')
}
</script>
<template></template>

