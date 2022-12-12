<template>
  <transition @before-enter="beforeEnter" @enter="enter" appear>
    <li
      :style="{ background: 'url(' + video.thumbnail.url + ')' }"
      style="
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
      "
      class="border-proto_blue group col-span-1 flex flex-col rounded-sm border-l-4 text-center shadow">
      <button
        :disabled="videoStatusCode !== enums.STATUS.NOTHING"
        @click="addVideoToQueue()"
        :class="
          videoStatusCode !== enums.STATUS.NOTHING
            ? 'cursor-default'
            : 'group-hover:bg-white/60 group-hover:dark:bg-stone-800/60'
        "
        class="rounded-m flex flex-1 flex-col border-t border-b border-r border-gray-400 bg-white/80 px-8 py-4 duration-200 dark:border-gray-800 dark:bg-stone-800/80">
        <span
          class="text-md text-left text-lg font-bold text-gray-800 dark:text-stone-300">
          {{ video.title }}
        </span>
        <ul
          class="fa-ul mt-auto ml-5 w-full text-right text-sm font-medium text-gray-900 dark:text-stone-300">
          <li class="justify-bottom mt-auto flex flex-1 align-bottom">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-user" fixed-width>
              </font-awesome-icon>
            </span>
            <span class="truncate">
              {{ video.channel }}
            </span>
          </li>
          <li class="flex flex-1">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-clock" fixed-width>
              </font-awesome-icon>
            </span>
            <span
              class="truncate text-sm font-medium text-gray-900 dark:text-stone-300">
              {{ video.durationFormatted }}
            </span>
          </li>
          <li class="flex w-full flex-1">
            <span class="fa-li">
              <font-awesome-icon icon="fa-solid fa-eye" fixed-width>
              </font-awesome-icon>
            </span>
            <span
              class="truncate text-sm font-medium text-gray-900 dark:text-stone-300"
              >{{ video.viewsFormatted }}</span
            >

            <font-awesome-icon
              v-show="videoStatusCode === enums.STATUS.SUCCESS"
              icon="fa-solid fa-check-circle"
              size="lg"
              class="ml-auto mr-2 text-green-500">
            </font-awesome-icon>

            <font-awesome-icon
              v-show="videoStatusCode === enums.STATUS.WARNING"
              icon="fa-solid fa-warning"
              size="lg"
              class="ml-auto mr-2 text-yellow-400">
            </font-awesome-icon>

            <font-awesome-icon
              v-show="videoStatusCode === enums.STATUS.ERROR"
              icon="fa-solid fa-xmark-circle"
              size="lg"
              class="ml-auto mr-2 text-red-500">
            </font-awesome-icon>
          </li>
        </ul>
      </button>
    </li>
  </transition>
</template>

<script setup>
import { ref, inject } from "vue";
import gsap from "gsap";
import enums from "@/js/Enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const socket = inject("normalSocket");

const emit = defineEmits(["display-toast"]);

const props = defineProps({
  video: Object,
  index: Number,
});

const videoStatusCode = ref(enums.STATUS.NOTHING);

async function addVideoToQueue() {
  // set to arbitrary value to disable the button
  videoStatusCode.value = -4;
  const data = await new Promise((resolve) => {
    socket.emit("fetch-then-add-video", props.video.id, (callback) => {
      resolve(callback);
    });
  });
  videoStatusCode.value =
    data.success === true ? enums.STATUS.SUCCESS : data.status;
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? "Successfully added to the queue!",
  });
}

//animations
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(-50px)";
};

const enter = (el, done) => {
  gsap.to(el, {
    opacity: 1,
    ease: "back.out(1.4)",
    y: 0,
    duration: 0.5,
    onComplete: done,
    delay: 0.05 * props.index,
  });
};
</script>
