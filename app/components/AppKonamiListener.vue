<script setup lang="ts">
import Konami from 'konami'

const isRickRolled = useState('isRickRolled', () => false)
const konamiInstance = ref<any>(null)

onMounted(() => {
  try {
    konamiInstance.value = new Konami(() => {
      isRickRolled.value = !isRickRolled.value
    })
  } catch {
    konamiInstance.value = null
  }
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
