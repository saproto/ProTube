<template>
    <div class="fixed z-10 inset-0 overflow-y-auto sm:-to" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center h-5/6 pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-proto_background_gray-dark/50 transition-opacity" aria-hidden="true"></div>

            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block text-center transform transition-all align-middle ">
              <div>
                  <div class="center">
                      <div class="circle2"></div>
                      {{ opacity }}
                      <div class="circle2"></div>
                  </div>
              </div>
              <div class="text-gray-200 text-xl mt-4">
                {{ message }}
              </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
  message: String,
});
</script>

<style>
.loader-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  
  .circle {
    width: 150px;
    height: 150px;
    border: 3px solid transparent;
    border-radius: 50%;
    border-top: solid white;
    border-bottom: solid white;
    margin: auto;
    padding: auto;
    animation: 2s infinite loader;
  }
  .circle2 {
    width: 150px;
    height: 150px;
    border: solid transparent;
    border-radius: 50%;
    border-top: 3px solid white;
    border-bottom: 3px solid white;
    margin: auto;
    padding: auto;
    animation: 2s infinite loader2;
  }
  .circle-after{
    transform: translateX(00px);
  }
  .circle_loader {
    width: 50px;
    height: 50px;
    background: red;
    border-radius: 50%;
    transform-origin: right center;
    animation: 2s infinite loader;
  }
  
  .center{
    margin: auto;
    animation: 4s infinite loader3;
  }
  
  @keyframes loader3 {
    0% { transform: rotate(-180deg);}
    /*//50% { transform: rotate(-1800deg);}*/
    100% { transform: rotate(360deg);}
  }
  
  @keyframes loader {
    /*0% { transform: rotate(0deg);}
    //50% { transform: rotate(-180deg);}*/
    100% { transform: rotate(360deg);}
  }
  @keyframes loader2 {
    0% { transform: rotate(0deg);}
    50% { transform: rotate(-360deg);}
    /*100% { transform: rotate(0deg);}*/
  }
</style>