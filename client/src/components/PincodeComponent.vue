<template>
  <div class="mx-6 max-w-5xl sm:mx-auto">
    <div class="flex flex-col">
      <!-- Needs to be here to keep triggerering te computed function to construct a password -->
      <div class="mt-3 inline-flex hidden space-x-3 text-gray-700">
        <span class="">{{ passkey }}</span>
      </div>

      <div class="mx-auto mt-6 flex space-x-3">
        <template v-for="(item, i) in 4" :key="i">
          <input
            :id="'code_' + i"
            :ref="'code_' + i"
            v-model="digitsFromInput[i]"
            maxlength="1"
            type="text"
            inputmode="numeric"
            pattern="[0-9]"
            autocomplete="off"
            style="caret-color: transparent"
            class="h-16 w-12 select-none rounded-md border-none bg-gray-200/50 text-center text-4xl font-bold text-gray-800 shadow-md dark:bg-gray-50/50"
            tabindex="1"
            @keydown="onKeyDown"
            @keyup="onKeyUp"
            @focus="setCursorAtLast" />
        </template>
        <div
          v-show="passkeyAccepted || loading || passkeyAccepted == false"
          class="flex h-16 w-16 items-center justify-center rounded-md opacity-75 outline-hidden"
          :class="codeStatusIndicatorStyle">
          <font-awesome-icon
            v-show="passkeyAccepted && !loading"
            icon="fa-solid fa-check">
          </font-awesome-icon>

          <font-awesome-icon
            v-show="!passkeyAccepted && !loading"
            icon="fa-solid fa-xmark"
            size="2x">
          </font-awesome-icon>

          <font-awesome-icon
            v-show="loading"
            icon="fa-solid fa-circle-notch"
            size="2x"
            spin>
          </font-awesome-icon>
        </div>
      </div>
    </div>
    <transition name="errormessage">
      <div
        v-show="passkeyAccepted == false"
        class="mx-auto mt-3 flex justify-center rounded-md bg-red-300 py-1 text-center text-sm text-red-600">
        <font-awesome-icon icon="fa-solid fa-warning" class="mr-1 self-center">
        </font-awesome-icon>
        <span>{{ connectError }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import socket, { setPinCode, connectSocket } from "@/js/RemoteSocket";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const digitsFromInput = reactive({
  0: null,
  1: null,
  2: null,
  3: null,
});

let lastPressed;
let fieldIsEmpty;
let originalTarget;

const passkeyAccepted = ref(null);
const connectError = ref("");
const loading = ref(false);

const codeStatusIndicatorStyle = computed(() => {
  if (passkeyAccepted.value && !loading.value) {
    return "bg-green-400 text-green-600";
  } else if (!passkeyAccepted.value && !loading.value) {
    return "bg-red-300 text-red-600";
  } else {
    return "bg-gray-400 text-gray-600";
  }
});

const passkey = computed(() => {
  return allInputsFilled() ? constructPasskey() : null;
});

onMounted(() => {
  focusOnFirstInput();
});

socket.on("connect_error", (err) => {
  if (err.message === "Invalid screencode")
    processPinEntered(false, "Invalid pincode entered!");
  processPinEntered(false, err);
  // else processPinEntered(false, "Whoops.. Can't do anything with this response..");
});

socket.on("connect", () => {
  processPinEntered(true);
});

function onKeyDown(event) {
  originalTarget = event.target;
  if (
    (event.keyCode == 9 || event.keyCode == 39) &&
    event.target.id != "code_3"
  ) {
    //arrow right
    event.target.nextElementSibling.focus();
  } else if (event.keyCode == 37 && event.target.id != "code_0") {
    //arrow left
    event.target.previousElementSibling.focus();
  }

  if (
    (event.keyCode >= 48 && event.keyCode <= 57) ||
    (event.keyCode >= 96 &&
      event.keyCode <= 105 &&
      event.target.value != "" &&
      event.target.value.keyCode != event.keyCode)
  ) {
    lastPressed = event.keyCode;
    event.target.value = event.key;
    switch (originalTarget.id) {
      case "code_0":
        digitsFromInput[0] = event.key;
        break;
      case "code_1":
        digitsFromInput[1] = event.key;
        break;
      case "code_2":
        digitsFromInput[2] = event.key;
        break;
      case "code_3":
        digitsFromInput[3] = event.key;
        break;
      default:
        digitsFromInput[0] = event.key;
        break;
    }
  } else if (
    (event.keyCode >= 48 && event.keyCode <= 57) ||
    (event.keyCode >= 96 && event.keyCode <= 105)
  ) {
    lastPressed = event.keyCode;
  } else if (event.keyCode == 8) {
    lastPressed = event.keyCode;
    fieldIsEmpty = event.target.value;
  } else {
    event.preventDefault();
  }
  return;
}

function onKeyUp(event) {
  if (
    lastPressed == event.keyCode &&
    lastPressed != 8 &&
    event.target.value != ""
  ) {
    nextInput(event);
  } else if (lastPressed == event.keyCode && lastPressed == 8) {
    if (fieldIsEmpty == "") {
      previousInput(event);
      //event.target.previousElementSibling.value = '';
    }
  }
}

function setCursorAtLast(event) {
  setTimeout(function () {
    event.target.selectionStart = event.target.value.length;
  }, 10);
  return;
}

function previousInput(event) {
  if (event.target.id != "code_0") {
    event.target.previousElementSibling.focus();
    switch (originalTarget.id) {
      case "code_0":
        digitsFromInput[0] = null;
        break;
      case "code_1":
        digitsFromInput[0] = null;
        break;
      case "code_2":
        digitsFromInput[1] = null;
        break;
      case "code_3":
        digitsFromInput[2] = null;
        break;
      default:
        digitsFromInput[0] = null;
        break;
    }
  }
}

function nextInput(event) {
  event.target.nextElementSibling.focus();
}

function focusOnFirstInput() {
  document.getElementById("code_0").focus();
}

function allInputsFilled() {
  if (
    digitsFromInput[0] !== null &&
    digitsFromInput[1] !== null &&
    digitsFromInput[2] !== null &&
    digitsFromInput[3] !== null &&
    digitsFromInput[0] !== "" &&
    digitsFromInput[1] !== "" &&
    digitsFromInput[2] !== "" &&
    digitsFromInput[3] !== ""
  ) {
    makeServerConnection();
    return true;
  } else {
    return false;
  }
}

function makeServerConnection() {
  loading.value = true;
  setPinCode(constructPasskey());
  connectSocket();
}

function processPinEntered(success, reason = "") {
  passkeyAccepted.value = success;
  connectError.value = reason;
  loading.value = false;
  if (!success) {
    resetPinCode();
    focusOnFirstInput();
  }
}

function resetPinCode() {
  digitsFromInput[0] = null;
  digitsFromInput[1] = null;
  digitsFromInput[2] = null;
  digitsFromInput[3] = null;
  //focusOnFirstInput();
}

function constructPasskey() {
  return (
    digitsFromInput[0] +
    digitsFromInput[1] +
    digitsFromInput[2] +
    digitsFromInput[3]
  );
}
</script>

<style>
.icon-enter-from {
  opacity: 0;
}
.icon-enter-to {
  opacity: 1;
}
.icon-enter-active {
  transition: all 0.5s ease;
}

.errormessage-enter-from {
  opacity: 0;
  transform: scale(0);
}
.errormessage-enter-to {
  opacity: 1;
  transform: scale(1);
}
.errormessage-enter-active {
  transition: all 0.7s ease;
}
.errormessage-leave-from {
  opacity: 1;
  transform: scale(1);
}
.errormessage-leave-to {
  opacity: 0;
  transform: scale(0);
}
.errormessage-leave-active {
  transition: all 0.3s ease;
}
</style>
