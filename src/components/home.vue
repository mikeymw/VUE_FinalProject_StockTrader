<template>
  <div class="container backgroundImg">
    <transition appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown" mode="out-in">
      <div class="jumbotron text-center mt-5">
        <h1>Stock Trader Demo Project By Mike</h1>
        <h1 class="display-4">Make Sure Your Wallet Is Fat Enough!</h1>
      </div>
    </transition>
  </div>
</template>

<script>

    export default {
        name: "home",
        data(){
            return {

            }
        },
    }
</script>

<style scoped>
  .backgroundImg {
    opacity: 1;
    width: border-box;
    min-height: 100vh;
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center center;
  }
  .jumbotron {
    opacity: 0.8;
  }
</style>
