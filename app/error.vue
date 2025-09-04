<script setup>
const props = defineProps({
  error : { type: Object, default: () => ({}) }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <h1 class="text-3xl font-bold text-red-600">Oops! Es ist ein Fehler passiert</h1>
    <p class="mt-2 text-gray-500">{{ error?.statusCode }} – {{ error?.message }}</p>
    <button @click="handleError" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
      Zur Startseite
    </button>
  </div>
</template>