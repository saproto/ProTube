<template>
  <div class="relative flex items-center justify-end w-full h-full overflow-hidden rounded-full -rotate-90">

    <!--background accent ring-->
    <div class="w-full h-full bg-gray-600 rounded-full ring-gray-400 ring-inset ring-2" />
    <!-- the stripes for the indicators-->
    <div v-for="i in 12"
        v-bind:key="i"
        class="absolute w-1/2 h-0.5 origin-left flex justify-end"
        :style="`transform:rotate(${i*(360/12)}deg)`">
      <div class="w-full rounded" :class="[(i%3==0)?'w-6':'w-3', (i%3==0)?'bg-proto_blue':'bg-gray-400']"></div>
    </div>

    <!--minute hand-->
    <div class="absolute w-1/2 h-1 bg-gray-300 rounded-full origin-left"
    :style="minuteRotation"/>
    <!--hour hand-->
    <div class="absolute w-1/2 h-1  origin-left"
    :style="hourRotation">
      <div class="w-2/3 h-full bg-gray-300 rounded-full" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"

const minute=ref(0)
const hour=ref(0)
const hourRotation=computed(()=>{
  return `transform:rotate(${hour.value*(360/12)}deg)`
})
const minuteRotation=computed(()=>{
  return `transform:rotate(${minute.value*(360/60)}deg)`
})
onMounted(()=>{
  const date=new Date()
  minute.value=date.getMinutes()
  hour.value=date.getHours()
  setInterval(()=>{
    const date=new Date()
    minute.value=date.getMinutes()
    hour.value=date.getHours()
  },1000)
})
</script>