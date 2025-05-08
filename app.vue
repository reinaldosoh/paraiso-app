<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Adicionando a fonte Material Icons e configuração global
useHead({
  title: 'App Paraíso',
  meta: [
    { name: 'description', content: 'Aplicativo mobile para controle de despesas' },
    { name: 'theme-color', content: '#4CAF50' }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
    }
  ]
});
</script>
