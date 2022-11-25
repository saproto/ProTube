<template>
  <div class="max-w-5xl mx-6 sm:mx-auto">
    <div class="flex flex-col">
      <!-- Needs to be here to keep triggerering te computed function to construct a password -->
      <div class="hidden mt-3 text-gray-700 space-x-3 inline-flex">
        <span class="">{{ passkey }}</span>
      </div>
 
      <div class="mt-6 flex mx-auto space-x-3">
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
            class="
              w-12
              h-16
              rounded-md
              dark:bg-gray-50
              shadow-md
              bg-gray-200
              border-none
              text-center
              text-gray-800
              font-bold
              text-4xl
              bg-opacity-50
              select-none
            "
            tabindex="1"
            @keydown="onKeyDown"
            @keyup="onKeyUp"
            @focus="setCursorAtLast"
          />
        </template>
        <div
          v-show="passkeyAccepted || loading || passkeyAccepted == false"
          class="
            w-16
            h-16
            rounded-md
            flex
            items-center
            justify-center
            opacity-75
            outline-none
          "
          :class="codeStatusIndicatorStyle"
        >
        <!-- green check icon -->
        <transition name="icon">
          <svg v-show="passkeyAccepted && !loading" class="w-full h-full m-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </transition>

          <!-- red error icon -->
          <transition name="icon">
            <svg v-show="!passkeyAccepted && !loading" class="h-full w-full m-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </transition>

          <!-- gray loading icon -->
          <svg v-show="loading" class="h-full w-full m-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>

        </div>
      </div>
    </div>
    <transition name="errormessage">
        <div v-show="passkeyAccepted == false" class="text-red-600 bg-red-300 rounded-md flex justify-center text-center text-sm py-1 mt-3 -mb-1 mx-auto">
            <svg class="w-3.5 mt-0.5 h-3.5 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ connectError }} 
        </div>
    </transition>
  </div>
</template>
 
<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import socket, { setPinCode, connectSocket } from '@/js-2/RemoteSocket'
 
const digitsFromInput = reactive({
  0: null,
  1: null,
  2: null,
  3: null,
});
 
const code_0 = ref(null);
let lastPressed;
let fieldIsEmpty;
let originalTarget;

const passkeyAccepted = ref(null);
const connectError = ref("");
const loading = ref(false);


const codeStatusIndicatorStyle = computed (() => {
    if(passkeyAccepted.value && !loading.value){
        return "bg-green-400 text-green-600"
    } else if (!passkeyAccepted.value && !loading.value){
        return "bg-red-300 text-red-600"
    } else {
        return "bg-gray-400 text-gray-600"
    }
})

const passkey = computed(() => {
  return allInputsFilled() ? constructPasskey() : null;
});

onMounted(() => {
  code_0.value = document.getElementById('code_0');
  focusOnFirstInput();
});

socket.on("connect_error", (err) => {
  if(err.message == 'Invalid screencode') processPinEntered(false, "Invalid pincode entered!");
  processPinEntered(false, err)
  // else processPinEntered(false, "Whoops.. Can't do anything with this response..");
});

socket.on("connect", () => {
  processPinEntered(true);
});


function onKeyDown(event) {
    originalTarget = event.target;
    if((event.keyCode == 9 || event.keyCode == 39) && event.target.id != 'code_3'){ //arrow right
        event.target.nextElementSibling.focus();
    } else if(event.keyCode == 37 && event.target.id != 'code_0'){ //arrow left
        event.target.previousElementSibling.focus();
    }

  if((event.keyCode >= 48 && event.keyCode <= 57) ||
    (event.keyCode >= 96 && event.keyCode <= 105) && event.target.value != '' && event.target.value.keyCode != event.keyCode){
        lastPressed = event.keyCode;
        event.target.value = event.key;
        switch (originalTarget.id) {
            case 'code_0':
                digitsFromInput[0] = event.key;
                break;
            case 'code_1':
                digitsFromInput[1] = event.key;
                break;
            case 'code_2':
                digitsFromInput[2] = event.key;
                break;
            case 'code_3':
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
  }
  else if (event.keyCode == 8) {
    lastPressed = event.keyCode;
    fieldIsEmpty = event.target.value;
  } else{
      event.preventDefault();
  }
  return;
}

function onKeyUp(event) {
  if(lastPressed == event.keyCode && lastPressed != 8 && event.target.value != ''){
      nextInput(event);
  } else if(lastPressed == event.keyCode && lastPressed == 8 ){
      if(fieldIsEmpty == ""){
        previousInput(event);
        //event.target.previousElementSibling.value = '';
      }
  }
}
 
function setCursorAtLast(event){
    setTimeout(function () { event.target.selectionStart = event.target.value.length; }, 10);
    return;
}

function previousInput(event) {
  if(event.target.id != 'code_0'){
    event.target.previousElementSibling.focus();
    switch (originalTarget.id) {
    case 'code_0':
      digitsFromInput[0] = null;
      break;
    case 'code_1':
      digitsFromInput[0] = null;
      break;
    case 'code_2':
      digitsFromInput[1] = null;
      break;
    case 'code_3':
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
    if(code_0.value != null){
        code_0.value.focus();
    }
}
 
function allInputsFilled() {
    if((digitsFromInput[0] !== null &&
    digitsFromInput[1] !== null &&
    digitsFromInput[2] !== null &&
    digitsFromInput[3] !== null) && 
    (digitsFromInput[0] !== '' &&
    digitsFromInput[1] !== '' &&
    digitsFromInput[2] !== '' &&
    digitsFromInput[3] !== '')){
        makeServerConnection();
        return true;
    } else{
        return false;
    }
}

function makeServerConnection(){
    loading.value = true;
    setPinCode(constructPasskey());
    connectSocket();
}

function processPinEntered(success, reason=""){
    passkeyAccepted.value = success;
    connectError.value = reason;
    loading.value = false;
    if(!success){
        resetPinCode();
        focusOnFirstInput();
    }
}
 
function resetPinCode(){
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
    transition: all .5s ease;
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
    transition: all .7s ease;
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
    transition: all .3s ease;
}

</style>
 