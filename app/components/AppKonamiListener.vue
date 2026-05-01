<script setup lang="ts">
import Konami from 'konami'

const isRickRolled = useState('isRickRolled', () => false)
const konamiInstance = ref<any>(null)

onMounted(() => {
  konamiInstance.value = new Konami(() => {
    isRickRolled.value = !isRickRolled.value
  })
})

onBeforeUnmount(() => {
  if (konamiInstance.value) {
    konamiInstance.value.unload()
  }
})
</script>

<template>
  <div v-if="false" />
</template>
