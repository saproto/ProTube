<template>
  <transition appear @before-enter="beforeEnter" @enter="enter">
    <li
      class="col-span-1 flex w-full flex-col overflow-hidden text-center shadow-sm duration-200"
      :class="roundedCorners ? 'rounded-lg' : 'rounded-xs'"
      :style="`
        background-repeat: no-repeat;
        background-position: center center;
        background-image: url(${thumbnail});
        background-size: cover;
      `">
      <div
        :style="`width:${progressBar}%;`"
        class="bg-proto_blue absolute bottom-0 h-2 w-0 rounded-xs opacity-60"></div>
      <button
        :disabled="!clickable"
        :class="[
          clickable && statusIcon === enums.STATUS.NOTHING
            ? 'hover:bg-white/40 dark:hover:bg-stone-800/40'
            : 'cursor-default',
          { 'rounded-lg': roundedCorners },
        ]"
        class="border-proto_blue flex flex-1 flex-col border-l-4 bg-white/80 px-8 py-4 duration-200 dark:border-gray-800 dark:bg-stone-800/80"
        @click="$emit('video-clicked', videoID)">
        <div
          class="text-md w-full overflow-x-hidden text-lg font-bold text-gray-800 dark:text-stone-300">
          <h3
            :id="cardId"
            :class="{
              'scroll-title': textOverflowing,
              'w-fit whitespace-nowrap text-left': textScrolling,
            }"
            class="text-md text-left font-bold text-gray-800 dark:text-stone-300">
            <span class="mr-5">{{ title }}</span>
            <span v-show="textOverflowing" class="mr-5">{{ title }}</span>
          </h3>
        </div>
        <ul
          class="fa-ul relative ml-5 mt-auto w-full text-right text-sm font-medium text-gray-900 dark:text-stone-300">
          <li
            v-if="name"
            class="justify-bottom mt-auto flex flex-1 align-bottom">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-user" fixed-width>
              </font-awesome-icon>
            </span>
            <span class="truncate">
              {{ name }}
            </span>
          </li>
          <li v-if="channel" class="flex flex-1 text-right">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-microphone" fixed-width>
              </font-awesome-icon>
            </span>
            <span class="truncate">
              {{ channel }}
            </span>
          </li>
          <li class="flex flex-1">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-clock" fixed-width>
              </font-awesome-icon>
            </span>
            <span
              class="truncate text-sm font-medium text-gray-900 dark:text-stone-300">
              {{ duration }}
            </span>
          </li>
          <li v-if="views" class="flex w-full flex-1">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-eye" fixed-width>
              </font-awesome-icon>
            </span>
            <span
              class="truncate text-sm font-medium text-gray-900 dark:text-stone-300"
              >{{ views }}
            </span>
          </li>

          <font-awesome-icon
            v-show="statusIcon === enums.STATUS.SUCCESS"
            icon="fa-solid fa-check-circle"
            size="lg"
            class="absolute bottom-0 right-0 ml-auto mr-2 text-green-500">
          </font-awesome-icon>

          <font-awesome-icon
            v-show="statusIcon === enums.STATUS.WARNING"
            icon="fa-solid fa-warning"
            size="lg"
            class="absolute bottom-0 right-0 ml-auto mr-2 text-yellow-400">
          </font-awesome-icon>

          <font-awesome-icon
            v-show="statusIcon === enums.STATUS.ERROR"
            icon="fa-solid fa-xmark-circle"
            size="lg"
            class="absolute bottom-0 right-0 ml-auto mr-2 text-red-500">
          </font-awesome-icon>

          <div class="absolute bottom-0 right-0 flex gap-1">
            <button
              v-if="canMoveUp"
              class="bg-proto_green rounded-lg px-3 py-2 text-xs font-medium text-white shadow-lg duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
              @click="$emit('move-clicked-up', videoID)">
              <font-awesome-icon icon="fas fa-arrow-up" fixed-width />
            </button>

            <button
              v-if="canMoveDown"
              class="bg-proto_green rounded-lg px-3 py-2 text-xs font-medium text-white shadow-lg duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
              @click="$emit('move-clicked-down', videoID)">
              <font-awesome-icon icon="fa-solid fa-arrow-down" fixed-width />
            </button>

            <button
              v-if="removeButton"
              class="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-lg duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
              @click="$emit('remove-clicked', videoID)">
              <font-awesome-icon icon="fa-solid fa-trash" size="lg">
              </font-awesome-icon>
            </button>
          </div>
        </ul>
      </button>
    </li>
  </transition>
</template>

<script setup>
import gsap from "gsap";
import enums from "@/js/Enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, onMounted } from "vue";

const cardId = `card_${Math.random()}`;
const textOverflowing = ref(false);

defineEmits([
  "video-clicked",
  "move-clicked-up",
  "move-clicked-down",
  "remove-clicked",
]);
const props = defineProps({
  name: {
    type: String,
    default: null,
  },
  channel: {
    type: String,
    default: null,
  },
  views: {
    type: String,
    default: null,
  },
  duration: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  title: { type: String, default: "" },
  videoID: { type: String, default: "" },
  index: {
    type: Number,
    default: 0,
  },
  statusIcon: {
    type: Number,
    default: enums.STATUS.NOTHING,
  },
  clickable: {
    type: String,
    default: null,
  },
  removeButton: {
    type: Boolean,
    default: false,
  },
  canMoveUp: {
    type: Boolean,
    default: false,
  },
  canMoveDown: {
    type: Boolean,
    default: false,
  },
  textScrolling: {
    type: Boolean,
    default: false,
  },
  progressBar: {
    type: Number,
    default: 0,
  },
  opacity: {
    type: Number,
    default: 1,
  },
  roundedCorners: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  if (!props.textScrolling) return false;
  const textWidth = document.getElementById(cardId).clientWidth;
  const parentWidth = document.getElementById(cardId).parentElement.clientWidth;
  textOverflowing.value = textWidth > parentWidth;
});

//animations
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(-50px)";
};

const enter = (el, done) => {
  gsap.to(el, {
    opacity: props.opacity,
    ease: "back.out(1.4)",
    y: 0,
    duration: 0.5,
    onComplete: done,
    delay: 0.05 * props.index,
  });
};
</script>

<style scoped>
.scroll-title {
  animation: slide-left 15s linear infinite;
}

@keyframes slide-left {
  0% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
  100% {
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
  }
}
</style>
