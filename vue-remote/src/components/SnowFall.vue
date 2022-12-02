<template>
  <!-- snowflake (after use delete entire file) -->
  <div class="absolute h-full w-full overflow-hidden">
    <div v-for="i in 100" 
        :key="i" 
        class="snowflake" 
    ></div>
  </div>
</template>